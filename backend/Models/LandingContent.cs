namespace PersonalWebsiteAPI.Models;

// Stores every editable section of the public marketing/landing page
public class LandingContent
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;   // e.g. "hero.title"
    public string Value { get; set; } = string.Empty;
    public string? ValueNp { get; set; }               // Nepali translation
    public string Section { get; set; } = string.Empty; // hero | features | templates | pricing | stats | footer
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// Website templates displayed on the landing page
public class SiteTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PreviewImageUrl { get; set; } = string.Empty;
    public string Category { get; set; } = "Professional"; // Professional | Creative | Minimal | Corporate
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}

// Platform-level stats managed by SuperAdmin (shown on landing page)
public class PlatformStat
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string LabelNp { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Icon { get; set; } = "Users";
    public int SortOrder { get; set; }
}

// Platform testimonials on landing page (different from user-site testimonials)
public class PlatformTestimonial
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

// Platform features shown on landing page — fully managed by SuperAdmin
public class PlatformFeature
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TitleNp { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionNp { get; set; } = string.Empty;
    public string Icon { get; set; } = "Zap";          // Lucide icon name
    public string IconColor { get; set; } = "blue";    // blue | green | purple | orange | pink | teal | yellow | red
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}
