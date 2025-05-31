using Microsoft.AspNetCore.Http.HttpResults;
using System.Collections.Concurrent;

namespace kamsoft.Decider
{
    public abstract record Event(Guid Id, DateTime OccuredAt)
    {
        public record Booked(Guid Id, DateTime Start, DateTime End, DateTime CreatedAt) : Event(Id, CreatedAt);

        public record Canceled(Guid Id, DateTime Start, DateTime End, DateTime CreatedAt) : Event(Id, CreatedAt);
    }

    public abstract record Command
    {
        public record Create(DateTime Start, DateTime End) : Command;
        public record Cancel : Command;
    }

    public abstract record SlotState
    {
        public sealed record Initial : SlotState;
        public sealed record Free(Guid Id) : SlotState;

        public sealed record Booked(Guid Id, DateTime Start, DateTime End) : SlotState;

    }

    public static class Decider
    {
        public static SlotState Fold(this IEnumerable<Event> events, SlotState state) => events.Aggregate(state, Evolve);
        public static SlotState Fold(this IEnumerable<Event> events) => events.Fold(new SlotState.Initial());

        private static ConcurrentQueue<Event> _events = new ConcurrentQueue<Event>();

        public static SlotState Evolve(SlotState state, Event ev) =>
            (state, ev) switch
            {
                (SlotState.Initial, Event.Booked b) => new SlotState.Booked(Guid.NewGuid(), b.Start, b.End),
                (SlotState.Free f, Event.Booked b) => new SlotState.Booked(f.Id, b.Start, b.End),
                (SlotState.Booked f, Event.Canceled c) => new SlotState.Free(f.Id),
                _ => state
            };
        public static IEnumerable<Event> Decide(this SlotState state, Command command)
        => (state, command) switch
        {
            (SlotState.Initial, Command.Create c) => Book(c.Start, c.End),
            (SlotState.Free f, Command.Create c) => Book(c.Start, c.End),
            (SlotState.Booked b, Command.Cancel c) => Cancel(),
            _ => throw new NotImplementedException()
        };
        public static IEnumerable<Event> Book(DateTime Start, DateTime End)
        {
            var ev = new Event.Booked(Guid.NewGuid(), Start, End, DateTime.UtcNow);
            _events.Enqueue(ev);
            return _events;
        }
        public static IEnumerable<Event> Cancel()
        {
            var ev = new Event.Canceled(Guid.NewGuid(), DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow);
            _events.Enqueue(ev);
            return _events;
        }
    }
}
