using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PersonalWebsiteAPI.Data;
using PersonalWebsiteAPI.Models;
using PersonalWebsiteAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Database — PostgreSQL in production (DATABASE_URL env var), SQL Server locally ───
var pgConn = Environment.GetEnvironmentVariable("DATABASE_URL")
          ?? builder.Configuration.GetConnectionString("PostgresConnection");

var sqlConn = builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrWhiteSpace(pgConn))
{
    // Convert postgres:// or postgresql:// URI to Npgsql connection string format
    // Supabase provides: postgresql://user:password@host:port/dbname
    if (pgConn.StartsWith("postgres://") || pgConn.StartsWith("postgresql://"))
    {
        var uri = new Uri(pgConn);
        var userInfo = uri.UserInfo.Split(':', 2);
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');
        var username = userInfo[0];
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";

        pgConn = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;Pooling=true;Minimum Pool Size=1;Maximum Pool Size=20;Connection Idle Lifetime=300;Timeout=60;Command Timeout=60;";
    }

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(pgConn));
    Console.WriteLine("[INFO] Using PostgreSQL database.");
}
else if (!string.IsNullOrWhiteSpace(sqlConn))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(sqlConn));
    Console.WriteLine("[INFO] Using SQL Server database (local dev).");
}
else
{
    throw new InvalidOperationException(
        "No database connection configured. Set DATABASE_URL (PostgreSQL) or " +
        "ConnectionStrings:DefaultConnection (SQL Server) before starting.");
}

// ─── JWT Auth ─────────────────────────────────────────────────────────────────
// Key priority: JWT_KEY env var → hardcoded fallback (change in production)
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
          ?? builder.Configuration["Jwt:Key"];

// Use hardcoded fallback if key is missing or too short
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    jwtKey = "PersonalSite_HardcodedFallback_JWT_Key_2026_Min32Chars!!";
    Console.WriteLine("[WARN] JWT_KEY not set or too short — using hardcoded fallback. Set JWT_KEY in production!");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddControllers();

// ─── Rate Limiting ────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    // Strict limit for auth endpoints: 10 requests per minute per IP
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.RejectionStatusCode = 429;
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "";
var allowedOrigins = new List<string>
{
    "http://localhost:3000",
    "http://localhost:3001",
    "https://websitebuilder0.netlify.app", // hardcoded as fallback
};
if (!string.IsNullOrWhiteSpace(frontendUrl) && !allowedOrigins.Contains(frontendUrl))
    allowedOrigins.Add(frontendUrl);

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// ─── Global exception handler — return JSON error in production ───────────────
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (error != null)
        {
            var msg = app.Environment.IsDevelopment()
                ? error.Error.ToString()
                : error.Error.Message;
            await context.Response.WriteAsync($"{{\"error\":\"{msg.Replace("\"", "'")}\"}}");
        }
    });
});

// ─── HTTPS enforcement in production ─────────────────────────────────────────
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ─── Auto-migrate & Seed ──────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    var maxRetries = 5;
    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            logger.LogInformation("Migration attempt {Attempt}/{Max}...", attempt, maxRetries);
            db.Database.Migrate();
            logger.LogInformation("Migrations applied successfully.");
            await SeedData(db);
            logger.LogInformation("Seed data applied successfully.");
            break;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Migration attempt {Attempt} failed: {Message}", attempt, ex.Message);
            if (attempt == maxRetries)
            {
                logger.LogCritical("All migration attempts failed. Starting app anyway — some features may not work.");
                break;
            }
            var delay = attempt * 5;
            logger.LogInformation("Retrying in {Delay} seconds...", delay);
            await Task.Delay(TimeSpan.FromSeconds(delay));
        }
    }
}

app.Run();

// ─── Seed default data ────────────────────────────────────────────────────────
static async Task SeedData(AppDbContext db)
{
    // Seed SuperAdmin — always ensure admin exists with correct credentials
    var adminEmail    = "admin@gmail.com";
    var adminPassword = "Adin@123";
    var adminUsername = Environment.GetEnvironmentVariable("ADMIN_USERNAME") ?? "Admin";

    var existingAdmin = db.Users.FirstOrDefault(u => u.Role == "superadmin");
    if (existingAdmin == null)
    {
        db.Users.Add(new User
        {
            Username     = adminUsername,
            Email        = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role         = "superadmin",
            IsActive     = true
        });
        await db.SaveChangesAsync();
        Console.WriteLine($"[INFO] Superadmin '{adminUsername}' created with email '{adminEmail}'.");
    }
    else
    {
        // Always sync on every deploy — ensures credentials are always correct
        existingAdmin.Username     = adminUsername;
        existingAdmin.Email        = adminEmail;
        existingAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
        existingAdmin.IsActive     = true;
        await db.SaveChangesAsync();
        Console.WriteLine($"[INFO] Superadmin '{adminUsername}' synced.");
    }

    // Seed landing content
    var defaultContent = new Dictionary<string, (string val, string? np, string section)>
    {
        ["hero.title"]         = ("Build Your Personal Website in Minutes", "मिनेटमा आफ्नो व्यक्तिगत वेबसाइट बनाउनुस्", "hero"),
        ["hero.subtitle"]      = ("A powerful SaaS platform to showcase your skills, projects, journey, and more.", "आफ्नो सीप, परियोजना, यात्रा र थप देखाउन शक्तिशाली SaaS प्लेटफर्म।", "hero"),
        ["hero.cta1"]          = ("Get Started Free", "निःशुल्क सुरु गर्नुस्", "hero"),
        ["hero.cta2"]          = ("View Templates", "टेम्प्लेटहरू हेर्नुस्", "hero"),
        ["features.title"]     = ("Everything You Need", "तपाईंलाई चाहिने सबै कुरा", "features"),
        ["features.subtitle"]  = ("All the tools to build a professional personal website", "व्यावसायिक व्यक्तिगत वेबसाइट बनाउन सबै उपकरणहरू", "features"),
        ["templates.title"]    = ("Beautiful Templates", "सुन्दर टेम्प्लेटहरू", "templates"),
        ["templates.subtitle"] = ("Choose from professionally designed templates", "व्यावसायिक रूपमा डिजाइन गरिएका टेम्प्लेटहरूमध्ये रोज्नुस्", "templates"),
        ["pricing.title"]      = ("Simple Pricing", "सरल मूल्य निर्धारण", "pricing"),
        ["pricing.free.name"]  = ("Free", "निःशुल्क", "pricing"),
        ["pricing.free.price"] = ("$0/month", "$०/महिना", "pricing"),
        ["pricing.pro.name"]   = ("Pro", "प्रो", "pricing"),
        ["pricing.pro.price"]  = ("$9/month", "$९/महिना", "pricing"),
        ["footer.tagline"]     = ("Build your digital identity with confidence.", "आत्मविश्वासका साथ आफ्नो डिजिटल पहिचान बनाउनुस्।", "footer"),
    };

    foreach (var (key, (val, np, section)) in defaultContent)
    {
        if (!db.LandingContents.Any(l => l.Key == key))
        {
            db.LandingContents.Add(new LandingContent
            {
                Key = key, Value = val, ValueNp = np, Section = section
            });
        }
    }

    // Seed platform stats
    if (!db.PlatformStats.Any())
    {
        db.PlatformStats.AddRange(
            new PlatformStat { Label = "Active Users", LabelNp = "सक्रिय प्रयोगकर्ताहरू", Value = "500+", Icon = "Users", SortOrder = 1 },
            new PlatformStat { Label = "Websites Built", LabelNp = "बनाइएका वेबसाइटहरू", Value = "1,200+", Icon = "Globe", SortOrder = 2 },
            new PlatformStat { Label = "Templates", LabelNp = "टेम्प्लेटहरू", Value = "10+", Icon = "Layout", SortOrder = 3 },
            new PlatformStat { Label = "Countries", LabelNp = "देशहरू", Value = "25+", Icon = "Map", SortOrder = 4 }
        );
    }

    // Seed templates
    if (!db.SiteTemplates.Any())
    {
        db.SiteTemplates.AddRange(
            new SiteTemplate { Name = "Professional Blue", Description = "Clean, corporate-style layout perfect for developers and consultants.", PreviewImageUrl = "https://picsum.photos/seed/tmpl1/600/400", Category = "Professional", IsActive = true, SortOrder = 1 },
            new SiteTemplate { Name = "Creative Dark", Description = "Bold dark theme for designers, artists, and creative professionals.", PreviewImageUrl = "https://picsum.photos/seed/tmpl2/600/400", Category = "Creative", IsActive = true, SortOrder = 2 },
            new SiteTemplate { Name = "Minimal White", Description = "Clean minimalist design that lets your content shine.", PreviewImageUrl = "https://picsum.photos/seed/tmpl3/600/400", Category = "Minimal", IsActive = true, SortOrder = 3 },
            new SiteTemplate { Name = "Corporate Green", Description = "Professional green theme for business executives and managers.", PreviewImageUrl = "https://picsum.photos/seed/tmpl4/600/400", Category = "Corporate", IsActive = true, SortOrder = 4 },
            new SiteTemplate { Name = "Tech Purple", Description = "Modern purple gradient theme for tech professionals.", PreviewImageUrl = "https://picsum.photos/seed/tmpl5/600/400", Category = "Professional", IsActive = true, SortOrder = 5 },
            new SiteTemplate { Name = "Warm Personal", Description = "Warm, welcoming design ideal for teachers and community leaders.", PreviewImageUrl = "https://picsum.photos/seed/tmpl6/600/400", Category = "Minimal", IsActive = true, SortOrder = 6 }
        );
    }

    // Seed platform testimonials
    if (!db.PlatformTestimonials.Any())
    {
        db.PlatformTestimonials.AddRange(
            new PlatformTestimonial { Name = "Ram Bhandari", Role = "Software Developer, Nepal", Content = "This platform helped me showcase my work professionally. I got 3 new clients within a month!", IsActive = true },
            new PlatformTestimonial { Name = "Sita Sharma", Role = "IT Consultant, Kathmandu", Content = "Setting up my personal site took less than 30 minutes. The templates are stunning!", IsActive = true },
            new PlatformTestimonial { Name = "Bikash Thapa", Role = "Entrepreneur, Pokhara", Content = "The bilingual EN/NP support is perfect for reaching both local and international audiences.", IsActive = true }
        );
    }

    // Seed platform features
    if (!db.PlatformFeatures.Any())
    {
        db.PlatformFeatures.AddRange(
            new PlatformFeature { Title = "Beautiful Templates", TitleNp = "सुन्दर टेम्प्लेटहरू", Description = "Choose from professionally designed templates for every profession.", DescriptionNp = "हरेक पेशाका लागि व्यावसायिक टेम्प्लेटहरू।", Icon = "Palette", IconColor = "blue", IsActive = true, SortOrder = 1 },
            new PlatformFeature { Title = "Bilingual EN/NP", TitleNp = "द्विभाषी EN/NP", Description = "Full English and Nepali support — every section, every page.", DescriptionNp = "सम्पूर्ण अंग्रेजी र नेपाली समर्थन — हरेक सेक्सन।", Icon = "Globe2", IconColor = "green", IsActive = true, SortOrder = 2 },
            new PlatformFeature { Title = "Dark and Light Mode", TitleNp = "डार्क र लाइट मोड", Description = "Visitors can switch themes. Looks great in both.", DescriptionNp = "आगन्तुकहरू थिम स्विच गर्न सक्छन्। दुवैमा राम्रो देखिन्छ।", Icon = "Moon", IconColor = "purple", IsActive = true, SortOrder = 3 },
            new PlatformFeature { Title = "Mobile Responsive", TitleNp = "मोबाइल प्रतिक्रियाशील", Description = "Perfect on every screen — phone, tablet, desktop.", DescriptionNp = "हरेक स्क्रिनमा उत्तम — फोन, ट्याब्लेट, डेस्कटप।", Icon = "Smartphone", IconColor = "orange", IsActive = true, SortOrder = 4 },
            new PlatformFeature { Title = "Searchable Blog", TitleNp = "खोज्न मिल्ने ब्लग", Description = "Write and search blog posts in both languages.", DescriptionNp = "दुवै भाषामा ब्लग पोस्टहरू लेख्नुस् र खोज्नुस्।", Icon = "Search", IconColor = "pink", IsActive = true, SortOrder = 5 },
            new PlatformFeature { Title = "Project Showcase", TitleNp = "परियोजना प्रदर्शन", Description = "Dynamic portfolio with expandable project cards.", DescriptionNp = "विस्तार गर्न मिल्ने परियोजना कार्डहरूसहित पोर्टफोलियो।", Icon = "BarChart2", IconColor = "indigo", IsActive = true, SortOrder = 6 },
            new PlatformFeature { Title = "Career Timeline", TitleNp = "क्यारियर टाइमलाइन", Description = "Interactive visual timeline of your professional journey.", DescriptionNp = "तपाईंको व्यावसायिक यात्राको अन्तरक्रियात्मक टाइमलाइन।", Icon = "Clock", IconColor = "teal", IsActive = true, SortOrder = 7 },
            new PlatformFeature { Title = "CV Download", TitleNp = "CV डाउनलोड", Description = "Let visitors download your resume with one click.", DescriptionNp = "आगन्तुकहरूलाई एक क्लिकमा CV डाउनलोड गर्न दिनुस्।", Icon = "Award", IconColor = "yellow", IsActive = true, SortOrder = 8 },
            new PlatformFeature { Title = "Secure and Cloud", TitleNp = "सुरक्षित र क्लाउड", Description = "JWT auth, encrypted data, cloud-hosted infrastructure.", DescriptionNp = "JWT प्रमाणीकरण, इन्क्रिप्टेड डेटा, क्लाउड होस्टिङ।", Icon = "Shield", IconColor = "red", IsActive = true, SortOrder = 9 }
        );
    }

    await db.SaveChangesAsync();

    // Seed platform settings
    if (!db.PlatformSettings.Any())
    {
        db.PlatformSettings.AddRange(
            // General
            new PlatformSettings { Key = "site.name", Value = "PersonalSite.io", Group = "general", Description = "Platform name shown across the site" },
            new PlatformSettings { Key = "site.tagline", Value = "Build your digital identity", Group = "general", Description = "Short tagline" },
            new PlatformSettings { Key = "site.contactEmail", Value = "admin@personalsite.com", Group = "general", Description = "Public contact email" },
            new PlatformSettings { Key = "site.allowRegistration", Value = "true", Group = "general", Description = "Allow new user registrations" },
            new PlatformSettings { Key = "site.maintenanceMode", Value = "false", Group = "general", Description = "Put site in maintenance mode" },
            // Appearance
            new PlatformSettings { Key = "appearance.primaryColor", Value = "#2563eb", Group = "appearance", Description = "Primary brand color (hex)" },
            new PlatformSettings { Key = "appearance.defaultTheme", Value = "light", Group = "appearance", Description = "Default theme: light or dark" },
            new PlatformSettings { Key = "appearance.defaultLanguage", Value = "en", Group = "appearance", Description = "Default language: en or np" },
            // Security
            new PlatformSettings { Key = "security.jwtExpiryDays", Value = "30", Group = "security", Description = "JWT token expiry in days" },
            new PlatformSettings { Key = "security.maxLoginAttempts", Value = "5", Group = "security", Description = "Max failed logins before lockout" },
            new PlatformSettings { Key = "security.requireEmailVerification", Value = "false", Group = "security", Description = "Require email verification on signup" },
            // SMTP
            new PlatformSettings { Key = "smtp.host", Value = "", Group = "smtp", Description = "SMTP server host (e.g. smtp.gmail.com)" },
            new PlatformSettings { Key = "smtp.port", Value = "587", Group = "smtp", Description = "SMTP port" },
            new PlatformSettings { Key = "smtp.username", Value = "", Group = "smtp", Description = "SMTP username / email" },
            new PlatformSettings { Key = "smtp.password", Value = "", Group = "smtp", Description = "SMTP password (stored encrypted in production)" },
            new PlatformSettings { Key = "smtp.fromName", Value = "PersonalSite.io", Group = "smtp", Description = "From name for outgoing emails" }
        );
        await db.SaveChangesAsync();
    }
}
