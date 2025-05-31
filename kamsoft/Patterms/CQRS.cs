namespace kamsoft.Patterms
{
    public interface ICommandHandler<in TCommand>
    {
        Task Handle(TCommand command);
    }

    public interface IQueryHandler<in TQuery, TResult>
    {
        Task<TResult> Handle(TQuery query);
    }
    public record CommandInput(Guid Id);

    public class ExampleCommandHandler : ICommandHandler<CommandInput>
    {
        public Task Handle(CommandInput command)
        {
            // TODO implementacja
            return Task.CompletedTask;
        }
    }

}
