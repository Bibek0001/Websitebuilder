using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsiteAPI.Data;
using PersonalWebsiteAPI.Models;
using PersonalWebsiteAPI.Services;

namespace PersonalWebsiteAPI.Controllers;

// ─── Public Landing Content (read-only, no auth needed) ──────────────────────
[ApiController]
[Route("api/landing")]
public class LandingController : ControllerBase
{
    private readonly AppDbContext _db;
    public LandingController(AppDbContext db) => _db = db;

    [HttpGet("content")]
    public async Task<IActionResult> GetContent() =>
        Ok(await _db.LandingContents.OrderBy(l => l.Section).ToListAsync());

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates() =>
        Ok(await _db.SiteTemplates.Where(t => t.IsActive).OrderBy(t => t.SortOrder).ToListAsync());

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _db.PlatformStats.OrderBy(s => s.SortOrder).ToListAsync();
        var realUsers = await _db.Users.Where(u => u.Role == "user").CountAsync();
        var realSites = await _db.Profiles.CountAsync();

        // Dynamically inject real counts into matching stats
        foreach (var stat in stats)
        {
            var label = stat.Label.ToLower();
            if (label.Contains("user")) stat.Value = realUsers > 0 ? $"{realUsers}+" : stat.Value;
            else if (label.Contains("website") || label.Contains("built")) stat.Value = realSites > 0 ? $"{realSites}+" : stat.Value;
        }
        return Ok(stats);
    }

    [HttpGet("testimonials")]
    public async Task<IActionResult> GetTestimonials() =>
        Ok(await _db.PlatformTestimonials.Where(t => t.IsActive).ToListAsync());

    [HttpGet("features")]
    public async Task<IActionResult> GetFeatures() =>
        Ok(await _db.PlatformFeatures.Where(f => f.IsActive).OrderBy(f => f.SortOrder).ToListAsync());

    [HttpGet("users/count")]
    public async Task<IActionResult> GetUserCount() =>
        Ok(new { count = await _db.Users.Where(u => u.Role == "user").CountAsync() });

    [HttpGet("primary-color")]
    public async Task<IActionResult> GetPrimaryColor()
    {
        var setting = await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "appearance.primaryColor");
        return Ok(new { color = setting?.Value ?? "#2563eb" });
    }
}

// ─── SuperAdmin Panel ─────────────────────────────────────────────────────────
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "superadmin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SupabaseStorageService _storage;
    public AdminController(AppDbContext db, SupabaseStorageService storage) { _db = db; _storage = storage; }

    // ── Landing Content ──
    [HttpGet("content")]
    public async Task<IActionResult> GetAllContent() =>
        Ok(await _db.LandingContents.ToListAsync());

    [HttpPut("content/{key}")]
    public async Task<IActionResult> UpsertContent(string key, [FromBody] LandingContentDto dto)
    {
        var item = await _db.LandingContents.FirstOrDefaultAsync(l => l.Key == key);
        if (item == null) { item = new LandingContent { Key = key, Section = dto.Section }; _db.LandingContents.Add(item); }
        item.Value = dto.Value; item.ValueNp = dto.ValueNp; item.Section = dto.Section; item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    // ── Features ──
    [HttpGet("features")]
    public async Task<IActionResult> GetFeatures() =>
        Ok(await _db.PlatformFeatures.OrderBy(f => f.SortOrder).ToListAsync());

    [HttpPost("features")]
    public async Task<IActionResult> CreateFeature([FromBody] PlatformFeature dto) { _db.PlatformFeatures.Add(dto); await _db.SaveChangesAsync(); return Ok(dto); }

    [HttpPut("features/{id}")]
    public async Task<IActionResult> UpdateFeature(int id, [FromBody] PlatformFeature dto)
    {
        var item = await _db.PlatformFeatures.FindAsync(id); if (item == null) return NotFound();
        item.Title = dto.Title; item.TitleNp = dto.TitleNp; item.Description = dto.Description;
        item.DescriptionNp = dto.DescriptionNp; item.Icon = dto.Icon; item.IconColor = dto.IconColor;
        item.IsActive = dto.IsActive; item.SortOrder = dto.SortOrder;
        await _db.SaveChangesAsync(); return Ok(item);
    }

    [HttpDelete("features/{id}")]
    public async Task<IActionResult> DeleteFeature(int id)
    { var item = await _db.PlatformFeatures.FindAsync(id); if (item == null) return NotFound(); _db.PlatformFeatures.Remove(item); await _db.SaveChangesAsync(); return NoContent(); }

    // ── Templates ──
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates() =>
        Ok(await _db.SiteTemplates.OrderBy(t => t.SortOrder).ToListAsync());

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] SiteTemplate dto) { _db.SiteTemplates.Add(dto); await _db.SaveChangesAsync(); return Ok(dto); }

    [HttpPut("templates/{id}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] SiteTemplate dto)
    {
        var item = await _db.SiteTemplates.FindAsync(id); if (item == null) return NotFound();
        item.Name = dto.Name; item.Description = dto.Description; item.PreviewImageUrl = dto.PreviewImageUrl;
        item.Category = dto.Category; item.IsActive = dto.IsActive; item.SortOrder = dto.SortOrder;
        await _db.SaveChangesAsync(); return Ok(item);
    }

    [HttpDelete("templates/{id}")]
    public async Task<IActionResult> DeleteTemplate(int id)
    { var item = await _db.SiteTemplates.FindAsync(id); if (item == null) return NotFound(); _db.SiteTemplates.Remove(item); await _db.SaveChangesAsync(); return NoContent(); }

    // ── Stats ──
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats() =>
        Ok(await _db.PlatformStats.OrderBy(s => s.SortOrder).ToListAsync());

    [HttpPost("stats")]
    public async Task<IActionResult> CreateStat([FromBody] PlatformStat dto) { _db.PlatformStats.Add(dto); await _db.SaveChangesAsync(); return Ok(dto); }

    [HttpPut("stats/{id}")]
    public async Task<IActionResult> UpdateStat(int id, [FromBody] PlatformStat dto)
    {
        var item = await _db.PlatformStats.FindAsync(id); if (item == null) return NotFound();
        item.Label = dto.Label; item.LabelNp = dto.LabelNp; item.Value = dto.Value; item.Icon = dto.Icon; item.SortOrder = dto.SortOrder;
        await _db.SaveChangesAsync(); return Ok(item);
    }

    [HttpDelete("stats/{id}")]
    public async Task<IActionResult> DeleteStat(int id)
    { var item = await _db.PlatformStats.FindAsync(id); if (item == null) return NotFound(); _db.PlatformStats.Remove(item); await _db.SaveChangesAsync(); return NoContent(); }

    // ── Platform Testimonials ──
    [HttpGet("platform-testimonials")]
    public async Task<IActionResult> GetPlatformTestimonials() =>
        Ok(await _db.PlatformTestimonials.ToListAsync());

    [HttpPost("platform-testimonials")]
    public async Task<IActionResult> CreatePlatformTestimonial([FromBody] PlatformTestimonial dto) { _db.PlatformTestimonials.Add(dto); await _db.SaveChangesAsync(); return Ok(dto); }

    [HttpPut("platform-testimonials/{id}")]
    public async Task<IActionResult> UpdatePlatformTestimonial(int id, [FromBody] PlatformTestimonial dto)
    {
        var item = await _db.PlatformTestimonials.FindAsync(id); if (item == null) return NotFound();
        item.Name = dto.Name; item.Role = dto.Role; item.Content = dto.Content; item.PhotoUrl = dto.PhotoUrl; item.IsActive = dto.IsActive;
        await _db.SaveChangesAsync(); return Ok(item);
    }

    [HttpDelete("platform-testimonials/{id}")]
    public async Task<IActionResult> DeletePlatformTestimonial(int id)
    { var item = await _db.PlatformTestimonials.FindAsync(id); if (item == null) return NotFound(); _db.PlatformTestimonials.Remove(item); await _db.SaveChangesAsync(); return NoContent(); }

    // ── Users ──
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers() =>
        Ok(await _db.Users.Where(u => u.Role != "superadmin")
            .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.IsActive, u.CreatedAt })
            .OrderByDescending(u => u.CreatedAt).ToListAsync());

    [HttpPut("users/{id}/toggle")]
    public async Task<IActionResult> ToggleUser(int id)
    { var user = await _db.Users.FindAsync(id); if (user == null) return NotFound(); user.IsActive = !user.IsActive; await _db.SaveChangesAsync(); return Ok(new { user.Id, user.IsActive }); }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    { var user = await _db.Users.FindAsync(id); if (user == null || user.Role == "superadmin") return NotFound(); _db.Users.Remove(user); await _db.SaveChangesAsync(); return NoContent(); }

    // ── Settings — redact sensitive values on GET ──
    private static readonly HashSet<string> RedactedKeys =
        new(StringComparer.OrdinalIgnoreCase) { "smtp.password" };

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _db.PlatformSettings.OrderBy(s => s.Group).ThenBy(s => s.Key).ToListAsync();
        // Return redacted copy — never send passwords over the wire
        var result = settings.Select(s => new
        {
            s.Id, s.Key, s.Group, s.Description, s.UpdatedAt,
            Value = RedactedKeys.Contains(s.Key) ? (string.IsNullOrEmpty(s.Value) ? "" : "••••••••") : s.Value
        });
        return Ok(result);
    }

    [HttpPut("settings/{key}")]
    public async Task<IActionResult> UpsertSetting(string key, [FromBody] SettingDto dto)
    {
        var item = await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (item == null) { item = new PlatformSettings { Key = key, Group = dto.Group, Description = dto.Description ?? "" }; _db.PlatformSettings.Add(item); }
        // Don't overwrite a real password with the redaction placeholder
        if (!RedactedKeys.Contains(key) || dto.Value != "••••••••")
            item.Value = dto.Value;
        item.Group = dto.Group; if (dto.Description != null) item.Description = dto.Description; item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(); return Ok(new { item.Id, item.Key, item.Group, item.Description, item.UpdatedAt });
    }

    [HttpPut("settings")]
    public async Task<IActionResult> SaveAllSettings([FromBody] List<SettingUpdateDto> updates)
    {
        foreach (var upd in updates)
        {
            var item = await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == upd.Key);
            if (item == null) continue;
            // Don't overwrite real password with redaction placeholder
            if (RedactedKeys.Contains(upd.Key) && upd.Value == "••••••••") continue;
            item.Value = upd.Value; item.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(); return Ok(new { saved = updates.Count });
    }

    // ── Upload (admin assets like logo, banner) ──
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        try
        {
            var url = await _storage.UploadImageAsync(file, "admin");
            return Ok(new { url });
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}

public record LandingContentDto(string Value, string? ValueNp, string Section);
public record SettingDto(string Value, string Group, string? Description);
public record SettingUpdateDto(string Key, string Value);
