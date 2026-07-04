using System.ComponentModel.DataAnnotations;

namespace Server.DTOs
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Nazwa użytkownika jest wymagana.")]
        [MaxLength(50, ErrorMessage = "Nazwa użytkownika nie może przekraczać 50 znaków.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Hasło jest wymagane.")]
        [MaxLength(100, ErrorMessage = "Hasło nie może przekraczać 100 znaków.")]
        public string Password { get; set; } = string.Empty;
    }
}