using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
namespace kamsoft.Services
{
    public class ImageData
    {
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string? ContentType { get; set; }
        public string? FileName { get; set; }

    }
    public interface IAzureImageService
    {



        public Task<ImageData?> GetAsync(Guid personId);

        public Task AddImage(Guid personId, IFormFile file);
        // Define methods for the Azure Image Service here
    }
    
    
    public class AzureImageService : IAzureImageService
    {
        string ConnectionString { get; set; }
        public string ContainerName { get; set; } 

        BlobServiceClient ServiceClient;
        BlobContainerClient BlobContainerClient;


        public AzureImageService(string connectionString, string containerName)
        {
            ConnectionString = connectionString;
            ContainerName = containerName;

            ServiceClient = new BlobServiceClient(ConnectionString);
            BlobContainerClient = ServiceClient.GetBlobContainerClient(ContainerName);
        }


        public async Task AddImage(Guid personId, IFormFile file)
        {
            if(file == null || file.Length == 0)
            {
                throw new ArgumentException("File cannot be null or empty.", nameof(file));
            }
            string extension = Path.GetExtension(file.FileName);
            if (extension != ".jpg")
            {
                throw new ArgumentException("Invalid file type. Only .jpg, is allowed.");
            }
            if (!file.ContentType.StartsWith("image/"))
                throw new ArgumentException("Invalid content type. Only image files are allowed.");

            BlobClient blobClient = BlobContainerClient.GetBlobClient($"{personId.ToString()}{extension}");

            using (var stream = file.OpenReadStream())
            {
                try
                {
                    await blobClient.UploadAsync(stream, true);
                }
                catch (RequestFailedException ex) when (ex.ErrorCode == "ContainerNotFound")
                {
                    stream.Position = 0; // Reset stream position before retrying

                    await BlobContainerClient.CreateIfNotExistsAsync();

                    await blobClient.UploadAsync(stream, overwrite: true);
                }
                catch (RequestFailedException ex)
                {
                    // Ошибки Azure SDK
                    throw new Exception($"Azure Blob error: {ex.ErrorCode} - {ex.Message}", ex);
                }
                catch (Exception ex)
                {
                    // Все остальные ошибки
                    throw new Exception($"Error uploading file to Azure Blob Storage: {ex.Message}", ex);
                }
            }
        }

        public async Task<ImageData?> GetAsync(Guid personId)
        {
            var blobClient = BlobContainerClient.GetBlobClient($"{personId.ToString()}.jpg");

            BlobDownloadResult response;
            try
            {
                response = await blobClient.DownloadContentAsync();
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null; // Blob not found, return null
            }
            ImageData result = new ImageData
            {
                Content = response.Content.ToArray(),
                ContentType = "image/jpeg",
                FileName = $"{personId.ToString()}.jpg"
            };
            return result;
        }
    }
}
