using Microsoft.EntityFrameworkCore;
using PersonalWebsiteAPI.Models;

namespace PersonalWebsiteAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // User content tables
    public DbSet<User> Users => Set<User>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<TimelineItem> TimelineItems => Set<TimelineItem>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<GalleryItem> GalleryItems => Set<GalleryItem>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();

    // Landing page / SuperAdmin tables
    public DbSet<LandingContent> LandingContents => Set<LandingContent>();
    public DbSet<SiteTemplate> SiteTemplates => Set<SiteTemplate>();
    public DbSet<PlatformStat> PlatformStats => Set<PlatformStat>();
    public DbSet<PlatformTestimonial> PlatformTestimonials => Set<PlatformTestimonial>();
    public DbSet<PlatformFeature> PlatformFeatures => Set<PlatformFeature>();
    public DbSet<PlatformSettings> PlatformSettings => Set<PlatformSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Profile>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.HasOne(p => p.User).WithOne(u => u.Profile)
             .HasForeignKey<Profile>(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LandingContent>(e =>
        {
            e.HasIndex(l => l.Key).IsUnique();
        });

        modelBuilder.Entity<PlatformSettings>(e =>
        {
            e.HasIndex(s => s.Key).IsUnique();
        });

        modelBuilder.Entity<Project>().HasOne(p => p.User).WithMany(u => u.Projects).HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Skill>().HasOne(s => s.User).WithMany(u => u.Skills).HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TimelineItem>().HasOne(t => t.User).WithMany(u => u.TimelineItems).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<BlogPost>().HasOne(b => b.User).WithMany(u => u.BlogPosts).HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<GalleryItem>().HasOne(g => g.User).WithMany(u => u.GalleryItems).HasForeignKey(g => g.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Testimonial>().HasOne(t => t.User).WithMany(u => u.Testimonials).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
