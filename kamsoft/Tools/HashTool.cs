using System.Security.Cryptography;
using System.Text;

namespace kamsoft.Tools
{
    
    public static class HashTool
    {
        public static string GenerateHash(string input)
        {
            using(var hashAlgorithm = SHA256.Create())
            {
                return GetHash(hashAlgorithm, input);
            }
        }

        public static bool VerifyHash(string input, string hash)
        {
            return GenerateHash(input) == hash;
        }
        private static string GetHash(HashAlgorithm hashAlgorithm, string input)
        {

            // Convert the input string to a byte array and compute the hash.
            byte[] data = hashAlgorithm.ComputeHash(Encoding.UTF8.GetBytes(input));

            // Create a new Stringbuilder to collect the bytes
            // and create a string.
            var sBuilder = new StringBuilder();

            // Loop through each byte of the hashed data
            // and format each one as a hexadecimal string.
            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }

            // Return the hexadecimal string.
            return sBuilder.ToString();
        }
    }
}
