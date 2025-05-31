using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Commands
{
    public class ChangePersonsRoleCommand : IRequest<MediatorResult<Person>>
    {
        public Guid TargetId { get; set; }
        public PersonRole Role { get; set; }
        
        public ChangePersonsRoleCommand(Guid targetId, PersonRole role)
        {
            TargetId = targetId;
            Role = role;
        }
    }
}
