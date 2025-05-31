using kamsoft.Controllers;
using kamsoft.Models;
using static kamsoft.Models.Person;

namespace kamsoft.Patterms
{
    public interface ICustomMapper<in Input, out Output> where Input : class where Output : class
    {
        public Output Map(Input input);
    }



    public class PersonRequestMapper : ICustomMapper<PersonRequest, Person>
    {
        public Person Map(PersonRequest input)
        {
            if(string.IsNullOrEmpty(input.Pesel))
            {
                return new Person.Simple(input.Id, input.Name, input.Surname);
            }
            else
            {
                return new Person.WithPeselAndRole(input.Id, input.Name, input.Surname, input.Pesel, PersonRole.Patient);
            }
        }
    }
    public class ToMagePerson : ICustomMapper<PersonRequest, MegaPerson>
    {
        public MegaPerson Map(PersonRequest input)
        {
            var dbPerson = new MegaPerson()
            {
                Id = input.Id,
                Name = input.Name,
                Surname = input.Surname,
                Pesel = input.Pesel,
                Role = PersonRole.Patient
            };

            if (string.IsNullOrEmpty(input.Pesel))
            {
                dbPerson.PersonType = typeof(Person.Simple).ToString();
            }
            else
            {
                dbPerson.PersonType = typeof(Person.WithPeselAndRole).ToString();
            }

            return dbPerson;
        }
    }

    public class ToPersonFromDb : ICustomMapper<MegaPerson, Person>
    {
        public Person Map(MegaPerson input)
        {
            if (input.PersonType == typeof(Person.Simple).ToString())
            {
                return new Person.Simple(input.Id, input.Name, input.Surname);
            }
            else if (input.PersonType == typeof(Person.WithPeselAndRole).ToString())
            {
                return new Person.WithPeselAndRole(input.Id, input.Name, input.Surname, input.Pesel, input.Role);
            }
            throw new InvalidOperationException("Unknown person type in database.");
        }
    }
    public class CredentialsRequestMapper : ICustomMapper<CredentialsReq,Credentials>
    {
        public Credentials Map(CredentialsReq input)
        {
            throw new NotImplementedException("Credentials mapping not implemented yet.");
        }
    }
}
