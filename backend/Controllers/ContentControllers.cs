using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsiteAPI.Data;
using PersonalWebsiteAPI.Models;
using System.Security.Claims;

namespace PersonalWebsiteAPI.Controllers;

// ─── Projects ────────────────────────────────────────────────────────────────
[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProjectsController(AppDbContext db) => _db = db;

    // Public — by userId
    [HttpGet("{userId:int}")]
    public async Task<IActionResult> Get(int userId) =>
        Ok(await _db.Projects.Where(p => p.UserId == userId).OrderByDescending(p => p.Featured).ThenByDescending(p => p.CreatedAt).ToListAsync());

    // Auth — current user's own
    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _db.Projects.Where(p => p.UserId == uid).OrderByDescending(p => p.Featured).ThenByDescending(p => p.CreatedAt).ToListAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Project item)
    {
        item.UserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        item.CreatedAt = DateTime.UtcNow;
        _db.Projects.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Project dto)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == uid);
        if (item == null) return NotFound();
        item.Title = dto.Title; item.Problem = dto.Problem; item.Solution = dto.Solution;
        item.Technologies = dto.Technologies; item.Results = dto.Results;
        item.ImageUrl = dto.ImageUrl; item.Featured = dto.Featured;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == uid);
        if (item == null) return NotFound();
        _db.Projects.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ─── Skills ──────────────────────────────────────────────────────────────────
[ApiController]
[Route("api/skills")]
public class SkillsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SkillsController(AppDbContext db) => _db = db;

    [HttpGet("{userId:int}")]
    public async Task<IActionResult> Get(int userId) =>
        Ok(await _db.Skills.Where(s => s.UserId == userId).OrderBy(s => s.SortOrder).ToListAsync());

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _db.Skills.Where(s => s.UserId == uid).OrderBy(s => s.SortOrder).ToListAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Skill item)
    {
        item.UserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _db.Skills.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Skill dto)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.Skills.FirstOrDefaultAsync(s => s.Id == id && s.UserId == uid);
        if (item == null) return NotFound();
        item.Title = dto.Title; item.Description = dto.Description;
        item.Icon = dto.Icon; item.SortOrder = dto.SortOrder;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.Skills.FirstOrDefaultAsync(s => s.Id == id && s.UserId == uid);
        if (item == null) return NotFound();
        _db.Skills.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ─── Timeline ────────────────────────────────────────────────────────────────
[ApiController]
[Route("api/timeline")]
public class TimelineController : ControllerBase
{
    private readonly AppDbContext _db;
    public TimelineController(AppDbContext db) => _db = db;

    [HttpGet("{userId:int}")]
    public async Task<IActionResult> Get(int userId) =>
        Ok(await _db.TimelineItems.Where(t => t.UserId == userId).OrderBy(t => t.SortOrder).ToListAsync());

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _db.TimelineItems.Where(t => t.UserId == uid).OrderBy(t => t.SortOrder).ToListAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TimelineItem item)
    {
        item.UserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _db.TimelineItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TimelineItem dto)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.TimelineItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == uid);
        if (item == null) return NotFound();
        item.Title = dto.Title; item.Organization = dto.Organization;
        item.Description = dto.Description; item.StartDate = dto.StartDate;
        item.EndDate = dto.EndDate; item.Type = dto.Type; item.SortOrder = dto.SortOrder;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.TimelineItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == uid);
        if (item == null) return NotFound();
        _db.TimelineItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ─── Blog ────────────────────────────────────────────────────────────────────
[ApiController]
[Route("api/blog")]
public class BlogController : ControllerBase
{
    private readonly AppDbContext _db;
    public BlogController(AppDbContext db) => _db = db;

    // Public — only published posts
    [HttpGet("{userId:int}")]
    public async Task<IActionResult> Get(int userId, [FromQuery] string? search)
    {
        var query = _db.BlogPosts.Where(b => b.UserId == userId && b.Published);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.Title.Contains(search) || b.Tags.Contains(search) || b.Excerpt.Contains(search));
        return Ok(await query.OrderByDescending(b => b.CreatedAt).ToListAsync());
    }

    // Auth — all posts including drafts
    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine([FromQuery] string? search)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var query = _db.BlogPosts.Where(b => b.UserId == uid);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.Title.Contains(search) || b.Tags.Contains(search));
        return Ok(await query.OrderByDescending(b => b.CreatedAt).ToListAsync());
    }

    [HttpGet("post/{id}")]
    public async Task<IActionResult> GetOne(int id) =>
        Ok(await _db.BlogPosts.FindAsync(id));

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BlogPost item)
    {
        item.UserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        item.CreatedAt = DateTime.UtcNow;
        _db.BlogPosts.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] BlogPost dto)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.BlogPosts.FirstOrDefaultAsync(b => b.Id == id && b.UserId == uid);
        if (item == null) return NotFound();
        item.Title = dto.Title; item.TitleNp = dto.TitleNp;
        item.Content = dto.Content; item.ContentNp = dto.ContentNp;
        item.Excerpt = dto.Excerpt; item.Tags = dto.Tags;
        item.ImageUrl = dto.ImageUrl; item.Published = dto.Published;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.BlogPosts.FirstOrDefaultAsync(b => b.Id == id && b.UserId == uid);
        if (item == null) return NotFound();
        _db.BlogPosts.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
[ApiController]
[Route("api/gallery")]
public class GalleryController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    public GalleryController(AppDbContext db, IWebHostEnvironment env) { _db = db; _env = env; }

    [HttpGet("{userId:int}")]
    public async Task<IActionResult> Get(int userId) =>
        Ok(await _db.GalleryItems.Where(g => g.UserId == userId).OrderByDescending(g => g.CreatedAt).ToListAsync());

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _db.GalleryItems.Where(g => g.UserId == uid).OrderByDescending(g => g.CreatedAt).ToListAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string? caption, [FromForm] string? category)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var uploads = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "gallery");
        Directory.CreateDirectory(uploads);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        using (var stream = new FileStream(Path.Combine(uploads, fileName), FileMode.Create))
            await file.CopyToAsync(stream);

        var item = new GalleryItem
        {
            UserId = uid,
            ImageUrl = $"/uploads/gallery/{fileName}",
            Caption = caption,
            Category = category ?? "Office",
            CreatedAt = DateTime.UtcNow
        };
        _db.GalleryItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.GalleryItems.FirstOrDefaultAsync(g => g.Id == id && g.UserId == uid);
        if (item == null) return NotFound();
        _db.GalleryItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
[ApiController]
[Route("api/testimonials")]
public class TestimonialsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TestimonialsController(AppDbContext db) => _db = db;

    [HttpGet("{userId:int}")]
    public async Task<IActionResult> Get(int userId) =>
        Ok(await _db.Testimonials.Where(t => t.UserId == userId).ToListAsync());

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _db.Testimonials.Where(t => t.UserId == uid).ToListAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Testimonial item)
    {
        item.UserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _db.Testimonials.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Testimonial dto)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == id && t.UserId == uid);
        if (item == null) return NotFound();
        item.Name = dto.Name; item.Role = dto.Role;
        item.Organization = dto.Organization; item.Content = dto.Content;
        item.PhotoUrl = dto.PhotoUrl;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var item = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == id && t.UserId == uid);
        if (item == null) return NotFound();
        _db.Testimonials.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
