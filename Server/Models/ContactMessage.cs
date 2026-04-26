using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class ContactMessage
    {
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;
        [MaxLength(256)]
        public string Subject { get; set; } = string.Empty;
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;
    }
}