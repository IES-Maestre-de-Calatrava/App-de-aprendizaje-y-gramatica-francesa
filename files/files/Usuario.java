package com.example.demo;

import jakarta.persistence.*;

// @Entity → esta clase representa la tabla USUARIO en MySQL
// @Table  → nombre exacto de la tabla en la BD
@Entity
@Table(name = "USUARIO")
public class Usuario {

    // Clave primaria con autoincremento
    // Equivale a ID_USUARIO INT AUTO_INCREMENT en MySQL
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_USUARIO")
    private Long id;

    // Cada @Column conecta el atributo Java con la columna MySQL
    @Column(name = "EMAIL")
    private String email;

    @Column(name = "CONTRASENA")
    private String contrasena;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "APELLIDO")
    private String apellido;

    @Column(name = "CENTRO")
    private String centro;

    // PERFIL → "PROFESOR" o "ALUMNO"
    // Es el campo clave para la redirección del login
    @Column(name = "PERFIL")
    private String perfil;

    // ── GETTERS Y SETTERS ─────────────────────────────────────────
    // Spring los necesita para leer y escribir en la BD

    public Long getId()                    { return id; }
    public void setId(Long id)             { this.id = id; }

    public String getEmail()               { return email; }
    public void setEmail(String email)     { this.email = email; }

    public String getContrasena()              { return contrasena; }
    public void setContrasena(String c)        { this.contrasena = c; }

    public String getNombre()              { return nombre; }
    public void setNombre(String nombre)   { this.nombre = nombre; }

    public String getApellido()                { return apellido; }
    public void setApellido(String apellido)   { this.apellido = apellido; }

    public String getCentro()              { return centro; }
    public void setCentro(String centro)   { this.centro = centro; }

    // getPerfil() es el que usa JavaScript para redirigir
    // devuelve "PROFESOR" → docente.html
    // devuelve "ALUMNO"   → estudiante.html
    public String getPerfil()              { return perfil; }
    public void setPerfil(String perfil)   { this.perfil = perfil; }
}