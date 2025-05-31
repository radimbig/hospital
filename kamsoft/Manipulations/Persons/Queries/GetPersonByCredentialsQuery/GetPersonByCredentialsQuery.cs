using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonByCredentialsQuery : IRequest<IMediatorResult<Person>>
    {
        public Credentials Credentials { get; set; }
        public GetPersonByCredentialsQuery(Credentials credentials)
        {
            Credentials = credentials;
        }
        public GetPersonByCredentialsQuery(Guid id)
        {
            Credentials = new Credentials { Id = id };
        }
    }
}
