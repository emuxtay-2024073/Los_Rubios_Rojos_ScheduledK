using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using AuthService.Api.Data;
using AuthService.Api.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RemindersController : ControllerBase
{
    private readonly MongoDbContext _context;

    public RemindersController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [SwaggerOperation(
        Summary = "Obtener recordatorios",
        Description = "Lista todos los mensajes de recordatorio que avisan al padre sobre sus citas programadas."
    )]
    [SwaggerResponse(200, "Lista de recordatorios obtenida correctamente.")]
    public async Task<IActionResult> GetReminders()
    {
        var reminders = await _context.Reminders
            .Find(_ => true)
            .ToListAsync();

        return Ok(reminders);
    }
}
