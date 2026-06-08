using System.ComponentModel.DataAnnotations;

namespace AuthService.Api.DTOs;

public class ChangeRoleRequest
{
    [Required(ErrorMessage = "El rol es obligatorio.")]
    [RegularExpression("^(Padre|Coordinador|ADMIN)$", ErrorMessage = "El rol debe ser 'Padre', 'Coordinador' o 'ADMIN'.")]
    public string Role { get; set; } = string.Empty;
}
