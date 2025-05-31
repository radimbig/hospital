using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonQuery : IRequest<MediatorResult<Person>>
    {
        public Guid Id { get; set; }
        public GetPersonQuery(Guid id)
        {
            Id = id;
        }
    }
}
