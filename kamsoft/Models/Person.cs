using System;
using System.Text.Json.Serialization;

namespace kamsoft.Models
{
    [JsonDerivedType(typeof(Simple), "Simple")]
    [JsonDerivedType(typeof(WithPesel), "WithPesel")]
    [JsonDerivedType(typeof(WithPeselAndRole), "WithPeselAndRole")]
    public abstract class Person : IRepositoryObject
    {
        public Guid Id { get; set; }
        public class Simple : Person
        {
            public string Name { get; set; }
            public string Surname { get; set; }

            public Simple(Guid id, string name, string surname)
            {
                Id = id;
                Name = name;
                Surname = surname;
            }
            public Simple() { }
        }
        public class WithPesel : Person
        {
            public string Name { get; set; }
            public string Surname { get; set; }
            public string Pesel { get; set; }

            public WithPesel(Guid id, string name, string surname, string pesel)
            {
                Id = id;
                Name = name;
                Surname = surname;
                Pesel = pesel;
            }
            public WithPesel() { }
        }
        public class WithRole : Person
        {
            public string Name { get; set; }
            public string Surname { get; set; }
            public PersonRole Role { get; set; }

            public WithRole(Guid id, string name, string surname, PersonRole role)
            {
                Id = id;
                Name = name;
                Surname = surname;
                Role = role;
            }
            public WithRole() { }
        }
        public class WithPeselAndRole : Person
        {
            public string Name { get; set; }
            public string Surname { get; set; }
            public string Pesel { get; set; }
            public PersonRole Role { get; set; }

            public WithPeselAndRole(Guid id, string name, string surname, string pesel, PersonRole role)
            {
                Id = id;
                Name = name;
                Surname = surname;
                Pesel = pesel;
                Role = role;
            }
            public WithPeselAndRole() { }
        }

        public class MegaPerson : Person
        {
            public string PersonType { get; set; }
            public string Name{ get; set; }
            
            public string Surname { get; set; }
            public string Pesel { get; set; }

            public PersonRole Role { get; set; }
        }
    }

    

    public enum PersonRole
    {
        Doctor,
        Patient,
        Admin
    }
}
