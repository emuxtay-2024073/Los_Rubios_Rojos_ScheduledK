using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AuthService.Api.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = false;
    public string? VerificationToken { get; set; }
    public DateTime CreatedAt { get; set; }

    public User()
    {
        CreatedAt = DateTime.UtcNow;
    }
}