using Azure.Messaging.ServiceBus;
using kamsoft.Models;
using kamsoft.Patterms;
using System.Text.Json;
namespace AzureQueueWorker
{
    class Program
    {
        const string connectionString = "servicebus-connection-string";

        const string queueName = "radym-queue";

        static async Task Main(string[] args)
        {
            // Клієнт до Service Bus
            await using var client = new ServiceBusClient(connectionString);

            // Процесор для отримання повідомлень
            ServiceBusProcessor processor = client.CreateProcessor(queueName, new ServiceBusProcessorOptions
            {
                AutoCompleteMessages = false, // Ми вручну завершимо повідомлення
                MaxConcurrentCalls = 1         // Обробка по одному повідомленню
            });

            // Обробка отриманого повідомлення
            processor.ProcessMessageAsync += MessageHandler;

            // Обробка помилок
            processor.ProcessErrorAsync += ErrorHandler;

            // Запуск процесора
            await processor.StartProcessingAsync();

            Console.WriteLine("Listening for messages... Press any key to exit");
            Console.ReadKey();

            // Зупинка процесора
            await processor.StopProcessingAsync();
            await processor.DisposeAsync();
        }

        static void HandleAppointmentEvent(AppointmentEvent ev)
        {
            if(ev == null)
                return;
            var doctor = ev.Appointment.Doctor as Person.WithPeselAndRole;
            if(doctor == null)
                return;
            if(ev.ActionType == ActionTypes.AppointmentCreate)
            {
                Console.WriteLine($"Created new appointment for {doctor.Name} {doctor.Surname} sending him email and notification. {ev.Appointment.Slot.Start}-{ev.Appointment.Slot.End}");
                return;
            }
            if(ev.ActionType == ActionTypes.AppointmentDelete)
            {
                Console.WriteLine($"Deleted appointment for {doctor.Name} {doctor.Surname} sending him email and notification. {ev.Appointment.Slot.Start}-{ev.Appointment.Slot.End}");
                return;
            }
        }
        // Метод для обробки повідомлень
        static async Task MessageHandler(ProcessMessageEventArgs args)
        {
            string body = args.Message.Body.ToString();
            AppointmentEvent ev;
            try
            {
                 JsonSerializer.Deserialize<AppointmentEvent>(body);
            }
            catch
            {
                Console.WriteLine($"Cannot read the message body:{body}");
                return;
            }
            ev = JsonSerializer.Deserialize<AppointmentEvent>(body);
            if (ev == null)
                return;
            HandleAppointmentEvent(ev);
            await args.CompleteMessageAsync(args.Message);
        }

        // Метод для обробки помилок
        static Task ErrorHandler(ProcessErrorEventArgs args)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("ERROR while processing message:");
            Console.WriteLine($"- Exception: {args.Exception}");
            Console.WriteLine($"- Error Source: {args.ErrorSource}");
            Console.WriteLine($"- Entity Path: {args.EntityPath}");
            Console.WriteLine($"- Namespace: {args.FullyQualifiedNamespace}");
            Console.WriteLine();

            Console.ResetColor();

            return Task.CompletedTask;
        }


    }
}
