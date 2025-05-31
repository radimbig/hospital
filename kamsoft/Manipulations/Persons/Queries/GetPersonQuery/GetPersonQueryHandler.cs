using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonQueryHandler : IRequestHandler<GetPersonQuery, MediatorResult<Person>>
    {
        private readonly HospitalContext _ctx;
        public GetPersonQueryHandler(HospitalContext ctx)
        {
            _ctx = ctx;
        }
        public async Task<MediatorResult<Person>> Handle(GetPersonQuery request, CancellationToken cancellationToken)
        {
            var person = await _ctx.Persons.FindAsync(request.Id);
            if (person == null)
            {
                return MediatorResult<Person>.Failure("Person not found");
            }
            return MediatorResult<Person>.Success(person);
        }
    }
    
}
