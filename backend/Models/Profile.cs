namespace PersonalWebsiteAPI.Models;

public class Profile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? CvUrl { get; set; }
    public string? Email { get; set; }
    public string? Linkedin { get; set; }
    public string? Github { get; set; }
    public string? Facebook { get; set; }
    public string? Whatsapp { get; set; }
    public string? CompanyWebsite { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? SelectedTemplate { get; set; } = "default";
    public string? AccentColor { get; set; } = "#2563eb";

    public User? User { get; set; }
}
