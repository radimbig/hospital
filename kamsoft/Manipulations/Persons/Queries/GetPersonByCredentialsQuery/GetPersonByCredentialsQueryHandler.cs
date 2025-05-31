using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonByCredentialsQueryHandler : IRequestHandler<GetPersonByCredentialsQuery, IMediatorResult<Person>>
    {
        private readonly HospitalContext _ctx;
        public GetPersonByCredentialsQueryHandler(HospitalContext ctx)
        {
            _ctx = ctx;
        }
        public async Task<IMediatorResult<Person>> Handle(GetPersonByCredentialsQuery request, CancellationToken cancellationToken)
        {
            var cred = await _ctx.Credentials.Include(x => x.Person).FirstOrDefaultAsync(x => x.Id == request.Credentials.Id, cancellationToken);
            if (cred == null)
            {
                return MediatorResult<Person>.Failure("Credentials not found");
            }
            if (cred.Person == null)
            {
                return MediatorResult<Person>.Failure("Person not found");
            }
            return MediatorResult<Person>.Success(cred.Person);
            throw new NotImplementedException("GetPersonByCredentialsQueryHandler is not implemented yet.");
        }
    }
}
