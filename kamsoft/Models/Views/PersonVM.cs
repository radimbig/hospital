namespace kamsoft.Models.Views
{
    public class PersonVM
    {
        public Guid Id { get; set; }
        public class Simple : PersonVM
        {
            public string Name { get; set; } = string.Empty;
            public string Surname { get; set; } = string.Empty;

            public Simple(string name, string surname)
            {
                Name = name;
                Surname = surname;
            }
        }
        public class WithRole : Simple
        {
            public WithRole(string name, string surname) : base(name, surname)
            {
            }

            public PersonRole Role { get; set; }
        }
        public class WithPesel : WithRole
        {
            public string Pesel { get; set; } = string.Empty;
            public WithPesel(string name, string surname, string pesel) : base(name, surname)
            {
                Pesel = pesel;
            }
        }

    }
}
