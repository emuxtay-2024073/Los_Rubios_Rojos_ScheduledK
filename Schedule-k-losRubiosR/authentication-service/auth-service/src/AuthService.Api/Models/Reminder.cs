using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Reminder
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string? AppointmentId { get; set; } // ID de la cita en el servicio Node

    public DateTime EventDate { get; set; }

    public string Email { get; set; } = string.Empty;

    public bool Confirmed { get; set; }

    public string Status { get; set; } = string.Empty;
}