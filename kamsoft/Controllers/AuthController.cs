using AutoMapper;
using kamsoft.Database;
using kamsoft.Manipulations.CredentialsOperations.Commands;
using kamsoft.Manipulations.Tokens.Queries;
using kamsoft.Models.Views;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kamsoft.Controllers
{
    
    public record CredentialsReq(string Login, string Password);

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly IMapper mapper;
        private readonly IMediator mediator;
        public AuthController(IMediator mediator, IMapper mapper)
        {
            this.mapper = mapper;
            this.mediator = mediator;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] CredentialsReq c)
        {
            var query = new GetTokenQuery(c.Login, c.Password);
            var result = await mediator.Send(query);
            if(result.IsSuccess)
            {
                return Ok(result.Result);
            }
            else
            {
                return BadRequest(result.Message);
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CredentialsReq c)
        {
            var command = new AddCredentialsCommand(c.Login, c.Password);
            var result = await mediator.Send(command);
            
            if(result.IsSuccess)
            {
                CredentialsVM vm = mapper.Map<CredentialsVM>(result.Result);
                return Ok(vm);
            }
            else
            {
                return BadRequest(result.Message);
            }
        }
    }
}
