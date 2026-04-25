using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Server.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? CurrentToken { get; set; }
    }

    // TA DEFINICJA ZOSTAJE TYLKO TUTAJ
    public class LoginRequest 
    { 
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; 
    }
}