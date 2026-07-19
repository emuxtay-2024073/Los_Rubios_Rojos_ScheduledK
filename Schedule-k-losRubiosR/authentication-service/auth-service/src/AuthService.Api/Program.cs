using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System.Text;
using System.Text.Json;
using AuthService.Api.Data;
using AuthService.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers con configuración JSON case-insensitive
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDb"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddSingleton<MongoDbContext>();

// Services
builder.Services.AddScoped<IEmailService, EmailService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // IMPORTANTE: por defecto, JwtSecurityTokenHandler remapea el claim corto "role"
        // (y otros como "sub", "email") a URIs largas de ClaimTypes (p.ej.
        // "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"). Como abajo
        // configuramos RoleClaimType = "role" (nombre corto), ese remapeo automático
        // hacía que [Authorize(Roles = "...")] nunca encontrara el claim de rol y
        // devolviera 403 aunque el token tuviera el rol correcto. Desactivamos el
        // remapeo para que los claims se lean tal cual vienen en el JWT.
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            NameClaimType = "unique_name",
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5174", "http://127.0.0.1:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API de Autenticación - Scheduled-K",
        Version = "v1",
        Description = "Servicio de autenticación para el sistema de gestión de citas de Scheduled-K. Maneja registro de usuarios, verificación de emails y autenticación JWT."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese el token JWT con el formato: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    c.EnableAnnotations();
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("TestUserSeeder");
    var context = services.GetRequiredService<MongoDbContext>();

    await TestUserSeeder.SeedAsync(context, logger);
}

// CORS
app.UseCors("AllowReactApp");

// Swagger middleware
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Auth Service API v1");
    c.RoutePrefix = "swagger";
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var swaggerBase = builder.Configuration["ASPNETCORE_URLS"] ?? builder.Configuration["urls"] ?? "http://localhost:5066";
if (swaggerBase.Contains(";"))
{
    swaggerBase = swaggerBase.Split(';', StringSplitOptions.RemoveEmptyEntries).First();
}
var swaggerUrl = swaggerBase.TrimEnd('/') + "/swagger";
app.Logger.LogInformation("Swagger UI disponible en {SwaggerUrl}", swaggerUrl);

app.Run();