using System.ComponentModel.DataAnnotations;

namespace PersonalWebsiteAPI.Models;

public class Profile
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [MaxLength(100)] public string FullName { get; set; } = string.Empty;
    [MaxLength(200)] public string Tagline { get; set; } = string.Empty;
    [MaxLength(2000)] public string Bio { get; set; } = string.Empty;
    [MaxLength(500)] public string? PhotoUrl { get; set; }
    [MaxLength(500)] public string? CvUrl { get; set; }
    [MaxLength(200)] public string? Email { get; set; }
    [MaxLength(500)] public string? Linkedin { get; set; }
    [MaxLength(500)] public string? Github { get; set; }
    [MaxLength(500)] public string? Facebook { get; set; }
    [MaxLength(50)]  public string? Whatsapp { get; set; }
    [MaxLength(500)] public string? CompanyWebsite { get; set; }
    [MaxLength(100)] public string Slug { get; set; } = string.Empty;
    [MaxLength(50)]  public string? SelectedTemplate { get; set; } = "default";
    [MaxLength(7)]   public string? AccentColor { get; set; } = "#2563eb";

    // About section
    [MaxLength(500)] public string? WhereImFrom { get; set; }
    [MaxLength(500)] public string? CurrentlyDoing { get; set; }
    [MaxLength(500)] public string? MyGoals { get; set; }
    [MaxLength(500)] public string? MyPassion { get; set; }

    [MaxLength(20)] public string? StatOneValue { get; set; } = "10+";
    [MaxLength(50)] public string? StatOneLabel { get; set; } = "Years Experience";
    [MaxLength(20)] public string? StatTwoValue { get; set; } = "50+";
    [MaxLength(50)] public string? StatTwoLabel { get; set; } = "Projects Completed";
    [MaxLength(20)] public string? StatThreeValue { get; set; } = "100+";
    [MaxLength(50)] public string? StatThreeLabel { get; set; } = "Happy Clients";
    [MaxLength(20)] public string? StatFourValue { get; set; } = "15+";
    [MaxLength(50)] public string? StatFourLabel { get; set; } = "Certifications";

    // Skills section heading
    [MaxLength(50)]  public string? SkillsBadge { get; set; } = "Expertise";
    [MaxLength(100)] public string? SkillsTitle { get; set; } = "What I Do";
    [MaxLength(300)] public string? SkillsSubtitle { get; set; } = "My expertise spans across multiple domains of technology and business strategy.";

    public User? User { get; set; }
}
