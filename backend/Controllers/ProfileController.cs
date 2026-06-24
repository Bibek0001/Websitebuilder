using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsiteAPI.Data;
using PersonalWebsiteAPI.Models;
using System.Security.Claims;

namespace PersonalWebsiteAPI.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ProfileController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.Slug == slug);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [Authorize]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] Profile dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();

        profile.FullName = dto.FullName;
        profile.Tagline = dto.Tagline;
        profile.Bio = dto.Bio;
        profile.Email = dto.Email;
        profile.Linkedin = dto.Linkedin;
        profile.Github = dto.Github;
        profile.Facebook = dto.Facebook;
        profile.Whatsapp = dto.Whatsapp;
        profile.CompanyWebsite = dto.CompanyWebsite;
        if (dto.SelectedTemplate != null) profile.SelectedTemplate = dto.SelectedTemplate;
        if (dto.AccentColor != null) profile.AccentColor = dto.AccentColor;
        // Validate accent color is a valid hex code
        if (dto.AccentColor != null)
        {
            var hex = dto.AccentColor.Trim();
            if (System.Text.RegularExpressions.Regex.IsMatch(hex, @"^#[0-9A-Fa-f]{6}$"))
                profile.AccentColor = hex;
        }
        // About section fields
        profile.WhereImFrom = dto.WhereImFrom;
        profile.CurrentlyDoing = dto.CurrentlyDoing;
        profile.MyGoals = dto.MyGoals;
        profile.MyPassion = dto.MyPassion;
        profile.StatOneValue = dto.StatOneValue;
        profile.StatOneLabel = dto.StatOneLabel;
        profile.StatTwoValue = dto.StatTwoValue;
        profile.StatTwoLabel = dto.StatTwoLabel;
        profile.StatThreeValue = dto.StatThreeValue;
        profile.StatThreeLabel = dto.StatThreeLabel;
        profile.StatFourValue = dto.StatFourValue;
        profile.StatFourLabel = dto.StatFourLabel;
        // Skills section heading
        if (dto.SkillsBadge != null) profile.SkillsBadge = dto.SkillsBadge;
        if (dto.SkillsTitle != null) profile.SkillsTitle = dto.SkillsTitle;
        if (dto.SkillsSubtitle != null) profile.SkillsSubtitle = dto.SkillsSubtitle;

        await _db.SaveChangesAsync();
        return Ok(profile);
    }

    private static readonly HashSet<string> AllowedImageExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    private static readonly HashSet<string> AllowedCvExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".doc", ".docx" };

    private const long MaxImageSize = 5 * 1024 * 1024;  // 5 MB
    private const long MaxCvSize    = 10 * 1024 * 1024; // 10 MB

    [Authorize]
    [HttpPost("photo")]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });
        if (file.Length > MaxImageSize)
            return BadRequest(new { message = "Image must be under 5 MB." });
        var ext = Path.GetExtension(file.FileName);
        if (!AllowedImageExtensions.Contains(ext))
            return BadRequest(new { message = "Only JPG, PNG, WEBP, GIF images are allowed." });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await SaveFile(file, "photos", AllowedImageExtensions);
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();

        // Delete old photo file if it exists
        DeleteOldFile(profile.PhotoUrl);

        profile.PhotoUrl = url;
        await _db.SaveChangesAsync();
        return Ok(new { url });
    }

    [Authorize]
    [HttpDelete("cv")]
    public async Task<IActionResult> RemoveCV()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();

        DeleteOldFile(profile.CvUrl);
        profile.CvUrl = null;
        await _db.SaveChangesAsync();
        return Ok(new { message = "CV removed." });
    }

    [Authorize]
    [HttpPost("cv")]
    public async Task<IActionResult> UploadCV(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });
        if (file.Length > MaxCvSize)
            return BadRequest(new { message = "CV must be under 10 MB." });
        var ext = Path.GetExtension(file.FileName);
        if (!AllowedCvExtensions.Contains(ext))
            return BadRequest(new { message = "Only PDF, DOC, DOCX files are allowed." });

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await SaveFile(file, "cvs", AllowedCvExtensions);
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();

        // Delete old CV file if it exists
        DeleteOldFile(profile.CvUrl);

        profile.CvUrl = url;
        await _db.SaveChangesAsync();
        return Ok(new { url });
    }

    private async Task<string> SaveFile(IFormFile file, string folder, HashSet<string> allowedExts)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExts.Contains(ext))
            throw new InvalidOperationException("File type not allowed.");

        var uploads = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", folder);
        Directory.CreateDirectory(uploads);
        // Use a random GUID name — never trust the original filename
        var fileName = $"{Guid.NewGuid()}{ext}";
        var path = Path.Combine(uploads, fileName);
        using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/uploads/{folder}/{fileName}";
    }

    private void DeleteOldFile(string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return;
        try
        {
            var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", relativeUrl.TrimStart('/'));
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);
        }
        catch { /* best-effort cleanup */ }
    }
}
