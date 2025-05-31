using kamsoft.Database;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace kamsoft.Manipulations.CredentialsOperations.Commands
{
    public class AddCredentialsCommandHandler : IRequestHandler<AddCredentialsCommand, MediatorResult<kamsoft.Models.Credentials>>
    {
        private readonly HospitalContext _ctx;

        public AddCredentialsCommandHandler(HospitalContext ctx)
        {
            _ctx = ctx;
        }
        public async Task<MediatorResult<kamsoft.Models.Credentials>> Handle(AddCredentialsCommand request, CancellationToken cancellationToken)
        {
            var target = await _ctx.Credentials.FirstOrDefaultAsync(x => x.Login == request.Login, cancellationToken);
            if (target != null)
            {
                return MediatorResult<Models.Credentials>.Failure("User already exists");
            }
            var newCredentials = new Models.Credentials()
            {
                Login = request.Login,
                PasswordHash = Tools.HashTool.GenerateHash(request.Password),
            };
            _ctx.Credentials.Add(newCredentials);
            await _ctx.SaveChangesAsync(cancellationToken);

            return MediatorResult<kamsoft.Models.Credentials>.Success(newCredentials);
        }
    }
}
