using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Server.Models
{
    public class HomeData
    {
        [BsonId]
        public string Id { get; set; } = "home_main_config";

        // Sekcja Hero[cite: 1]
        public string Tagline { get; set; } = "WIZYTÓWKI | BANNERY | POCZTÓWKI";
        public string TitleStart { get; set; } = "SUN";
        public string TitleAccent { get; set; } = "FIRE";
        public string Motto { get; set; } = "Design, który płonie pasją.";

        // Focus Items jako lista obiektów wewnątrz dokumentu[cite: 1, 5]
        public List<FocusItemData> FocusItems { get; set; } = new();
    }

    public class FocusItemData
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Size { get; set; } = "1-3";
    }
}