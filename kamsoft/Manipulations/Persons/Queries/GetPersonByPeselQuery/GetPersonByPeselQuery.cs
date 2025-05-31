using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonByPeselQuery : IRequest<MediatorResult<Person>>
    {
        public string Pesel { get; set; }
        public GetPersonByPeselQuery(string pesel)
        {
            Pesel = pesel;
        }
    }
}
