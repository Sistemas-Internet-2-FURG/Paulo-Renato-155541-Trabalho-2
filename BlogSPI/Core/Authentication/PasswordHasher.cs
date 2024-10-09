using System.Security.Cryptography;
using BlogSPI.Api.Core.Abstractions;

public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 128 / 8; // 16 Bites (128 bits)
    private const int KeySize = 256 / 8; // 32 Bites (256 bits)
    private const int Iterations = 10000; // Numero de iterações para geração da hash
    private static readonly HashAlgorithmName _hashAlgorithmName = HashAlgorithmName.SHA256;
    private static char Delimiter = ';';
    
    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize); // Um array de bytes aleatorios no tamanho definido
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, _hashAlgorithmName, KeySize); //
        

        return string.Join(Delimiter, Convert.ToBase64String(salt), Convert.ToBase64String(hash));
    }

    public bool Verify(string passwordHash, string inputPassword)
    {
        var parts = passwordHash.Split(Delimiter);
        if (parts.Length != 2)
        {
            throw new FormatException("The password hash is not in the expected format.");
        }

        // Convert the base64 string back to byte arrays
        var salt = Convert.FromBase64String(parts[0]);
        var storedHash = Convert.FromBase64String(parts[1]);

        // Compute the hash of the input password using the same salt
        var hashInput = Rfc2898DeriveBytes.Pbkdf2(inputPassword, salt, Iterations, _hashAlgorithmName, KeySize);

        // Use a constant-time comparison to prevent timing attacks
        return CryptographicOperations.FixedTimeEquals(storedHash, hashInput);
    }
}