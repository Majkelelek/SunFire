using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MongoDB.Driver;
using Server.Models;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;
        private readonly string _jwtKey;

        public AuthController(IMongoClient client)
        {
            var database = client.GetDatabase("SunfireDB");
            _users = database.GetCollection<User>("Users");
            _jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY")!;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _users.Find(u => u.Username == req.Username).FirstOrDefaultAsync();
            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized("Błędne dane logowania");

            // Claims są niezbędne, żeby [Authorize] działało poprawnie
            var claims = new[] { 
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, "Admin")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(4),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // Wysyłamy ciastko do przeglądarki
            Response.Cookies.Append("sunfire_auth", tokenString, new CookieOptions {
                HttpOnly = true,
                Secure = false, // false na localhost (brak HTTPS)
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Expires = DateTime.Now.AddHours(4)
            });

            return Ok(new { message = "Zalogowano" });
        }

        [HttpPost("register")]
        [Authorize] // Tylko Ty (MK) możesz zarejestrować np. grafika
        public async Task<IActionResult> Register([FromBody] LoginRequest req)
        {
            var exists = await _users.Find(u => u.Username == req.Username).AnyAsync();
            if (exists) return BadRequest("Użytkownik już istnieje");

            var newUser = new User {
                Username = req.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
            };

            await _users.InsertOneAsync(newUser);
            return Ok("Dodano nowego użytkownika");
        }
    }
}