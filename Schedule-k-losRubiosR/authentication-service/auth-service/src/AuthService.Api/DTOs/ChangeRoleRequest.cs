using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AuthService.Api.DTOs;

public class ChangeRoleRequest
{
    [Required(ErrorMessage = "El rol es obligatorio.")]
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    public bool Validate(out string error)
    {
        error = string.Empty;
        if (string.IsNullOrWhiteSpace(Role))
        {
            error = "El rol es obligatorio.";
            return false;
        }

        var normalizedRole = Role.Trim().ToLower();
        var allowedRoles = new[] { "padre", "coordinador", "admin", "super_admin" };

        if (!allowedRoles.Contains(normalizedRole))
        {
            error = "El rol debe ser 'Padre', 'Coordinador', 'Admin' o 'Super_Admin'.";
            return false;
        }

        return true;
    }
}
