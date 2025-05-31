using System;
using kamsoft.Models;

namespace kamsoft.Patterms
{
    /*public class Factory
    {
        public static T Create<T>(IConfigurationFor<T> config) where T : class, IRepository
        {
            switch (config)
            {
                case StorageConfiguration storageConfig:
                    return new StorageRepository(storageConfig.connectionString, storageConfig.DatabaseName) as T;
                case KosmosConfiguration kosmosConfig:
                    return new KosmosRepository(kosmosConfig.ConnectionString, kosmosConfig.DatabaseName, kosmosConfig.ContainerName) as T;
                case InMemoryConfiguration inMemoryConfig:
                    return new InMemoryRepository() as T;
            }
            return null;
        }
    }*/
    
}