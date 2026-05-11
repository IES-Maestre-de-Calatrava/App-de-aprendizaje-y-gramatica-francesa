package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// JpaRepository<Usuario, Long> →
//   - Usuario = la clase que maneja (tabla USUARIO)
//   - Long    = tipo de la clave primaria (ID_USUARIO)

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Spring genera automáticamente este método solo con declararlo.
    // Busca un usuario en la BD por EMAIL y CONTRASENA a la vez.
    //
    // Equivale a este SQL:
    // SELECT * FROM USUARIO WHERE EMAIL = ? AND CONTRASENA = ?
    //
    // Optional → puede devolver un usuario o estar vacío (si no existe)
    // Lo usamos en el login para comprobar si las credenciales son correctas
    Optional<Usuario> findByEmailAndContrasena(String email, String contrasena);
}