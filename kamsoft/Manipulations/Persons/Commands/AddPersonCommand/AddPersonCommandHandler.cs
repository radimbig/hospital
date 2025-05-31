using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;

namespace kamsoft.Manipulations.Persons.Commands
{
    public class AddPersonCommandHandler : IRequestHandler<AddPersonCommand, MediatorResult<Person>>
    {
        private readonly HospitalContext _ctx;
        public AddPersonCommandHandler(HospitalContext ctx)
        {
            _ctx = ctx;
        }
        public async Task<MediatorResult<Person>> Handle(AddPersonCommand request, CancellationToken cancellationToken)
        {

            var cred = await _ctx.Credentials.Include(x=>x.Person).FirstOrDefaultAsync(x => x.Id == request.Credentials.Id, cancellationToken);
            if (cred == null)
            {
                return MediatorResult<Person>.Failure("Credentials not found");
            }
            if (cred.Person != null)
            {
                _ctx.Persons.Remove(cred.Person);
                await _ctx.SaveChangesAsync(cancellationToken);
            }
            
            _ctx.Persons.Add(request.Person);
            cred.Person = request.Person;
            cred.PersonId = request.Person.Id;
            _ctx.Credentials.Update(cred);
            try
            {
                await _ctx.SaveChangesAsync(cancellationToken);

            }catch(DbUpdateException ex) when (ex.InnerException is MySqlException sqlEx && sqlEx.Number == 1062) // 1062 - Duplicate entry error in MySQL
            {
                // Обработка ошибки дублирования записи
                return MediatorResult<Person>.Failure("Person with the pesel identifier already exists.");
            }

            return MediatorResult<Person>.Success(request.Person);
        }
    }
}
