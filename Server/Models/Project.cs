using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace Server.Models
{
    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [JsonPropertyName("title")] // Wymusza małą literę w JSON
        public string? Title { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; } // "image" lub "text"

        [JsonPropertyName("content")]
        public string? Content { get; set; } // Tu będzie Twój tekst notatki

        [JsonPropertyName("imageUrl")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("slotNumber")]
        public int SlotNumber { get; set; }
        
    }
}