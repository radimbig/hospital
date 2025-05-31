using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Tokens.Queries
{
    public class GetTokenQuery : IRequest<IMediatorResult<string>>
    {
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public GetTokenQuery(string login, string password)
        {
            Login = login;
            Password = password;
        }
    }
    
}
