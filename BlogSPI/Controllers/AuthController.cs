using BlogSPI.Api.Data;
using BlogSPI.Api.Models;
using BlogSPI.Api.Models.DTOs;
using BlogSPI.Api.Services;
using Microsoft.AspNetCore.Mvc;
using BlogSPI.Api.Core.Abstractions;

namespace BlogSPI.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController: ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext context, IPasswordHasher passwordHasher, TokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }
    
    [HttpPost("signup")]
    public IActionResult Signup(SignupDto signupDto)
    {
        var userEntity = new User()
        {
            Username = signupDto.Username,
            Password = _passwordHasher.Hash(signupDto.Password)
        };
        _context.Add(userEntity);
        _context.SaveChanges();
        
        return StatusCode(201);
    }
    
    [HttpPost("signin")]
    public IActionResult Signin(SigninDto signinDto)
    {
        // Verifica se o usuário existe no banco de dados
        var existingUser = _context.Users.FirstOrDefault(u => u.Username == signinDto.Username);

        if (existingUser == null || !_passwordHasher.Verify(existingUser.Password, signinDto.Password))
        {
            // Retorna 401 Unauthorized se as credenciais estiverem incorretas
            return Unauthorized("Username or password is incorrect");
        }

        // Se as credenciais forem válidas, cria o token JWT
        var token = _tokenService.Generate(existingUser);

        // Retorna o token JWT no corpo da resposta
        return Ok(new { token });
    }

}