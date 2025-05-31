using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetAllPersonsByRoleQuery : IRequest<MediatorResult<List<Credentials>>>  
    {
        public PersonRole Role { get; set; }
        
        public GetAllPersonsByRoleQuery(PersonRole role)
        {
            Role = role;
        }
    }
}
