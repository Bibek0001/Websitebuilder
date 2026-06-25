using System.Net.Http.Headers;

namespace PersonalWebsiteAPI.Services;

/// <summary>
/// Uploads and deletes files using Supabase Storage HTTP API.
/// No extra NuGet package required — uses plain HttpClient.
/// </summary>
public class SupabaseStorageService
{
    private static readonly HashSet<string> AllowedImageExts =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    private static readonly HashSet<string> AllowedCvExts =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".doc", ".docx" };

    private const long MaxImageBytes = 10 * 1024 * 1024; // 10 MB
    private const long MaxCvBytes    = 50 * 1024 * 1024; // 50 MB

    private readonly string _supabaseUrl;
    private readonly string _serviceKey;
    private readonly string _bucket;
    private readonly HttpClient _http;

    public SupabaseStorageService(IConfiguration config)
    {
        _supabaseUrl = config["Supabase:Url"]  ?? Environment.GetEnvironmentVariable("SUPABASE_URL")  ?? "https://zrudtmqkrzhdfgczxhto.supabase.co";
        _serviceKey  = config["Supabase:ServiceKey"] ?? Environment.GetEnvironmentVariable("SUPABASE_SERVICE_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydWR0bXFrcnpoZGZnY3p4aHRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjI3OTQzOCwiZXhwIjoyMDk3ODU1NDM4fQ.r4u-BTiABf1JMZqSkYkQuHn_nSeHTKS8cS8M29j60Yc";
        _bucket      = "upload";

        _http = new HttpClient();
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);
        _http.DefaultRequestHeaders.Add("apikey", _serviceKey);
    }

    /// <summary>Upload a profile photo or gallery image. Returns public URL.</summary>
    public async Task<string> UploadImageAsync(IFormFile file, string folder)
    {
        ValidateFile(file, AllowedImageExts, MaxImageBytes, "Image");
        return await UploadFileAsync(file, folder);
    }

    /// <summary>Upload a CV/Resume. Returns public URL.</summary>
    public async Task<string> UploadCvAsync(IFormFile file)
    {
        ValidateFile(file, AllowedCvExts, MaxCvBytes, "CV");
        return await UploadFileAsync(file, "cvs");
    }

    private async Task<string> UploadFileAsync(IFormFile file, string folder)
    {
        var ext      = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{folder}/{Guid.NewGuid()}{ext}";
        var url      = $"{_supabaseUrl}/storage/v1/object/{_bucket}/{fileName}";

        using var stream  = file.OpenReadStream();
        using var content = new StreamContent(stream);
        content.Headers.ContentType = new MediaTypeHeaderValue(GetMimeType(ext));

        var response = await _http.PostAsync(url, content);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Supabase upload failed: {response.StatusCode} — {body}");
        }

        // Return public URL
        return $"{_supabaseUrl}/storage/v1/object/public/{_bucket}/{fileName}";
    }

    /// <summary>Delete a file by its public URL. Best-effort — never throws.</summary>
    public async Task DeleteAsync(string? publicUrl)
    {
        if (string.IsNullOrWhiteSpace(publicUrl) || !publicUrl.Contains(_supabaseUrl)) return;
        try
        {
            // Extract path after /object/public/{bucket}/
            var marker = $"/object/public/{_bucket}/";
            var idx    = publicUrl.IndexOf(marker, StringComparison.Ordinal);
            if (idx < 0) return;
            var filePath = publicUrl[(idx + marker.Length)..];

            var deleteUrl = $"{_supabaseUrl}/storage/v1/object/{_bucket}/{filePath}";
            await _http.DeleteAsync(deleteUrl);
        }
        catch { /* best-effort */ }
    }

    private static void ValidateFile(IFormFile file, HashSet<string> allowedExts, long maxBytes, string label)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException($"{label} file is empty.");
        if (file.Length > maxBytes)
            throw new ArgumentException($"{label} must be under {maxBytes / 1024 / 1024} MB.");
        var ext = Path.GetExtension(file.FileName);
        if (!allowedExts.Contains(ext))
            throw new ArgumentException($"{label} type not allowed. Allowed: {string.Join(", ", allowedExts)}");
    }

    private static string GetMimeType(string ext) => ext.ToLower() switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png"            => "image/png",
        ".webp"           => "image/webp",
        ".gif"            => "image/gif",
        ".pdf"            => "application/pdf",
        ".doc"            => "application/msword",
        ".docx"           => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        _                 => "application/octet-stream"
    };
}
