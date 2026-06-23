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

        await _db.SaveChangesAsync();
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("photo")]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await SaveFile(file, "photos");
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();
        profile.PhotoUrl = url;
        await _db.SaveChangesAsync();
        return Ok(new { url });
    }

    [Authorize]
    [HttpPost("cv")]
    public async Task<IActionResult> UploadCV(IFormFile file)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await SaveFile(file, "cvs");
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();
        profile.CvUrl = url;
        await _db.SaveChangesAsync();
        return Ok(new { url });
    }

    private async Task<string> SaveFile(IFormFile file, string folder)
    {
        var uploads = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", folder);
        Directory.CreateDirectory(uploads);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var path = Path.Combine(uploads, fileName);
        using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/uploads/{folder}/{fileName}";
    }
}
