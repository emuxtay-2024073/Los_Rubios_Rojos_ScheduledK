using AuthService.Api.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace AuthService.Api.Data;

public static class TestUserSeeder
{
    public static async Task SeedAsync(MongoDbContext context, ILogger logger)
    {
        var seedUsers = new[]
        {
            new { Email = "admin@test.com", Password = "Admin123!", Role = "ADMIN", Username = "admin.test", Nombres = "Admin", Apellidos = "Prueba" },
            new { Email = "super_admin@test.com", Password = "SuperAdmin123!", Role = "SUPER_ADMIN", Username = "super.admin", Nombres = "Super", Apellidos = "Admin" },
            new { Email = "coordinador@test.com", Password = "Coordinator123!", Role = "COORDINADOR", Username = "coordinador.test", Nombres = "Coord", Apellidos = "Prueba" },
            new { Email = "padre@test.com", Password = "Padre123!", Role = "PADRE", Username = "padre.test", Nombres = "Padre", Apellidos = "Prueba" }
        };

        foreach (var seedUser in seedUsers)
        {
            var exists = await context.Users.Find(u => u.Email == seedUser.Email).AnyAsync();
            if (exists)
            {
                logger.LogInformation("Test user {Email} already exists. Skipping seed.", seedUser.Email);
                continue;
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = seedUser.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedUser.Password),
                Role = seedUser.Role,
                Username = seedUser.Username,
                Nombres = seedUser.Nombres,
                Apellidos = seedUser.Apellidos,
                Numero = "00000000",
                IsVerified = true,
                VerificationToken = null,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.InsertOneAsync(user);
            logger.LogInformation("Created test user {Email} with role {Role}.", user.Email, user.Role);
        }
    }
}
