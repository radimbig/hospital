namespace kamsoft.Patterms
{
    public interface IHandle<T>
    {
        public Task Handle(T input);
    }
    public class HandleOne : IHandle<string>
    {
        public Task Handle(string input)
        {
            Console.WriteLine($"HandleOne: {input}");
            return Task.CompletedTask;
        }
    }
    public class HandleTwo : IHandle<string>
    {
        private readonly IHandle<string> _next;
        public HandleTwo(IHandle<string> next)
        {
            _next = next;
        }
        public async Task Handle(string input)
        {
            Console.WriteLine($"HandleTwo: {input}");
            await _next.Handle(input);
        }
    }
    public class HandleThree : IHandle<string>
    {
        private readonly IHandle<string> _next;
        public HandleThree(IHandle<string> next)
        {
            _next = next;
        }
        public async Task Handle(string input)
        {
            Console.WriteLine($"HandleThree: {input}");
            await Task.CompletedTask;
        }

    }
}
