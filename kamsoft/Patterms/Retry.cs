namespace kamsoft.Patterms
{
    public class RetryHelper
    {
        public static async Task<T> Retry<T>(Func<Task<T>> func, TimeSpan retryInterval, int retryCount)
        {
            try
            {
                return await func();

            }catch when(retryCount > 0){
                await Task.Delay(retryInterval);
                return await Retry(func, retryInterval, retryCount - 1);
            }

        }
        public static async Task Retry(Func<Task> func, TimeSpan retryInterval, int retryCount)
        {
            try
            {
                await func();

            }
            catch when (retryCount > 0)
            {
                await Task.Delay(retryInterval);
                await Retry(func, retryInterval, retryCount - 1);
            }

        }
    }
}
