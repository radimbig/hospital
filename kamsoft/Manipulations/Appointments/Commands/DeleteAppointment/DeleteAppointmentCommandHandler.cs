using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Appointments.Commands
{
    public class DeleteAppointmentCommandHandler : IRequestHandler<DeleteAppointmentCommand, MediatorResult<Appointment>>
    {
        private readonly HospitalContext ctx;

        public DeleteAppointmentCommandHandler(HospitalContext ctx)
        {
            this.ctx = ctx;
        }

        public async Task<MediatorResult<Appointment>> Handle(DeleteAppointmentCommand request, CancellationToken cancellationToken)
        {
            var target = await ctx.Appointments.FirstOrDefaultAsync(x => x.Id == request.AppointmentId);
            if (target == null)
                return MediatorResult<Appointment>.Failure("No appointment to delete");
            ctx.Appointments.Remove(target);
            await ctx.SaveChangesAsync();

            return MediatorResult<Appointment>.Success(target);
        }
    }
}
