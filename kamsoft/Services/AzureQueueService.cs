

using Azure.Messaging.ServiceBus;
using Azure.Messaging.ServiceBus.Administration;
using System.Text.Json;
using System.Threading.Tasks;

namespace kamsoft.Services
{
    public interface IAzureQueueService
    {
        Task Push(object input);
    }
    public class AzureQueueService : IAzureQueueService, IDisposable, IAsyncDisposable
    {
        private readonly IConfiguration config;
        const string ConnectionStringPathName = "AzureMessageBusConnection";
        private readonly string ConnectionString;
        const string QueueName = "radym-queue";
        private readonly ServiceBusAdministrationClient AdministratorClient;
        private readonly ServiceBusClient Client;
        private readonly ServiceBusSender Sender;
        public AzureQueueService(IConfiguration conf) 
        {
            config = conf;
            
            string? conn = config.GetConnectionString(ConnectionStringPathName);
            if (conn == null)
                throw new ArgumentNullException($"No connection string by {ConnectionStringPathName}");
            ConnectionString = conn;

            AdministratorClient = new ServiceBusAdministrationClient(ConnectionString);
            Client = new ServiceBusClient(conn);
            Sender = Client.CreateSender(QueueName);

        }

        public async Task Push(object input)
        {
            if(input == null)
                throw new ArgumentNullException("input cannot be null");
            string message = JsonSerializer.Serialize(input);
            ServiceBusMessage serviceBusMessage = new ServiceBusMessage(message);
            try
            {
                await Sender.SendMessageAsync(serviceBusMessage);
            }
            catch(ServiceBusException ex) when(ex.Reason == ServiceBusFailureReason.MessagingEntityNotFound)
            {
                await AdministratorClient.CreateQueueAsync(QueueName);
                await Sender.SendMessageAsync(serviceBusMessage);
            }
        }

        public void Dispose()
        {
            DisposeAsync().AsTask().GetAwaiter().GetResult();
        }

        public async ValueTask DisposeAsync()
        {
            await Client.DisposeAsync();
            await Sender.DisposeAsync();
        }
    }
}
