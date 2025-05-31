namespace kamsoft.Patterms
{
    public interface IConfigurationFor<in T>
    {
    }
    public record StorageConfiguration(string connectionString, string DatabaseName) : IConfigurationFor<StorageRepository>;
    
}
