using FluentValidation;

namespace kamsoft.Manipulations.Appointments.Queries.GetAppointments
{
    public class GetAppointmentsQueryValidator : AbstractValidator<GetAppointmentsQuery>
    {
        public GetAppointmentsQueryValidator()
        {
            RuleFor(x=>x.Count).LessThanOrEqualTo(100);
            RuleFor(x =>x.Count).GreaterThanOrEqualTo(1);
        }
    }
}
