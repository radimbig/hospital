using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Commands
{
    public class AddPersonCommand : IRequest<MediatorResult<Person>>
    {
        public Credentials Credentials;
        public Person Person;

        public AddPersonCommand(Credentials credentials, Person person)
        {
            Credentials = credentials;
            Person = person;
        }
        public AddPersonCommand(Guid credentialsId, Person person)
        {
            Credentials = new Credentials { Id = credentialsId };
            Person = person;
        }
    }
}
