package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

// @RestController → devuelve JSON, no páginas HTML
// @CrossOrigin    → permite que el HTML llame a esta API
@RestController
@CrossOrigin(origins = "*")
public class LoginController {

    // Spring inyecta automáticamente ambos repositorios
    @Autowired
    private UsuarioRepository usuarioRepository;

    // Necesitamos ProfesorRepository para obtener el ID_PROFESOR real
    // que puede ser distinto al ID_USUARIO
    @Autowired
    private ProfesorRepository profesorRepository;

    // ──────────────────────────────────────────────────────────────
    // POST /api/login
    //
    // Recibe:  { "email": "...", "contrasena": "..." }
    //
    // Devuelve si OK:
    //   PROFESOR → { success: true, perfil: "PROFESOR",
    //                nombre: "Carlos", idUsuario: 1, idProfesor: 1 }
    //   ALUMNO   → { success: true, perfil: "ALUMNO",
    //                nombre: "Ana", idUsuario: 2 }
    //
    // Devuelve si error:
    //   { success: false, mensaje: "Email o contraseña incorrectos" }
    // ──────────────────────────────────────────────────────────────
    @PostMapping("/api/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request) {

        Map<String, Object> respuesta = new HashMap<>();

        // Buscar usuario por email y contraseña
        // SELECT * FROM USUARIO WHERE EMAIL = ? AND CONTRASENA = ?
        Optional<Usuario> resultado = usuarioRepository
            .findByEmailAndContrasena(
                request.getEmail(),
                request.getContrasena()
            );

        if (resultado.isPresent()) {

            // ── USUARIO ENCONTRADO ────────────────────────────────
            Usuario usuario = resultado.get();

            // Datos comunes para cualquier perfil
            respuesta.put("success",   true);
            respuesta.put("perfil",    usuario.getPerfil());
            respuesta.put("nombre",    usuario.getNombre());
            respuesta.put("idUsuario", usuario.getId());

            // Si es PROFESOR buscamos su ID_PROFESOR en la tabla PROFESOR
            // porque puede ser distinto al ID_USUARIO
            // SELECT * FROM PROFESOR WHERE ID_USUARIO = ?
            if ("PROFESOR".equals(usuario.getPerfil())) {

                Optional<Profesor> profesor = profesorRepository
                    .findByIdUsuario(usuario.getId());

                if (profesor.isPresent()) {
                    // Añadimos el ID_PROFESOR real a la respuesta
                    // login.js lo guardará en sessionStorage como 'profesor_id'
                    // docente.js lo usará para las peticiones a la API
                    respuesta.put("idProfesor", profesor.get().getId());
                } else {
                    // Usuario con perfil PROFESOR pero sin registro
                    // en la tabla PROFESOR — error de datos
                    respuesta.put("success", false);
                    respuesta.put("mensaje", "Profesor no encontrado en el sistema");
                    return ResponseEntity.status(404).body(respuesta);
                }
            }

            return ResponseEntity.ok(respuesta);

        } else {

            // ── USUARIO NO ENCONTRADO ─────────────────────────────
            // Email o contraseña incorrectos
            respuesta.put("success", false);
            respuesta.put("mensaje", "Email o contraseña incorrectos");
            return ResponseEntity.status(401).body(respuesta);
        }
    }
}