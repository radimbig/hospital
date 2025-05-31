using kamsoft.Patterms;
using MediatR;
namespace kamsoft.Manipulations.CredentialsOperations.Commands
{
    public class AddCredentialsCommand : IRequest<MediatorResult<kamsoft.Models.Credentials>>
    {
        public string Login { get; set; }
        public string Password { get; set; }
        public AddCredentialsCommand(string login, string password)
        {
            Login = login;
            Password = password;
        }
    }
    
}
