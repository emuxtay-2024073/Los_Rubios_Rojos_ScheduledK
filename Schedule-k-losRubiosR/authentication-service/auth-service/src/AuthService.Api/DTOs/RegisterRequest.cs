using System.ComponentModel.DataAnnotations;

namespace AuthService.Api.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    [RegularExpression("^(Padre|Coordinador)$", ErrorMessage = "El rol debe ser 'Padre' o 'Coordinador'.")]
    public string Role { get; set; } = string.Empty;

    public string? SecretCode { get; set; }
}