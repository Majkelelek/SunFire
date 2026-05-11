using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Server.Models
{
    public class HomeData
    {
        [BsonId]
        public string Id { get; set; } = "home_main_config";


        public string Tagline { get; set; } = "WIZYTÓWKI | BANNERY | POCZTÓWKI";
        public string TitleStart { get; set; } = "SUN";
        public string TitleAccent { get; set; } = "FIRE";
        public string Motto { get; set; } = "Design, który płonie pasją.";


        public List<FocusItemData> FocusItems { get; set; } = new();
    }

    public class FocusItemData
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Size { get; set; } = "1-3";
    }
}
