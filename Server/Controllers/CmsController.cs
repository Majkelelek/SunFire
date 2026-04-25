using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using Server.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

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

            // Inicjalizacja Cloudinary danymi z .env
            var account = new Account(
                Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME"),
                Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY"),
                Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
            );
            _cloudinary = new Cloudinary(account);
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
                newData.Id = existing.Id;
                await _config.ReplaceOneAsync(c => c.Id == existing.Id, newData);
            }

            return Ok(new { message = "Zapisano kolory w MongoDB!" });
        }

        [HttpPost("upload-bg")]
        [Authorize]
        public async Task<IActionResult> UploadBackground(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Nie wybrano pliku");

            // 1. Przesyłanie do Cloudinary
            var uploadResult = new ImageUploadResult();

            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "sunfire_backgrounds", // Folder w Twoim panelu Cloudinary
                    Transformation = new Transformation().Quality("auto").FetchFormat("auto") 
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            if (uploadResult.Error != null) 
                return BadRequest(uploadResult.Error.Message);

            // 2. Pobieramy bezpieczny URL z chmury
            var url = uploadResult.SecureUrl.ToString();

            // 3. Aktualizujemy bazę MongoDB linkiem do Cloudinary
            var existing = await _config.Find(_ => true).FirstOrDefaultAsync();
            
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

            // Aktualizujemy dokument, ustawiając URL na null
            var update = Builders<SiteConfig>.Update.Set(c => c.BackgroundImageUrl, null);
            await _config.UpdateOneAsync(_ => true, update);

            return Ok(new { message = "Zdjęcie tła zostało usunięte" });
        }
        [HttpPost("upload-image")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Brak pliku");

            long maxFileSize = 10 * 1024 * 1024; 
                if (file.Length > maxFileSize)
                {
                    return BadRequest("Plik przekracza limit 10MB.");
                }
                
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
    }
    
}