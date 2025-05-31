namespace kamsoft.Patterms
{
    public sealed record Error(string Code, string Description)
    {
        public static readonly Error None = new Error("None", "No error");
    }
    public class Result
    {
        public bool IsSuccess { get;}
        public bool IsFailure => !IsSuccess;
        public Error Error { get; }
        private Result(bool isSuccess, Error error)
        {
            IsSuccess = isSuccess;
            Error = error;
        }
        public Result Succes() => new Result(true, Error.None);
        public Result Failure(Error error) => new Result(false, error);

    }
}
