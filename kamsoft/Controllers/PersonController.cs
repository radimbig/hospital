using AutoMapper;
using kamsoft.Manipulations.CredentialsOperations.Queries;
using kamsoft.Manipulations.Persons.Commands;
using kamsoft.Manipulations.Persons.Queries;
using kamsoft.Models;
using kamsoft.Models.Views;
using kamsoft.Patterms;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace kamsoft.Controllers
{
    public record PersonRequest(Guid Id, string Name, string Surname, string? Pesel);

    public class SetRoleRequest
    {
        public Guid PersonId { get; set; } = Guid.Empty;
        public string? PersonLogin { get; set; } = null;
        public PersonRole Role { get; set; }
    }


    [Route("api/[controller]")]
    [ApiController]
    public class PersonController : ControllerBase
    {
        private readonly IMediator mediator;
        private readonly IMapper _mapper;
        public PersonController(IMediator mediator, IMapper mapper)
        {
            this.mediator = mediator;
            this._mapper = mapper;
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IResult> Create(PersonRequest personRequest)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Results.Unauthorized(); // Or return a specific error
            }
            Guid authorizedUserId;
            if (!Guid.TryParse(userIdClaim.Value, out authorizedUserId))
            {
                // Handle case where the claim value is not a valid Guid
                return Results.Unauthorized();
            }

            var response = await mediator.Send(new GetCredentialsQuery(authorizedUserId));
            if (!response.IsSuccess)
            {
                return Results.NotFound(response.Message);
            }
            var mapper = new PersonRequestMapper();
            var person = mapper.Map(personRequest);
            
            var newPersonResult = await mediator.Send(new AddPersonCommand(response.Result, person));
            if (!newPersonResult.IsSuccess)
            {
                return Results.BadRequest(newPersonResult.Message);
            }
            PersonVM.WithRole vm = _mapper.Map<PersonVM.WithRole>(newPersonResult.Result);
            return Results.Ok(vm);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Results.Unauthorized(); // Or return a specific error
            }
            Guid authorizedUserId;
            if (!Guid.TryParse(userIdClaim.Value, out authorizedUserId))
            {
                // Handle case where the claim value is not a valid Guid
                return Results.Unauthorized();
            }

            var response = await mediator.Send(new GetPersonByCredentialsQuery(new Models.Credentials() { Id = authorizedUserId }));
            if(!response.IsSuccess)
            {
                return Results.NotFound(response.Message);
            }
            PersonVM.WithPesel vm = _mapper.Map<PersonVM.WithPesel>(response.Result);
            return Results.Ok(vm);
        }

        [HttpPost("role")]
        [Authorize(Roles = "Admin")]
        public async Task<IResult> SetRole(SetRoleRequest req)
        {
            if (req.PersonId == Guid.Empty && req.PersonLogin == null)
            {
                return Results.BadRequest("You need to provide person id or login to change role");
            }


            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Results.Unauthorized(); // Or return a specific error
            }
            Guid authorizedUserId;
            if (!Guid.TryParse(userIdClaim.Value, out authorizedUserId))
            {
                // Handle case where the claim value is not a valid Guid
                return Results.Unauthorized();
            }
            
            if (req.PersonId == Guid.Empty && req.PersonLogin != null)
            {
                var person = await mediator.Send(new GetPersonByLoginQuery(req.PersonLogin));
                if(person.IsSuccess)
                {
                    req.PersonId = person.Result.Id;
                }
                else
                {
                    return Results.NotFound(person.Message);
                }
            }

            var response = await mediator.Send(new ChangePersonsRoleCommand(req.PersonId, req.Role));
            if(!response.IsSuccess)
            {
                return Results.BadRequest(response.Message);
            }
            PersonVM.WithRole vm = _mapper.Map<PersonVM.WithRole>(response.Result);
            return Results.Ok(vm);
        }

        [HttpGet("doctors")]
        [Authorize(Roles = "Admin")]
        public async Task<IResult> GetDoctors()
        {
            var response = await mediator.Send(new GetAllPersonsByRoleQuery(PersonRole.Doctor));
            if (!response.IsSuccess)
            {
                return Results.NotFound(response.Message);
            }
            List<CredentialsVM.WithPerson> vm = _mapper.Map<List<CredentialsVM.WithPerson>>(response.Result);
            return Results.Ok(vm);
        }

    }
}