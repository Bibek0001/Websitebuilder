using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace PersonalWebsiteAPI.Services;

public class CloudinaryService
{
    private Cloudinary? _cloudinary;
    private readonly IConfiguration _config;

    private static readonly HashSet<string> AllowedImageExts =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    private static readonly HashSet<string> AllowedCvExts =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".doc", ".docx" };

    private const long MaxImageBytes = 5 * 1024 * 1024;  // 5 MB
    private const long MaxCvBytes    = 10 * 1024 * 1024; // 10 MB

    public CloudinaryService(IConfiguration config)
    {
        _config = config;
    }

    private Cloudinary GetClient()
    {
        if (_cloudinary != null) return _cloudinary;

        var cloud  = _config["Cloudinary:CloudName"]  ?? Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD")  ?? "";
        var key    = _config["Cloudinary:ApiKey"]     ?? Environment.GetEnvironmentVariable("CLOUDINARY_KEY")    ?? "";
        var secret = _config["Cloudinary:ApiSecret"]  ?? Environment.GetEnvironmentVariable("CLOUDINARY_SECRET") ?? "";

        if (string.IsNullOrWhiteSpace(cloud) || string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(secret))
            throw new InvalidOperationException(
                "Cloudinary credentials missing. Set CLOUDINARY_CLOUD, CLOUDINARY_KEY, CLOUDINARY_SECRET.");

        var account = new Account(cloud, key, secret);
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
        return _cloudinary;
    }

    /// <summary>Upload a profile photo or gallery image. Returns the secure HTTPS URL.</summary>
    public async Task<string> UploadImageAsync(IFormFile file, string folder)
    {
        ValidateFile(file, AllowedImageExts, MaxImageBytes, "Image");

        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File           = new FileDescription(file.FileName, stream),
            Folder         = $"personalsite/{folder}",
            PublicId       = Guid.NewGuid().ToString(),
            Overwrite      = false,
            Transformation = folder == "photos"
                ? new Transformation().Width(800).Height(800).Crop("limit").Quality("auto").FetchFormat("auto")
                : new Transformation().Quality("auto").FetchFormat("auto"),
        };

        var result = await GetClient().UploadAsync(uploadParams);
        if (result.Error != null)
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

        return result.SecureUrl.ToString();
    }

    /// <summary>Upload a CV/Resume (PDF, DOC, DOCX). Returns the secure HTTPS URL.</summary>
    public async Task<string> UploadCvAsync(IFormFile file)
    {
        ValidateFile(file, AllowedCvExts, MaxCvBytes, "CV");

        using var stream = file.OpenReadStream();
        var uploadParams = new RawUploadParams
        {
            File     = new FileDescription(file.FileName, stream),
            Folder   = "personalsite/cvs",
            PublicId = Guid.NewGuid().ToString(),
        };

        var result = await GetClient().UploadAsync(uploadParams);
        if (result.Error != null)
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

        return result.SecureUrl.ToString();
    }

    /// <summary>Delete a file from Cloudinary by its full URL. Best-effort — never throws.</summary>
    public async Task DeleteAsync(string? url)
    {
        if (string.IsNullOrWhiteSpace(url) || !url.Contains("cloudinary.com")) return;
        try
        {
            var uri    = new Uri(url);
            var parts  = uri.AbsolutePath.Split('/');
            var uploadIdx = Array.IndexOf(parts, "upload");
            if (uploadIdx < 0) return;

            var afterUpload = parts.Skip(uploadIdx + 1).ToArray();
            if (afterUpload.Length > 0 && System.Text.RegularExpressions.Regex.IsMatch(afterUpload[0], @"^v\d+$"))
                afterUpload = afterUpload.Skip(1).ToArray();

            var publicIdWithExt = string.Join("/", afterUpload);
            var publicId = System.IO.Path.ChangeExtension(publicIdWithExt, null)?.TrimEnd('.');

            if (string.IsNullOrWhiteSpace(publicId)) return;

            var resourceType = url.Contains("/raw/") ? ResourceType.Raw : ResourceType.Image;
            await GetClient().DestroyAsync(new DeletionParams(publicId) { ResourceType = resourceType });
        }
        catch { /* best-effort */ }
    }

    private static void ValidateFile(IFormFile file, HashSet<string> allowedExts, long maxBytes, string label)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException($"{label} file is empty.");
        if (file.Length > maxBytes)
            throw new ArgumentException($"{label} must be under {maxBytes / 1024 / 1024} MB.");
        var ext = System.IO.Path.GetExtension(file.FileName);
        if (!allowedExts.Contains(ext))
            throw new ArgumentException($"{label} type not allowed. Allowed: {string.Join(", ", allowedExts)}");
    }
}
