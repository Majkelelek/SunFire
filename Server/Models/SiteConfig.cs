using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace Server.Models
{
   public class SiteConfig
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("primaryColor")]
    public string PrimaryColor { get; set; } = "#ff4d00";

    [JsonPropertyName("backgroundColor")]
    public string BackgroundColor { get; set; } = "#050505";

    [JsonPropertyName("backgroundImageUrl")]
    public string? BackgroundImageUrl { get; set; }

    // DODAJ TO, ABY NAPRAWIĆ BŁĄD:
    [JsonPropertyName("portfolioImages")]
    public List<string> PortfolioImages { get; set; } = new();
}
}