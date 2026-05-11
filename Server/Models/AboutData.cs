using MongoDB.Bson.Serialization.Attributes;

namespace Server.Models
{
    public class AboutSection
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = "Nowa Sekcja";
        public string Content { get; set; } = "";
        public string Size { get; set; } = "half";
    }

    public class AboutData
    {
        [BsonId]
        public string Id { get; set; } = "about_me_main";
        

        public string ManifestoTag { get; set; } = "MANIFESTO";
        public string Title { get; set; } = "Kreatywność to moja";
        public string TitleAccent { get; set; } = "broń";
        
        public string Lead { get; set; } = "";
        public string Philosophy { get; set; } = "";
        

        public List<AboutSection> Sections { get; set; } = new List<AboutSection>();
    }
}
