using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using PersonalWebsiteAPI.Data;
using PersonalWebsiteAPI.Models;
using PersonalWebsiteAPI.Services;
using System.Security.Claims;

namespace PersonalWebsiteAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || dto.Username.Length < 3)
            return BadRequest(new { message = "Username must be at least 3 characters." });
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
            return BadRequest(new { message = "Password must be at least 8 characters." });
        if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains('@'))
            return BadRequest(new { message = "A valid email is required." });
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already exists" });

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest(new { message = "Username already taken" });

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "user"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Auto-create default profile
        var slug = dto.Username.ToLower().Replace(" ", "-");
        _db.Profiles.Add(new Profile
        {
            UserId = user.Id,
            FullName = dto.Username,
            Tagline = "Software Developer | Technology Enthusiast",
            Bio = "Welcome to my personal website.",
            Slug = slug,
            WhereImFrom = "Based in Nepal, working with clients globally across technology and governance sectors.",
            CurrentlyDoing = "Building software solutions, consulting for IT projects, and advocating for digital transformation.",
            MyGoals = "Empowering communities through technology, building sustainable digital ecosystems.",
            MyPassion = "Solving real-world problems with elegant code, bridging the gap between technology and services.",
            StatOneValue = "10+",
            StatOneLabel = "Years Experience",
            StatTwoValue = "50+",
            StatTwoLabel = "Projects Completed",
            StatThreeValue = "100+",
            StatThreeLabel = "Happy Clients",
            StatFourValue = "15+",
            StatFourLabel = "Certifications"
        });
        await _db.SaveChangesAsync();

        int expiryDays2 = 7;
        try
        {
            var expirySetting2 = await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "security.jwtExpiryDays");
            if (int.TryParse(expirySetting2?.Value, out var d2)) expiryDays2 = d2;
        }
        catch { /* use default */ }

        var token = _jwt.GenerateToken(user, expiryDays2);
        return Ok(new
        {
            user = new { id = user.Id, username = user.Username, email = user.Email, role = user.Role },
            token
        });
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // ── Hardcoded superadmin bypass ──────────────────────────────────────
        // These credentials always work regardless of DB state
        var hardcodedEmail    = "admin@gmail.com";
        var hardcodedPassword = "Adin@123";

        if (dto.Email == hardcodedEmail && dto.Password == hardcodedPassword)
        {
            // Find or create superadmin in DB
            var adminUser = await _db.Users.FirstOrDefaultAsync(u => u.Role == "superadmin");
            if (adminUser == null)
            {
                adminUser = new User
                {
                    Username     = Environment.GetEnvironmentVariable("ADMIN_USERNAME") ?? "Admin",
                    Email        = hardcodedEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(hardcodedPassword),
                    Role         = "superadmin",
                    IsActive     = true
                };
                _db.Users.Add(adminUser);
                await _db.SaveChangesAsync();
            }
            var adminToken = _jwt.GenerateToken(adminUser, 7);
            return Ok(new { user = new { id = adminUser.Id, username = adminUser.Username, email = adminUser.Email, role = adminUser.Role }, token = adminToken });
        }
        // ────────────────────────────────────────────────────────────────────

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        user ??= await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account is disabled" });

        int expiryDays = 7;
        try
        {
            var expirySetting = await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "security.jwtExpiryDays");
            if (int.TryParse(expirySetting?.Value, out var d)) expiryDays = d;
        }
        catch { }

        var token = _jwt.GenerateToken(user, expiryDays);
        return Ok(new
        {
            user = new { id = user.Id, username = user.Username, email = user.Email, role = user.Role },
            token
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        return Ok(new { id = user.Id, username = user.Username, email = user.Email, role = user.Role });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        // Always return OK to avoid email enumeration
        if (user == null) return Ok(new { message = "If that email exists, a reset link has been sent." });

        // Validate BaseUrl to prevent open redirect — only allow same-origin or configured frontend URL
        var allowedOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "http://localhost:3000",
            "http://localhost:3001",
            Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "",
        };
        Uri? baseUri = null;
        if (!Uri.TryCreate(dto.BaseUrl, UriKind.Absolute, out baseUri) ||
            !allowedOrigins.Any(o => !string.IsNullOrEmpty(o) && dto.BaseUrl.StartsWith(o, StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(new { message = "Invalid base URL." });
        }

        // Generate secure token
        var token = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-").Replace("/", "_").Replace("=", "");

        user.PasswordResetToken = token;
        user.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
        await _db.SaveChangesAsync();

        // Load SMTP settings
        var smtpHost = (await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "smtp.host"))?.Value ?? "";
        var smtpUser = (await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "smtp.username"))?.Value ?? "";
        var smtpPass = (await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "smtp.password"))?.Value ?? "";
        var smtpPortStr = (await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "smtp.port"))?.Value ?? "587";
        var fromName = (await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "smtp.fromName"))?.Value ?? "PersonalSite";

        var resetUrl = $"{dto.BaseUrl}/reset-password?token={token}&email={Uri.EscapeDataString(dto.Email)}";
        Console.WriteLine($"[PasswordReset] Reset URL: {resetUrl}");

        if (!string.IsNullOrWhiteSpace(smtpHost) && !string.IsNullOrWhiteSpace(smtpUser))
        {
            try
            {
                var port = int.TryParse(smtpPortStr, out var p) ? p : 587;
                var msg = new MimeKit.MimeMessage();
                msg.From.Add(new MimeKit.MailboxAddress(fromName, smtpUser));
                msg.To.Add(new MimeKit.MailboxAddress(user.Username, user.Email));
                msg.Subject = "Reset your password";
                msg.Body = new MimeKit.TextPart("html")
                {
                    Text = $@"<div style='font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px'>
<h2 style='color:#2563eb'>Reset Your Password</h2>
<p>Click the button below to reset your password. This link expires in 1 hour.</p>
<a href='{resetUrl}' style='display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0'>Reset Password</a>
<p style='color:#9ca3af;font-size:12px'>If you didn't request this, ignore this email.</p></div>"
                };
                using var client = new MailKit.Net.Smtp.SmtpClient();
                await client.ConnectAsync(smtpHost, port, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(smtpUser, smtpPass);
                await client.SendAsync(msg);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex) { Console.WriteLine($"[PasswordReset] SMTP error: {ex.Message}"); }
        }

        return Ok(new { message = "If that email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Email == dto.Email &&
            u.PasswordResetToken == dto.Token &&
            u.PasswordResetExpiry > DateTime.UtcNow);

        if (user == null) return BadRequest(new { message = "Invalid or expired reset link." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiry = null;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. You can now log in." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        if (dto.NewPassword.Length < 8)
            return BadRequest(new { message = "New password must be at least 8 characters." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Password changed successfully." });
    }

    [Authorize]
    [HttpPut("update-email")]
    public async Task<IActionResult> UpdateEmail([FromBody] UpdateEmailDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return BadRequest(new { message = "Password is incorrect." });

        if (await _db.Users.AnyAsync(u => u.Email == dto.NewEmail && u.Id != userId))
            return BadRequest(new { message = "Email already in use." });

        user.Email = dto.NewEmail;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Email updated successfully.", email = user.Email });
    }
}

public record RegisterDto(string Username, string Email, string Password);
public record LoginDto(string Email, string Password);
public record ForgotPasswordDto(string Email, string BaseUrl);
public record ResetPasswordDto(string Email, string Token, string NewPassword);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
public record UpdateEmailDto(string NewEmail, string Password);
