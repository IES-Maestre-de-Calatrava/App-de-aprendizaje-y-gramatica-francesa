package com.example.demo;

// Esta clase representa los datos que envía el formulario de login.
// JavaScript enviará un JSON con este formato:
// { "email": "profesor@grammou.com", "contrasena": "1234" }
// Spring lo convierte automáticamente a este objeto.
public class LoginRequest {

    private String email;
    private String contrasena;

    // Getters y Setters
    public String getEmail()                   { return email; }
    public void setEmail(String email)         { this.email = email; }

    public String getContrasena()              { return contrasena; }
    public void setContrasena(String c)        { this.contrasena = c; }
}