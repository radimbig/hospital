using System;

namespace kamsoft.Models
{
    public class Credentials
    {
        public Guid Id { get; set; }
        public string Login { get; set; }
        public string PasswordHash { get; set; }

        public Guid? PersonId { get; set; }

        public Person? Person { get; set; }

        public Credentials() { }

        public Credentials(Guid id, string login, string passwordHash)
        {
            Id = id;
            Login = login;
            PasswordHash = passwordHash;
        }
        public void AttachPerson(Person person)
        {
            Person = person;
            PersonId = person.Id;
        }
    }
}