using kamsoft.Database;
using kamsoft.Manipulations.Appointments.Queries;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetAllPersonsByRoleQueryHandler : IRequestHandler<GetAllPersonsByRoleQuery, MediatorResult<List<Credentials>>>
    {
        private readonly HospitalContext ctx;
        public GetAllPersonsByRoleQueryHandler(HospitalContext ctx)
        {
            this.ctx = ctx; 
        }


        public async Task<MediatorResult<List<Credentials>>> Handle(GetAllPersonsByRoleQuery request, CancellationToken cancellationToken)
        {
            var credentials = await ctx.Credentials
                .Include(c => c.Person)
                .Where(c =>
                (c.Person is Person.WithRole || c.Person is Person.WithPeselAndRole) &&
                ((c.Person as Person.WithRole).Role == request.Role || (c.Person as Person.WithPeselAndRole).Role == request.Role))
                .ToListAsync();

            return MediatorResult<List<Credentials>>.Success(credentials);
        }
    }
}
