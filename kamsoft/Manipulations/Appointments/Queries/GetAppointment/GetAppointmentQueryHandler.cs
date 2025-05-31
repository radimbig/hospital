using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Appointments.Queries
{
    public class GetAppointmentQueryHandler : IRequestHandler<GetAppointmentQuery, MediatorResult<Appointment>>
    {
        private readonly HospitalContext ctx;

        public GetAppointmentQueryHandler(HospitalContext ctx)
        {
            this.ctx = ctx;
        }

        public async Task<MediatorResult<Appointment>> Handle(GetAppointmentQuery request, CancellationToken cancellationToken)
        {
            var target = await ctx.Appointments.Include(x=>x.Patient).Include(x=>x.Doctor).FirstOrDefaultAsync(x => x.Id == request.AppointmentId);
            if(target == null)
                    return MediatorResult<Appointment>.Failure($"Appointment with {request.AppointmentId} does not exist");

            return MediatorResult<Appointment>.Success(target);
        }
    }
}
