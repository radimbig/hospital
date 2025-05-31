using System;
using kamsoft.Models;

namespace kamsoft.Patterms
{
    public interface IStrategy<T>
    {
        bool IsValid(T person);
    }
    

    public class Strategy : IStrategy<Person>
    {
        public bool IsValid(Person person)
        {
            return person switch
            {
                Person.Simple simple => ValidateSimple(simple),
                Person.WithPesel withPesel => ValidateWithPesel(withPesel),
                _ => false
            };
        }

        private bool ValidateSimple(Person.Simple person)
        {
            if(person.Name == null || person.Name == string.Empty)
            {
                return false;
            }
            if(person.Surname == null || person.Surname == string.Empty)
            {
                return false;
            }
            return true;
        }

        private bool ValidateWithPesel(Person.WithPesel person)
        {
            if(person.Pesel.Length != 11)
            {
                return false;
            }
            if(person.Name == null || person.Name == string.Empty)
            {
                return false;
            }
            if(person.Surname == null || person.Surname == string.Empty)
            {
                return false;
            }
            return true;
        }
    }

    public class CredentialsStrategy : IStrategy<Credentials>
    {
        public bool IsValid(Credentials credentials)
        {
            if(credentials.Login == null || credentials.Login == string.Empty)
            {
                return false;
            }
            if(credentials.PasswordHash == null || credentials.PasswordHash == string.Empty)
            {
                return false;
            }
            return true;
        }
    }
}