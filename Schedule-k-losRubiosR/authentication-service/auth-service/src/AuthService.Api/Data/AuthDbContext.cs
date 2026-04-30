using AuthService.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AuthService.Api.Data;

public class MongoDbContext
{
    public IMongoCollection<User> Users { get; }
    public IMongoCollection<Reminder> Reminders { get; }

    public MongoDbContext(IMongoClient client, IOptions<MongoDbSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);

        Users = database.GetCollection<User>("users");
        Reminders = database.GetCollection<Reminder>("reminders");

        Users.Indexes.CreateOne(new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true }));

        Reminders.Indexes.CreateOne(new CreateIndexModel<Reminder>(
            Builders<Reminder>.IndexKeys.Ascending(r => r.Status)));
    }
}