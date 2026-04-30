using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuthService.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendVerificationEmail(string toEmail, string token)
    {
        var senderEmail = _config["EmailSettings:Email"]
            ?? throw new InvalidOperationException("Email not configured");

        var password = _config["EmailSettings:Password"]
            ?? throw new InvalidOperationException("Email password not configured");

        var host = _config["EmailSettings:Host"] ?? "smtp.gmail.com";
        var port = int.TryParse(_config["EmailSettings:Port"], out var p) ? p : 587;

        var baseUrl = _config["ApplicationUrl"] ?? "http://localhost:5066";
        var link = $"{baseUrl.TrimEnd('/')}/api/auth/verify?token={token}";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Sistema Citas", senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Verificación de cuenta";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <h2>Confirma tu cuenta</h2>
                <p>Haz clic en el siguiente enlace:</p>
                <a href='{link}'>Confirmar cuenta</a>
            "
        };

        var secureOption = port switch
        {
            465 => SecureSocketOptions.SslOnConnect,
            587 => SecureSocketOptions.StartTls,
            _ => SecureSocketOptions.Auto
        };

        using var smtp = new SmtpClient();

        try
        {
            smtp.Timeout = 30000;

            await smtp.ConnectAsync(host, port, secureOption);
            await smtp.AuthenticateAsync(senderEmail, password);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Correo enviado exitosamente a {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando correo a {Email}", toEmail);

            Console.WriteLine($"\n[AVISO] Falló el correo. Link de verificación: {link}\n");

            throw;
        }
    }
}