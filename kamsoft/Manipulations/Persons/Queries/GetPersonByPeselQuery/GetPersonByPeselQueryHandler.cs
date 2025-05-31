using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonByPeselQueryHandler : IRequestHandler<GetPersonByPeselQuery, MediatorResult<Person>>
    {
        private readonly HospitalContext ctx;

        public GetPersonByPeselQueryHandler(HospitalContext ctx)
        {
            this.ctx = ctx;
        }

        public async Task<MediatorResult<Person>> Handle(GetPersonByPeselQuery request, CancellationToken cancellationToken)
        {
            var person = await ctx.Persons
                .FirstOrDefaultAsync(p => (p is Person.WithPesel || p is Person.WithPeselAndRole)
                && ((p as Person.WithPesel).Pesel == request.Pesel || (p as Person.WithPeselAndRole).Pesel == request.Pesel));
            // Implementation logic to retrieve a person by their PESEL number

            if (person == null)
            {
                return MediatorResult<Person>.Failure("Person not found with the provided PESEL.");
            }

            return MediatorResult<Person>.Success(person);
        }
    }
}
