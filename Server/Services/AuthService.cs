using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Server.Models;
using Server.Repositories;
using System;
using System.Threading.Tasks;

namespace Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMongoRepository<User> _repository;
        private readonly string _jwtKey;

        public AuthService(IMongoRepository<User> repository)
        {
            _repository = repository;
            _jwtKey = Environment.GetEnvironmentVariable("SUNFIRE_JWT_KEY") ?? throw new Exception("Brak SUNFIRE_JWT_KEY");
        }

        public async Task<(bool IsSuccess, string Message, int RemainingAttempts, string? Token)> LoginAsync(string username, string password)
        {
            var user = await _repository.FindOneAsync(u => u.Username == username);
            if (user == null) 
                return (false, "Błędne dane logowania", 0, null);

            if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
            {
                var remainingTime = Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
                return (false, $"Zbyt wiele nieudanych prób. Konto zablokowane na jeszcze {remainingTime} min.", 0, null);
            }

            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                int newAttempts = user.FailedAttempts + 1;
                user.FailedAttempts = newAttempts;

                if (newAttempts >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                    await _repository.ReplaceOneAsync(user.Id!, user);
                    return (false, "Przekroczono limit prób. Konto zablokowane na 15 minut.", 0, null);
                }

                await _repository.ReplaceOneAsync(user.Id!, user);
                return (false, "Błędne dane logowania", 5 - newAttempts, null);
            }

            var claims = new[] { 
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, "Admin")
            };
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(4),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            user.FailedAttempts = 0;
            user.LockoutEnd = null;
            user.CurrentToken = tokenString;
            
            await _repository.ReplaceOneAsync(user.Id!, user);

            return (true, "Zalogowano", 0, tokenString);
        }

        public async Task LogoutAsync(string token)
        {
            if (string.IsNullOrEmpty(token)) return;
            var user = await _repository.FindOneAsync(u => u.CurrentToken == token);
            if (user != null)
            {
                user.CurrentToken = null;
                await _repository.ReplaceOneAsync(user.Id!, user);
            }
        }

        public async Task<(bool IsSuccess, string Message)> RegisterAsync(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return (false, "Nazwa użytkownika i hasło są wymagane.");
            }

            var existingUser = await _repository.FindOneAsync(u => u.Username.ToLower() == username.ToLower());
            if (existingUser != null)
            {
                return (false, "Użytkownik o podanej nazwie już istnieje.");
            }

            var newUser = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                FailedAttempts = 0,
                LockoutEnd = null
            };
            await _repository.InsertAsync(newUser);
            
            return (true, "Konto nowego administratora zostało pomyślnie utworzone.");
        }

        public async Task<(bool IsValid, string? Username)> CheckSessionAsync(string token)
        {
            if (string.IsNullOrEmpty(token)) return (false, null);
            var user = await _repository.FindOneAsync(u => u.CurrentToken == token);
            if (user == null) return (false, null);
            return (true, user.Username);
        }
    }
}
