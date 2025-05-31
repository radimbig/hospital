using kamsoft.Database;
using kamsoft.Manipulations.CredentialsOperations.Queries;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Persons.Commands
{
    public class ChangePersonsRoleCommandHandler : IRequestHandler<ChangePersonsRoleCommand, MediatorResult<Person>>
    {
        private readonly IMediator mediator;
        private readonly HospitalContext ctx;
        public ChangePersonsRoleCommandHandler(IMediator mediator, HospitalContext ctx)
        {
            this.mediator = mediator;
            this.ctx = ctx;
        }
        public async Task<MediatorResult<Person>> Handle(ChangePersonsRoleCommand request, CancellationToken cancellationToken)
        {
            var person = await ctx.Persons.FirstOrDefaultAsync(p => p.Id == request.TargetId, cancellationToken);
            if (person == null)
            {
                return MediatorResult<Person>.Failure("Person not found");
            }
            switch(person)
            {
                case Person.Simple:
                    return MediatorResult<Person>.Failure("Cannot change role for person with no pesel ");
                case Person.WithPesel pp:
                    var copy = new Person.WithPeselAndRole(pp.Id, pp.Name, pp.Surname, pp.Pesel, request.Role);
                    ctx.Persons.Remove(pp);
                    ctx.Persons.Add(copy);
                    await ctx.SaveChangesAsync(cancellationToken);
                    return MediatorResult<Person>.Success(copy);
                case Person.WithPeselAndRole ppr:
                    ppr.Role = request.Role;
                    ctx.Persons.Update(ppr);
                    await ctx.SaveChangesAsync(cancellationToken);
                    return MediatorResult<Person>.Success(ppr);
                case Person.WithRole pr:
                    pr.Role = request.Role;
                    ctx.Persons.Update(pr);
                    await ctx.SaveChangesAsync(cancellationToken);
                    return MediatorResult<Person>.Success(pr);
            }
            return MediatorResult<Person>.Failure("Unknown person type");
        }
    }
}
