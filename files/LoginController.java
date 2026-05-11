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

    // Spring inyecta automáticamente el repositorio
    @Autowired
    private UsuarioRepository usuarioRepository;

    // ──────────────────────────────────────────────────────────────
    // POST /api/login
    //
    // JavaScript lo llama cuando el usuario pulsa "Iniciar sesión"
    //
    // Recibe un JSON:  { "email": "...", "contrasena": "..." }
    // Devuelve JSON:
    //   Si OK:    { "success": true,  "perfil": "PROFESOR", "nombre": "Jean" }
    //   Si error: { "success": false, "mensaje": "Credenciales incorrectas" }
    // ──────────────────────────────────────────────────────────────
    @PostMapping("/api/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request) {

        Map<String, Object> respuesta = new HashMap<>();

        // Buscar en BD un usuario con ese email y contraseña
        // Equivale a: SELECT * FROM USUARIO WHERE EMAIL = ? AND CONTRASENA = ?
        Optional<Usuario> resultado = usuarioRepository
            .findByEmailAndContrasena(
                request.getEmail(),
                request.getContrasena()
            );

        if (resultado.isPresent()) {

            // ── USUARIO ENCONTRADO ────────────────────────────────
            // Obtenemos el objeto Usuario con todos sus datos
            Usuario usuario = resultado.get();

            // Devolvemos al JavaScript:
            //   perfil  → "PROFESOR" o "ALUMNO" (para la redirección)
            //   nombre  → para mostrar "Bienvenido, Jean" en la página
            //   id      → por si se necesita en peticiones futuras
            respuesta.put("success", true);
            respuesta.put("perfil",  usuario.getPerfil());
            respuesta.put("nombre",  usuario.getNombre());
            respuesta.put("id",      usuario.getId());
            return ResponseEntity.ok(respuesta);

        } else {

            // ── USUARIO NO ENCONTRADO ─────────────────────────────
            // Email o contraseña incorrectos
            respuesta.put("success", false);
            respuesta.put("mensaje", "Email o contraseña incorrectos");
            return ResponseEntity.status(401).body(respuesta);
            // 401 = Unauthorized (no autorizado)
        }
    }
}