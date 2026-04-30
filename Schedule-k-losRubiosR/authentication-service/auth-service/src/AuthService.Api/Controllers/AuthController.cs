using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Api.DTOs;
using AuthService.Api.Services;
using AuthService.Api.Data;
using AuthService.Api.Models;
using MongoDB.Driver;
using Swashbuckle.AspNetCore.Annotations;

namespace AuthService.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    public AuthController(MongoDbContext context, IEmailService emailService, IConfiguration config)
    {
        _context = context;
        _emailService = emailService;
        _config = config;
    }

    [HttpPost("register")]
    [SwaggerOperation(
        Summary = "Registrar nuevo usuario en Scheduled-K",
        Description = "Permite registrar padres de familia o coordinadores en el sistema de citas de Scheduled-K. Los coordinadores requieren un código secreto especial para acceder a funciones administrativas. Nota para testeo: Código secreto de coordinador: `SCHEDULEDK_COORDINATOR_SECRET`"
    )]
    [SwaggerResponse(201, "Usuario registrado correctamente. Se envió un email de verificación.")]
    [SwaggerResponse(400, "Los datos proporcionados no son válidos o el email ya está registrado.")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errores = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToArray();
            return BadRequest(new { message = "Datos inválidos.", detalles = errores });
        }

        if (await _context.Users.Find(u => u.Email == request.Email).AnyAsync())
            return BadRequest(new { message = "El usuario ya existe." });

        if (request.Role == "Coordinador")
        {
            var secret = _config["Security:CoordinatorSecret"];
            Console.WriteLine($"DEBUG: Secret esperado: '{secret}', Recibido: '{request.SecretCode}'");
            if (string.IsNullOrWhiteSpace(request.SecretCode) || request.SecretCode != secret)
            {
                return BadRequest(new { message = "Código secreto de coordinador inválido." });
            }
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            IsVerified = false,
            VerificationToken = Guid.NewGuid().ToString()
        };

        await _context.Users.InsertOneAsync(user);

        var baseUrl = _config["ApplicationUrl"] ?? "http://localhost:5065";
        var link = $"{baseUrl.TrimEnd('/')}/api/auth/verify?token={user.VerificationToken}";

        try
        {
            await _emailService.SendVerificationEmail(user.Email, user.VerificationToken!);
            return Ok(new { message = "Registro exitoso. Revisa tu correo.", token = user.VerificationToken });
        }
        catch (Exception ex)
        {
            return Ok(new { message = "Registro ok, pero falló el correo.", verificationLink = link, error = ex.Message });
        }
    }

    [HttpGet("verify")]
    [SwaggerOperation(
        Summary = "Verificar cuenta de usuario",
        Description = "Activa la cuenta del usuario haciendo clic en el enlace enviado por email. Este paso es obligatorio antes de poder iniciar sesión."
    )]
    [SwaggerResponse(200, "Cuenta verificada exitosamente. Ahora puedes iniciar sesión.")]
    [SwaggerResponse(400, "El token de verificación es inválido o ya fue usado.")]
    public async Task<IActionResult> Verify(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return BadRequest("Token requerido.");

        var filter = Builders<User>.Filter.Eq(u => u.VerificationToken, token.Trim());
        var user = await _context.Users.Find(filter).FirstOrDefaultAsync();

        if (user == null) return BadRequest("Token inválido.");

        var update = Builders<User>.Update
            .Set(u => u.IsVerified, true)
            .Set(u => u.VerificationToken, null);

        await _context.Users.UpdateOneAsync(filter, update);

        return Ok("Cuenta verificada correctamente");
    }

    [HttpPost("login")]
    [SwaggerOperation(
        Summary = "Iniciar sesión en el sistema",
        Description = "Autentica al usuario con email y contraseña. Devuelve un token JWT que debe usarse en las cabeceras de las demás peticiones."
    )]
    [SwaggerResponse(200, "Login exitoso. Recibirás un token JWT para usar en futuras peticiones.")]
    [SwaggerResponse(401, "Credenciales incorrectas o la cuenta aún no ha sido verificada por email.")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Credenciales incorrectas." });

        if (!user.IsVerified)
            return Unauthorized(new { message = "Cuenta no verificada." });

        try 
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _config["Jwt:Key"] ?? "Qu3_R3gr353_3I_Mauu_La_Un0_m0n3da";
            var key = Encoding.UTF8.GetBytes(keyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id.ToString()),
                    new Claim("email", user.Email),
                    new Claim("role", user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = _config["Jwt:Issuer"] ?? "AuthService",
                Audience = _config["Jwt:Audience"] ?? "ScheduleK_Clients",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new {
                message = "Login exitoso",
                token = tokenString,
                user = new { user.Id, user.Email, user.Role }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al generar el token", details = ex.Message });
        }
    }

    [HttpGet("user/{id}")]
    [SwaggerOperation(
        Summary = "Obtener información de un usuario",
        Description = "Recupera la información básica de un usuario específico por su ID. Requiere autenticación con token JWT."
    )]
    [SwaggerResponse(200, "Información del usuario obtenida correctamente.")]
    [SwaggerResponse(401, "No autorizado. Debes enviar un token JWT válido.")]
    [SwaggerResponse(404, "Usuario no encontrado en el sistema.")]
    public async Task<IActionResult> GetUser(string id)
    {
        if (!Guid.TryParse(id, out var userId))
            return BadRequest(new { message = "ID inválido" });

        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        var internalSecret = _config["Internal:Secret"];

        if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer "))
        {
            var authResult = await HttpContext.AuthenticateAsync();
            if (!authResult.Succeeded)
                return Unauthorized(new { message = "Token inválido." });
        }
        else
        {
            if (string.IsNullOrWhiteSpace(internalSecret) || Request.Headers["X-Internal-Secret"] != internalSecret)
                return Unauthorized(new { message = "No autorizado." });
        }

        var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        return Ok(new { user.Id, user.Email, user.Role });
    }
}
