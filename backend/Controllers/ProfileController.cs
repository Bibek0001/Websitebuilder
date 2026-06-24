using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsiteAPI.Data;
using PersonalWebsiteAPI.Models;
using PersonalWebsiteAPI.Services;
using System.Security.Claims;

namespace PersonalWebsiteAPI.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly CloudinaryService _cloudinary;

    public ProfileController(AppDbContext db, CloudinaryService cloudinary)
    {
        _db = db;
        _cloudinary = cloudinary;
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

        profile.FullName        = dto.FullName;
        profile.Tagline         = dto.Tagline;
        profile.Bio             = dto.Bio;
        profile.Email           = dto.Email;
        profile.Linkedin        = dto.Linkedin;
        profile.Github          = dto.Github;
        profile.Facebook        = dto.Facebook;
        profile.Whatsapp        = dto.Whatsapp;
        profile.CompanyWebsite  = dto.CompanyWebsite;

        if (dto.SelectedTemplate != null) profile.SelectedTemplate = dto.SelectedTemplate;

        // Validate accent color
        if (dto.AccentColor != null)
        {
            var hex = dto.AccentColor.Trim();
            if (System.Text.RegularExpressions.Regex.IsMatch(hex, @"^#[0-9A-Fa-f]{6}$"))
                profile.AccentColor = hex;
        }

        // About section
        profile.WhereImFrom     = dto.WhereImFrom;
        profile.CurrentlyDoing  = dto.CurrentlyDoing;
        profile.MyGoals         = dto.MyGoals;
        profile.MyPassion       = dto.MyPassion;
        profile.StatOneValue    = dto.StatOneValue;
        profile.StatOneLabel    = dto.StatOneLabel;
        profile.StatTwoValue    = dto.StatTwoValue;
        profile.StatTwoLabel    = dto.StatTwoLabel;
        profile.StatThreeValue  = dto.StatThreeValue;
        profile.StatThreeLabel  = dto.StatThreeLabel;
        profile.StatFourValue   = dto.StatFourValue;
        profile.StatFourLabel   = dto.StatFourLabel;

        // Skills section heading
        if (dto.SkillsBadge    != null) profile.SkillsBadge    = dto.SkillsBadge;
        if (dto.SkillsTitle    != null) profile.SkillsTitle    = dto.SkillsTitle;
        if (dto.SkillsSubtitle != null) profile.SkillsSubtitle = dto.SkillsSubtitle;

        await _db.SaveChangesAsync();
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("photo")]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        try
        {
            var userId  = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound();

            // Delete old photo from Cloudinary
            await _cloudinary.DeleteAsync(profile.PhotoUrl);

            var url = await _cloudinary.UploadImageAsync(file, "photos");
            profile.PhotoUrl = url;
            await _db.SaveChangesAsync();
            return Ok(new { url });
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize]
    [HttpDelete("photo")]
    public async Task<IActionResult> RemovePhoto()
    {
        var userId  = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();

        await _cloudinary.DeleteAsync(profile.PhotoUrl);
        profile.PhotoUrl = null;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Photo removed." });
    }

    [Authorize]
    [HttpPost("cv")]
    public async Task<IActionResult> UploadCV(IFormFile file)
    {
        try
        {
            var userId  = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound();

            // Delete old CV from Cloudinary
            await _cloudinary.DeleteAsync(profile.CvUrl);

            var url = await _cloudinary.UploadCvAsync(file);
            profile.CvUrl = url;
            await _db.SaveChangesAsync();
            return Ok(new { url });
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize]
    [HttpDelete("cv")]
    public async Task<IActionResult> RemoveCV()
    {
        var userId  = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return NotFound();

        await _cloudinary.DeleteAsync(profile.CvUrl);
        profile.CvUrl = null;
        await _db.SaveChangesAsync();
        return Ok(new { message = "CV removed." });
    }
}
