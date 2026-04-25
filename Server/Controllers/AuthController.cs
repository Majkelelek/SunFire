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
        private const string CookieName = "sunfire_auth"; // Jedna nazwa dla całego pliku

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

            // --- ZAPISUJEMY TOKEN W MONGODB ---
            var update = Builders<User>.Update.Set(u => u.CurrentToken, tokenString);
            await _users.UpdateOneAsync(u => u.Id == user.Id, update);

            // --- WYSYŁAMY CIASTKO (z poprawnymi opcjami) ---
            Response.Cookies.Append(CookieName, tokenString, new CookieOptions {
                HttpOnly = true,
                Secure = false, // Zmień na true na produkcji (HTTPS)
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Expires = DateTime.Now.AddHours(4)
            });

            return Ok(new { message = "Zalogowano" });
        }

        [HttpGet("check")]
        public async Task<IActionResult> Check()
        {
            // 1. Pobieramy token z ciasteczka
            var tokenFromCookie = Request.Cookies[CookieName];

            if (string.IsNullOrEmpty(tokenFromCookie))
            {
                return Ok(new { isAuthenticated = false });
            }

            // 2. SPRAWDZAMY W BAZIE CZY TEN TOKEN ISTNIEJE
            var user = await _users.Find(u => u.CurrentToken == tokenFromCookie).FirstOrDefaultAsync();

            if (user == null)
            {
                // Token jest w przeglądarce, ale nie ma go w bazie (ktoś go unieważnił)
                Response.Cookies.Delete(CookieName);
                return Ok(new { isAuthenticated = false });
            }

            return Ok(new { 
                isAuthenticated = true,
                username = user.Username 
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var tokenFromCookie = Request.Cookies[CookieName];

            if (!string.IsNullOrEmpty(tokenFromCookie))
            {
                // --- USUWAMY TOKEN Z BAZY ---
                var update = Builders<User>.Update.Set(u => u.CurrentToken, null);
                await _users.UpdateOneAsync(u => u.CurrentToken == tokenFromCookie, update);
            }

            // --- USUWAMY CIASTKO (musi mieć te same opcje co w Login!) ---
            Response.Cookies.Delete(CookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // musi być identyczne jak w Login
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });

            return Ok(new { message = "Wylogowano pomyślnie" });
        }
    }
}