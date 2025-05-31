using AutoMapper;
using kamsoft.Manipulations.Appointments.Commands;
using kamsoft.Manipulations.Appointments.Queries;
using kamsoft.Manipulations.Persons.Queries;
using kamsoft.Models;
using kamsoft.Models.Views;
using kamsoft.Patterms;
using kamsoft.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;



namespace kamsoft.Controllers
{

    public record AppointmentAddRequest(string? PatientLogin,string? PatientPesel, Slot Slot);

    public record AddAppointmentToDoctorRequest(string? DoctorLogin, string? DoctorPesel, string? PatientLogin, string? PatientPesel, Slot Slot);

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentController : ControllerBase
    {

        private readonly IMediator mediator;
        private readonly IMapper mapper;
        private readonly IAzureQueueService queueService;


        public AppointmentController(IMediator mediator, IMapper mapper, IAzureQueueService queue)
        {
            this.mediator = mediator;
            this.mapper = mapper;
            this.queueService = queue;
        }


        public async Task<MediatorResult<Person>> FindByLoginOrPesel(string? login, string? Pesel)
        {
            if(login != null)
            {
                return await mediator.Send(new GetPersonByLoginQuery(login));
            }
            if(Pesel != null)
            {
                return await mediator.Send(new GetPersonByPeselQuery(Pesel));
            }

            return MediatorResult<Person>.Failure("You need to provide login or pesel to find person");
        }


        [HttpPost]
        [Authorize(Roles ="Admin")]
        public async Task<IResult> AddToDoctor(AddAppointmentToDoctorRequest req)
        {
            var doctor = await FindByLoginOrPesel(req.DoctorLogin, req.DoctorPesel);
            if (!doctor.IsSuccess)
                return Results.NotFound(doctor.Message);
            var patient = await FindByLoginOrPesel(req.PatientLogin, req.PatientPesel);
            if (!patient.IsSuccess)
                return Results.NotFound(patient.Message);

            var appoinment = await mediator.Send(new AddAppointmentCommand(patient.Result.Id, doctor.Result.Id, req.Slot));

            if(!appoinment.IsSuccess)
                return Results.BadRequest(appoinment.Message);

            AppointmentEvent ev = new AppointmentEvent(ActionTypes.AppointmentCreate, DateTime.Now, appoinment.Result);
            await queueService.Push(ev);

            AppointmentVM vm = mapper.Map<AppointmentVM>(appoinment.Result);
            return Results.Ok(vm);
        }


        [HttpGet("me/{count}")]
        [Authorize(Roles = "Doctor,Patient")]
        public async Task<IResult> GetMyAppointments(int count)
        {
            if (count <= 0 || count > 100)
            {
                return Results.BadRequest("Count must be between 1 and 100.");
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

            var result = await mediator.Send(new GetAppointmentsQuery(count, authorizedUserId));
            if (!result.IsSuccess)
            {
                return Results.NotFound(result.Message);
            }
            List<AppointmentVM> vm = mapper.Map<List<AppointmentVM>>(result.Result);

            return Results.Ok(vm);
        }

        [HttpGet("{doctorLogin}/{count}")]
        [Authorize(Roles ="Admin")]
        public async Task<IResult> GetAppointmentsFor(string doctorLogin, int count)
        {
            var appointments = await mediator.Send(new GetAppointmentsByLoginQuery(doctorLogin, count));
            
            if(!appointments.IsSuccess)
                return Results.NotFound(appointments.Message);
            List<AppointmentVM> vm = mapper.Map<List<AppointmentVM>>(appointments.Result);
            return Results.Ok(vm);
        }
        


        [HttpPost("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IResult> AddApointment([FromBody] AppointmentAddRequest req)
        {
            if (req.Slot.Start >= req.Slot.End)
            {
                return Results.BadRequest("Invalid time slot: Start time must be before end time.");
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

            var responseWithDoctor = await mediator.Send(new GetPersonByCredentialsQuery(new Credentials() { Id = authorizedUserId }));
            if (!responseWithDoctor.IsSuccess)
            {
                return Results.NotFound(responseWithDoctor.Message);
            }
            Guid doctorId = responseWithDoctor.Result.Id;
            var patient = await FindByLoginOrPesel(req.PatientLogin, req.PatientPesel);
            if (!patient.IsSuccess)
            {
                return Results.NotFound(patient.Message);
            }
            var result = await mediator.Send(new AddAppointmentCommand(patient.Result.Id, doctorId, req.Slot));
            if (!result.IsSuccess)
            {
                return Results.BadRequest(result.Message);
            }
            AppointmentVM vm = mapper.Map<AppointmentVM>(result.Result);

            AppointmentEvent ev = new AppointmentEvent(ActionTypes.AppointmentCreate, DateTime.Now, result.Result);
            await queueService.Push(ev);

            return Results.Ok(vm);
        }


        [HttpDelete("{appointmentId}")]
        [Authorize(Roles ="Admin, Doctor")]
        public async Task<IResult> DeleteApointment(Guid appointmentId)
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
            var person = await mediator.Send(new GetPersonByCredentialsQuery(authorizedUserId));
            if (!person.IsSuccess) 
                return Results.NotFound("You need to have person created to delete appointment");


            if (User.IsInRole("Doctor"))
            {
                var result = await mediator.Send(new GetAppointmentQuery(appointmentId));
                if(!result.IsSuccess) 
                    return Results.BadRequest(result.Message);
                if(result.Result.DoctorId != person.Result.Id)
                    return Results.Unauthorized();
            }
            if(User.IsInRole("Admin"))
            {
                var result = await mediator.Send(new GetAppointmentQuery(appointmentId));
                if (!result.IsSuccess)
                    return Results.BadRequest(result.Message);
            }
            var tryDelete = await mediator.Send(new DeleteAppointmentCommand(appointmentId));
            if (!tryDelete.IsSuccess)
                return Results.BadRequest(tryDelete.Message);
            AppointmentEvent ev = new AppointmentEvent(ActionTypes.AppointmentDelete, DateTime.Now, tryDelete.Result);
            await queueService.Push(ev);

            AppointmentVM vm = mapper.Map<AppointmentVM>(tryDelete.Result);
            return Results.Ok(vm);
        }
    }
}
