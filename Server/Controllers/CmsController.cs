using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using Server.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.IO;
using System.Linq;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CmsController : ControllerBase
    {
        private readonly IMongoCollection<SiteConfig> _config;
        private readonly Cloudinary _cloudinary;

        public CmsController(IMongoClient client)
        {
            var database = client.GetDatabase("SunfireDB");
            _config = database.GetCollection<SiteConfig>("Settings");

            // 1. POPRAWKA: Pobieramy zmienne
            var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
            var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
            var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

            // Jeśli brakuje kluczy, logujemy błąd, ale nie wysypujemy całej aplikacji (wtedy po prostu upload nie zadziała)
            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                Console.WriteLine("OSTRZEŻENIE: Brak zmiennych CLOUDINARY w środowisku! Upload obrazów nie będzie działał.");
            }
            else
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                _cloudinary = new Cloudinary(account);
            }
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var settings = await _config.Find(_ => true).FirstOrDefaultAsync();
            return Ok(settings ?? new SiteConfig());
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Save([FromBody] SiteConfig newData)
        {
            var existing = await _config.Find(_ => true).FirstOrDefaultAsync();

            if (existing == null)
            {
                newData.Id = null; 
                await _config.InsertOneAsync(newData);
            }
            else
            {
                var updateDefinition = Builders<SiteConfig>.Update
                    .Set(c => c.PrimaryColor, newData.PrimaryColor)
                    .Set(c => c.BackgroundColor, newData.BackgroundColor);

                await _config.UpdateOneAsync(c => c.Id == existing.Id, updateDefinition);
            }

            return Ok(new { message = "Zapisano kolory w MongoDB!" });
        }

        [HttpPost("upload-bg")]
        [Authorize]
        public async Task<IActionResult> UploadBackground(IFormFile file)
        {
            if (_cloudinary == null) return StatusCode(500, "Cloudinary nie jest skonfigurowane.");
            if (file == null || file.Length == 0) return BadRequest("Nie wybrano pliku");

            if (!IsValidImage(file))
                return BadRequest("Niedozwolony typ pliku. Dozwolone są tylko obrazy (JPG, PNG, WEBP, GIF).");

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest("Plik przekracza limit 10MB.");

            // Opcjonalnie: Usuń stare tło z Cloudinary przed dodaniem nowego
            var existing = await _config.Find(_ => true).FirstOrDefaultAsync();
            if (existing != null && !string.IsNullOrEmpty(existing.BackgroundImageUrl))
            {
                await DeleteFromCloudinary(existing.BackgroundImageUrl);
            }

            var uploadResult = new ImageUploadResult();
            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "sunfire_backgrounds",
                    Transformation = new Transformation().Quality("auto").FetchFormat("auto") 
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            if (uploadResult.Error != null) 
                return BadRequest(uploadResult.Error.Message);

            var url = uploadResult.SecureUrl.ToString();
            
            if (existing == null) {
                await _config.InsertOneAsync(new SiteConfig { BackgroundImageUrl = url });
            } else {
                await _config.UpdateOneAsync(_ => true, 
                    Builders<SiteConfig>.Update.Set(c => c.BackgroundImageUrl, url));
            }

            return Ok(new { imageUrl = url });
        }

        [HttpDelete("remove-bg")]
        [Authorize]
        public async Task<IActionResult> RemoveBackground()
        {
            var existing = await _config.Find(_ => true).FirstOrDefaultAsync();
            if (existing == null || string.IsNullOrEmpty(existing.BackgroundImageUrl))
                return BadRequest("Brak zdjęcia do usunięcia");

            // 2. POPRAWKA: Usunięcie starego pliku bezpośrednio z Cloudinary
            if (_cloudinary != null)
            {
                await DeleteFromCloudinary(existing.BackgroundImageUrl);
            }

            var update = Builders<SiteConfig>.Update.Set(c => c.BackgroundImageUrl, null);
            await _config.UpdateOneAsync(_ => true, update);

            return Ok(new { message = "Zdjęcie tła zostało usunięte" });
        }

        [HttpPost("upload-image")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (_cloudinary == null) return StatusCode(500, "Cloudinary nie jest skonfigurowane.");
            if (file == null || file.Length == 0) return BadRequest("Brak pliku");

            if (!IsValidImage(file))
                return BadRequest("Niedozwolony typ pliku. Dozwolone są tylko obrazy (JPG, PNG, WEBP, GIF).");

            long maxFileSize = 10 * 1024 * 1024; 
            if (file.Length > maxFileSize)
                return BadRequest("Plik przekracza limit 10MB.");
                
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "portfolio_projects",
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            return Ok(new { url = result.SecureUrl.ToString() });
        }

        private bool IsValidImage(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
                return false;

            var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            return true;
        }

        // --- METODA POMOCNICZA: Usuwanie z Cloudinary ---
        private async Task DeleteFromCloudinary(string fileUrl)
        {
            try
            {
                // Wyciąganie Public ID z URL (ostatni segment bez rozszerzenia, razem ze ścieżką folderu)
                var uri = new Uri(fileUrl);
                var segments = uri.Segments;
                // Cloudinary URL format: /.../upload/v1234567/folder/filename.ext
                var uploadIndex = Array.FindIndex(segments, s => s == "upload/");
                if(uploadIndex > -1 && segments.Length > uploadIndex + 2)
                {
                    // Pomijamy 'v1234567/' (wersję) i sklejamy resztę
                    var publicIdWithExt = string.Join("", segments.Skip(uploadIndex + 2)); 
                    var publicId = Path.ChangeExtension(publicIdWithExt, null); // Usuwamy .jpg / .png
                    
                    await _cloudinary.DestroyAsync(new DeletionParams(publicId));
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Nie udało się usunąć obrazu z chmury: {ex.Message}");
            }
        }
    }
}