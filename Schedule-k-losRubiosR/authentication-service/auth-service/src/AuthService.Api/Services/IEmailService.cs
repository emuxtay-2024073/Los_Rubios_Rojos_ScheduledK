namespace AuthService.Api.Services;

public interface IEmailService
{
    Task SendVerificationEmail(string toEmail, string token);
}
