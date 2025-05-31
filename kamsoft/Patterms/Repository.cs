using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using kamsoft.Models;
using kamsoft.Patterms;
using System.IO;
using System.Text.Json;

namespace kamsoft.Patterms
{
    public interface IRepository
    {
        public Task<T> Get<T>(Guid id) where T : class, IRepositoryObject;
        public Task Save<T>(T entity) where T : class, IRepositoryObject; 
    }
    public class StorageRepository : IRepository
    {
        private readonly BlobServiceClient client;
        private readonly string containerName;
        public StorageRepository(string connectionStr, string containerName) 
        { 
            this.containerName = containerName;
            client = new BlobServiceClient(connectionStr);
        }
        public async Task<T> Get<T>(Guid id) where T : class, IRepositoryObject
        {
            var cont = client.GetBlobContainerClient(containerName);
            var blobClient = cont.GetBlobClient($"{id}.json");
            BlobDownloadResult result = await blobClient.DownloadContentAsync();
            string content = result.Content.ToString();
            return JsonSerializer.Deserialize<T>(content);
        }
        public async Task Save<T>(T entity) where T : class, IRepositoryObject
        {
            var cont = client.GetBlobContainerClient(containerName);
            var data = JsonSerializer.Serialize(entity);


            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(data));
            await cont.UploadBlobAsync($"{entity.Id}.json", stream);
        }
    }

}

