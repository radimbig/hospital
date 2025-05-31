using FluentValidation;

namespace kamsoft.Manipulations.Persons.Queries
{
    public class GetPersonByPeselQueryValidator : AbstractValidator<GetPersonByPeselQuery>
    {
        public GetPersonByPeselQueryValidator()
        {
            RuleFor(x => x.Pesel)
                .NotEmpty().WithMessage("PESEL cannot be empty.")
                .Length(11).WithMessage("PESEL must be exactly 11 characters long.")
                .Matches(@"^\d{11}$").WithMessage("PESEL must consist of digits only.");
        }
    }
}
