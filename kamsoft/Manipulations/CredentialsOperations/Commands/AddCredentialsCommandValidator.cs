using FluentValidation;

namespace kamsoft.Manipulations.CredentialsOperations.Commands
{
    public class AddCredentialsCommandValidator : AbstractValidator<AddCredentialsCommand>
    {
        public AddCredentialsCommandValidator()
        {
            RuleFor(x => x.Login).NotEmpty().WithMessage("Login is required.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
            RuleFor(x => x.Password).MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
            RuleFor(x => x.Password).MaximumLength(20).WithMessage("Password must be at max 20 characters long.");
        }
    }
    
}
