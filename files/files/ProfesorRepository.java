public class ProfesorRepository {
    
}
package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// JpaRepository<Profesor, Long> →
//   - Profesor = la clase que maneja (tabla PROFESOR)
//   - Long     = tipo de la clave primaria (ID_PROFESOR)

@Repository
public interface ProfesorRepository extends JpaRepository<Profesor, Long> {

    // Spring genera este método automáticamente solo con declararlo.
    // Busca un profesor en la BD por su ID_USUARIO.
    //
    // Equivale a este SQL:
    // SELECT * FROM PROFESOR WHERE ID_USUARIO = ?
    //
    // Lo usamos en el login para obtener el ID_PROFESOR real
    // a partir del ID_USUARIO devuelto por la autenticación
    Optional<Profesor> findByIdUsuario(Long idUsuario);
}