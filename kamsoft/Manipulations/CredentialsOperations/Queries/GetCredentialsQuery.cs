using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.CredentialsOperations.Queries
{
    public class GetCredentialsQuery : IRequest<MediatorResult<Credentials>>
    {
        public Guid Id { get; set; }
        public GetCredentialsQuery(Guid id)
        {
            Id = id;
        }
    }
    
}
