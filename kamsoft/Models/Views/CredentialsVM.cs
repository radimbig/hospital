namespace kamsoft.Models.Views
{
    public class CredentialsVM
    {
        public Guid Id { get; set; }
        public string Login { get; set; } = string.Empty;

        public class WithPerson : CredentialsVM
        {
            public Person? Person { get;set; }

        }
    }
}
