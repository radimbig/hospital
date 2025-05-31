using kamsoft.Patterms;

namespace kamsoft.Patterms
{
    public interface ISpecification<T> where T : class
    {
        bool IsSatisfiedBy(T input);
    }
    public abstract class Specification<T> : ISpecification<T> where T : class
    {
        public abstract bool IsSatisfiedBy(T input);

        public ISpecification<T> And(ISpecification<T> other)
        {
            return new AndSpecification<T>(this, other);
        }
        public ISpecification<T> Or(ISpecification<T> other)
        {
            return new OrSpecification<T>(this, other);
        }
    }
    public class AndSpecification<T> : Specification<T> where T : class
    {
        private readonly ISpecification<T> Left;
        private readonly ISpecification<T> Right;
        public AndSpecification(ISpecification<T> left, ISpecification<T> right)
        {
            this.Left = left;
            this.Right = right;

        }



        public override bool IsSatisfiedBy(T input)
        {
            return Left.IsSatisfiedBy(input) && Right.IsSatisfiedBy(input);
        }

    }

    public class OrSpecification<T> : Specification<T> where T : class
    {
        private readonly ISpecification<T> Left;
        private readonly ISpecification<T> Right;
        public OrSpecification(ISpecification<T> left, ISpecification<T> right)
        {
            this.Left = left;
            this.Right = right;

        }

        public override bool IsSatisfiedBy(T input)
        {
            return Left.IsSatisfiedBy(input) || Right.IsSatisfiedBy(input);
        }
    }

    public class Rule<T> where T: class
    {
        public ISpecification<T> Specification;
        public Rule(ISpecification<T> specification)
        {
            this.Specification = specification;
        }
    }

    public abstract class Validator<T> where T : class
    {
        private List<Rule<T>> rules = new List<Rule<T>>();


        public Validator<T> Add(Rule<T> rule)
        {
            rules.Add(rule);
            return this;
        }
        public T Execute(T input)
        {
            foreach (var rule in rules)
            {
                if (!rule.Specification.IsSatisfiedBy(input))
                {
                    throw new Exception("Validation failed");
                }
            }
            return input;
        }
    }
}
