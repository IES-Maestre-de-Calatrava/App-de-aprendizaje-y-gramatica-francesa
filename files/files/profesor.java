package com.example.demo;

import jakarta.persistence.*;

// @Entity → esta clase representa la tabla PROFESOR en MySQL
// @Table  → nombre exacto de la tabla en la BD
@Entity
@Table(name = "PROFESOR")
public class Profesor {

    // Clave primaria — equivale a ID_PROFESOR AUTO_INCREMENT en MySQL
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PROFESOR")
    private Long id;

    // FK hacia la tabla USUARIO
    // Aquí guardamos el ID_USUARIO del profesor
    // para poder buscarlo desde el login
    @Column(name = "ID_USUARIO")
    private Long idUsuario;

    // ── GETTERS Y SETTERS ─────────────────────────────────────────
    public Long getId()               { return id; }
    public void setId(Long id)        { this.id = id; }

    public Long getIdUsuario()            { return idUsuario; }
    public void setIdUsuario(Long id)     { this.idUsuario = id; }
}