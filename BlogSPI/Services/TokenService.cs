using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BlogSPI.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace BlogSPI.Api.Services;

public class TokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Generate(User user)
    {
        var handler = new JwtSecurityTokenHandler(); // Instancia manipuladora responsavel por ter os metodos para criacao de tokens

        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? string.Empty);

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),// Array de bytes [e aceito nao aceita string
            SecurityAlgorithms.HmacSha256Signature); // Chave/Algoitmo

        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Subject = GenerateClaims(user),
            SigningCredentials = credentials,
            Expires = DateTime.UtcNow.AddHours(2),
        };
        
        var token = handler.CreateToken(tokenDescriptor);

        return handler.WriteToken((token));
    }

    private static ClaimsIdentity GenerateClaims(User user)
    {
        var ci = new ClaimsIdentity();
        ci.AddClaim(new Claim(ClaimTypes.Name, user.Username)); // Chave valor
        ci.AddClaim(new Claim("id", user.Id.ToString()));
        return ci;
    }
}