using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using PersonalWebsiteAPI.Data;

namespace PersonalWebsiteAPI.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContactController(AppDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ContactDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { message = "All fields are required." });

        // Find the recipient's profile email
        string? recipientEmail = null;
        if (!string.IsNullOrWhiteSpace(dto.RecipientSlug))
        {
            var profile = await _db.Profiles.FirstOrDefaultAsync(p => p.Slug == dto.RecipientSlug);
            recipientEmail = profile?.Email;
        }

        // Load SMTP settings from DB
        var settings = await _db.PlatformSettings
            .Where(s => s.Group == "smtp")
            .ToListAsync();

        var smtpHost     = settings.FirstOrDefault(s => s.Key == "smtp.host")?.Value ?? "";
        var smtpPortStr  = settings.FirstOrDefault(s => s.Key == "smtp.port")?.Value ?? "587";
        var smtpUser     = settings.FirstOrDefault(s => s.Key == "smtp.username")?.Value ?? "";
        var smtpPass     = settings.FirstOrDefault(s => s.Key == "smtp.password")?.Value ?? "";
        var fromName     = settings.FirstOrDefault(s => s.Key == "smtp.fromName")?.Value ?? "PersonalSite.io";
        var contactEmail = (await _db.PlatformSettings.FirstOrDefaultAsync(s => s.Key == "site.contactEmail"))?.Value ?? smtpUser;

        // Log the contact attempt regardless of SMTP config
        Console.WriteLine($"[Contact] From: {dto.Name} <{dto.Email}> To: {recipientEmail ?? contactEmail} — {dto.Message[..Math.Min(60, dto.Message.Length)]}");

        // Only try to send email if SMTP is configured
        if (!string.IsNullOrWhiteSpace(smtpHost) && !string.IsNullOrWhiteSpace(smtpUser))
        {
            try
            {
                var port = int.TryParse(smtpPortStr, out var p) ? p : 587;
                var to = recipientEmail ?? contactEmail;

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, smtpUser));
                message.To.Add(new MailboxAddress(to, to));
                message.ReplyTo.Add(new MailboxAddress(dto.Name, dto.Email));
                message.Subject = $"New message from {dto.Name} via PersonalSite.io";

                message.Body = new TextPart("html")
                {
                    Text = $@"
<div style='font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;'>
  <div style='background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0;'>
    <h2 style='color: white; margin: 0;'>New Contact Message</h2>
  </div>
  <div style='background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;'>
    <table style='width: 100%; border-collapse: collapse;'>
      <tr><td style='padding: 8px 0; color: #6b7280; font-size: 13px;'>From</td><td style='padding: 8px 0; font-weight: 600;'>{dto.Name}</td></tr>
      <tr><td style='padding: 8px 0; color: #6b7280; font-size: 13px;'>Email</td><td style='padding: 8px 0;'><a href='mailto:{dto.Email}'>{dto.Email}</a></td></tr>
    </table>
    <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;'/>
    <p style='color: #374151; line-height: 1.6;'>{System.Web.HttpUtility.HtmlEncode(dto.Message).Replace("\n", "<br/>")}</p>
    <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;'/>
    <p style='color: #9ca3af; font-size: 12px;'>Sent via PersonalSite.io contact form</p>
  </div>
</div>"
                };

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(smtpUser, smtpPass);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Contact] SMTP error: {ex.Message}");
                // Still return success — the message was received even if email failed
            }
        }

        return Ok(new { success = true, message = "Message received. We will get back to you within 24 hours." });
    }
}

public record ContactDto(string Name, string Email, string Message, string? RecipientSlug);
