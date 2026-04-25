using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Server.Models
{
    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Title { get; set; } = "";
        public string? ImageUrl { get; set; }
        public string Type { get; set; } = "image"; // To pole jest kluczowe!
        public int SlotNumber { get; set; }
        public string? Content { get; set; }
        
    }
}