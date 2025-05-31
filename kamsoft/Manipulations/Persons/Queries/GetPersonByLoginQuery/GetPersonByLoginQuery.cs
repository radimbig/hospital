using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonByLoginQuery : IRequest<MediatorResult<Person>>
    {
        public string Login { get; set; }
        public GetPersonByLoginQuery(string login)
        {
            Login = login;
        }
    }
    
}
