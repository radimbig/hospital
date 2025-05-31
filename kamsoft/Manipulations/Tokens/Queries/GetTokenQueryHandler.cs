using kamsoft.Database;
using MediatR;
using kamsoft.Tools;
using Microsoft.EntityFrameworkCore;
using kamsoft.Patterms;
using kamsoft.Services;
using kamsoft.Models;
namespace kamsoft.Manipulations.Tokens.Queries
{
    public class GetTokenQueryHandler : IRequestHandler<GetTokenQuery, IMediatorResult<string>>
    {
        private HospitalContext _ctx;
        private IJWTService _jwt;

        public GetTokenQueryHandler(HospitalContext ctx, IJWTService jwt)
        {
            _ctx = ctx;
            _jwt = jwt;
        }
        public async Task<IMediatorResult<string>> Handle(GetTokenQuery request, CancellationToken cancellationToken)
        {
            var target = await _ctx.Credentials.Include(c=>c.Person).FirstOrDefaultAsync(x => x.Login == request.Login, cancellationToken);
            if(target == null)
            {
                return MediatorResult<string>.Failure("User not found");
            }
            bool isValid = HashTool.VerifyHash(request.Password, target.PasswordHash);
            if(!isValid)
            {
                return MediatorResult<string>.Failure("Invalid password");
            }
            PersonRole role = PersonRole.Patient;
            if(target.Person != null)
            {
                switch(target.Person)
                {
                    case Person.WithPeselAndRole pp:
                        role = pp.Role;
                        break;
                    case Person.WithRole pr:
                        role = pr.Role;
                        break;
                }
            }
            var token = _jwt.GenerateToken(target.Id, role);
            return MediatorResult<string>.Success(token);
        }
    }
}
