namespace kamsoft.Patterms
{
    public interface IMediatorResult<T> where T : class
    {
        T Result { get; }
        bool IsSuccess { get; }
        string Message { get; }
    }
    public class MediatorResult<T> : IMediatorResult<T> where T : class
    {
        public T Result { get; private set; }
        public bool IsSuccess { get; private set; }
        public string Message { get; private set; }
        public MediatorResult(T result, bool isSuccess, string message)
        {
            Result = result;
            IsSuccess = isSuccess;
            Message = message;
        }
        public static MediatorResult<T> Success(T result) => new MediatorResult<T>(result, true, "Operation completed successfully.");
        public static MediatorResult<T> Failure(string message) => new MediatorResult<T>(null, false, message);
    }
}
