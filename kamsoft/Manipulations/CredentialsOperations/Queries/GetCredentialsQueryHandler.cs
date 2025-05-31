using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.CredentialsOperations.Queries
{
    public class GetCredentialsQueryHandler : IRequestHandler<GetCredentialsQuery, MediatorResult<Credentials>>
    {
        private readonly HospitalContext _ctx;
        public GetCredentialsQueryHandler(HospitalContext ctx)
        {
            _ctx = ctx;
        }
        public async Task<MediatorResult<Credentials>> Handle(GetCredentialsQuery request, CancellationToken cancellationToken)
        {
            var target = await _ctx.Credentials.Include(x=>x.Person).FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (target == null)
            {
                return MediatorResult<Credentials>.Failure("User not found");
            }
            return MediatorResult<Credentials>.Success(target);
        }
    }

}
