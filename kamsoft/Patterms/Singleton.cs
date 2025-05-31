using System;

namespace kamsoft.Patterms
{
    public sealed class Singleton
    {
        private static readonly Lazy<Singleton> _instance = new Lazy<Singleton>(() => new Singleton());

        // Private constructor to prevent direct instantiation
        private Singleton()
        {
        }

        // Public property to access the single instance
        public static Singleton Instance
        {
            get { return _instance.Value; }
        }

        // Example method to demonstrate singleton usage
        public void DoSomething()
        {
            Console.WriteLine("Singleton is doing something...");
        }
    }
} 