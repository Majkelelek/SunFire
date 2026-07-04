using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class ContactMessage
    {
        [Required(ErrorMessage = "Imię jest wymagane.")]
        [MinLength(2), MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email jest wymagany.")]
        [EmailAddress(ErrorMessage = "Niepoprawny format adresu email.")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Temat jest wymagany.")]
        [MinLength(3), MaxLength(256)]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Treść wiadomości jest wymagana.")]
        [MinLength(10), MaxLength(2000)]
        public string Message { get; set; } = string.Empty;
    }
}