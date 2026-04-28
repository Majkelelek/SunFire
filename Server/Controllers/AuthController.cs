using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MongoDB.Driver;
using Server.Models;
using Microsoft.AspNetCore.Authorization;
using Server.DTOs;

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
            
            if (user == null) 
                return Unauthorized("Błędne dane logowania");

            // 1. Używamy UtcNow dla spójności na Azure
            if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
            {
                var remainingTime = Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
                return BadRequest($"Zbyt wiele nieudanych prób. Konto zablokowane na jeszcze {remainingTime} min.");
            }

            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            {
                int newAttempts = user.FailedAttempts + 1;
                var updateDef = Builders<User>.Update.Set(u => u.FailedAttempts, newAttempts);

                if (newAttempts >= 5)
                {
                    // Blokada na podstawie UTC
                    updateDef = updateDef.Set(u => u.LockoutEnd, DateTime.UtcNow.AddMinutes(15));
                    await _users.UpdateOneAsync(u => u.Id == user.Id, updateDef);
                    return BadRequest("Przekroczono limit prób. Konto zablokowane na 15 minut.");
                }

                await _users.UpdateOneAsync(u => u.Id == user.Id, updateDef);
                return Unauthorized(new { message = "Błędne dane logowania", remainingAttempts = 5 - newAttempts });
            }

            // 3. Sukces
            var claims = new[] { 
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, "Admin")
            };
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(4), // UTC!
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            var successUpdate = Builders<User>.Update
                .Set(u => u.FailedAttempts, 0)
                .Set(u => u.LockoutEnd, null)
                .Set(u => u.CurrentToken, tokenString);
                
            await _users.UpdateOneAsync(u => u.Id == user.Id, successUpdate);

            // Sprawdzenie czy jesteśmy na produkcji
            var isProd = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development";

            // Wysyłka ciasteczka
            Response.Cookies.Append(CookieName, tokenString, new CookieOptions {
                HttpOnly = true,
                Secure = true, // Na Azure ZAWSZE true (wymagane dla SameSite=None)
                SameSite = SameSiteMode.None, 
                Path = "/",
                Expires = DateTime.UtcNow.AddHours(4)
            });

            return Ok(new { message = "Zalogowano" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var tokenFromCookie = Request.Cookies[CookieName];

            if (!string.IsNullOrEmpty(tokenFromCookie))
            {
                var update = Builders<User>.Update.Set(u => u.CurrentToken, null);
                await _users.UpdateOneAsync(u => u.CurrentToken == tokenFromCookie, update);
            }

            // MUSI mieć te same parametry co w Login, inaczej przeglądarka nie usunie ciastka!
            Response.Cookies.Delete(CookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            return Ok(new { message = "Wylogowano pomyślnie" });
        }
        [HttpPost("register")]
        [Authorize] 
        public async Task<IActionResult> Register([FromBody] LoginRequest request)
        {
            // 1. Walidacja danych wejściowych
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Nazwa użytkownika i hasło są wymagane.");
            }

            // 2. Sprawdzenie, czy użytkownik o takiej nazwie już istnieje
            var existingUser = await _users.Find(u => u.Username.ToLower() == request.Username.ToLower()).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return BadRequest("Użytkownik o podanej nazwie już istnieje.");
            }

            // 3. Tworzenie nowego użytkownika z bezpiecznie zahashowanym hasłem
            var newUser = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FailedAttempts = 0,
                LockoutEnd = null
            };

            // 4. Zapis do bazy danych
            await _users.InsertOneAsync(newUser);

            return Ok(new { message = "Konto nowego administratora zostało pomyślnie utworzone." });
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
    }
}