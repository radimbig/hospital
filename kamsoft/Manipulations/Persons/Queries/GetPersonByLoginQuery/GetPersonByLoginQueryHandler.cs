using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonByLoginQueryHandler : IRequestHandler<GetPersonByLoginQuery, MediatorResult<Person>>
    {
        private readonly HospitalContext ctx;

        public GetPersonByLoginQueryHandler(HospitalContext ctx)
        {
            this.ctx = ctx;
        }

        public async Task<MediatorResult<Person>> Handle(GetPersonByLoginQuery request, CancellationToken cancellationToken)
        {
            var cred = await ctx.Credentials
                .Include(c => c.Person)
                .FirstOrDefaultAsync(c => c.Login == request.Login, cancellationToken);

            if (cred == null)
            {
                return MediatorResult<Person>.Failure("Credential not found for the given login");
            }
            if (cred.Person == null)
            {
                return MediatorResult<Person>.Failure("Person not found");
            }
            return MediatorResult<Person>.Success(cred.Person);
        }
    }
}
