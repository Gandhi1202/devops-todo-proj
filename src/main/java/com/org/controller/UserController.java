package com.org.controller;

import com.org.JwtUtilSecurity.JwtTokenUtil;
import com.org.dto.LoginResponseDTO;
import com.org.dto.LoginUserDTO;
import com.org.dto.RegisterUserDTO;
import com.org.dto.UserDTO;
import com.org.service.TokenBlacklistService;
import com.org.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserService userService,
                          JwtTokenUtil jwtTokenUtil,
                          TokenBlacklistService tokenBlacklistService,
                          BCryptPasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.tokenBlacklistService = tokenBlacklistService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterUserDTO registerUserDTO, BindingResult bindingResult) {
        // Validate the DTO and handle validation errors
        userService.registerUser(registerUserDTO, bindingResult);

        if (bindingResult.hasErrors()) {
            // Collect all error messages
            String errors = bindingResult.getAllErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body("Validation failed: " + errors);
        }

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginUserDTO loginUserDTO) {
        Optional<LoginResponseDTO> loginResponse = userService.loginUser(loginUserDTO);

        if (loginResponse.isPresent()) {
            LoginResponseDTO response = loginResponse.get();

            // Extract the user's role_id from the response and convert to String
            String roleId = String.valueOf(response.getUser().getRoleId()); // Convert Long to String

            // Generate the JWT token using the user's email and role_id
            String token = jwtTokenUtil.generateToken(response.getUser().getEmail(), roleId);

            // Prepare the response body
            Map<String, Object> responseBody = new LinkedHashMap<>();
            responseBody.put("token", token);
            responseBody.put("user", response.getUser()); // User data
            responseBody.put("projects", response.getProjects()); // Associated projects
            responseBody.put("tasks", response.getTasks()); // Associated tasks

            return ResponseEntity.ok(responseBody);
        } else {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
    }




    @GetMapping("/details")
    public ResponseEntity<?> getUserDetails(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); // Remove "Bearer " prefix
            try {
                LoginResponseDTO response = userService.getUserDetailsFromToken(token);
                return ResponseEntity.ok(response);
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
            }
        } else {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            tokenBlacklistService.blacklistToken(token); // Update to handle logout correctly
            return ResponseEntity.ok("Logged out successfully");
        } else {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    @GetMapping("/get/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody RegisterUserDTO registerUserDTO) {
        try {
            userService.updateUser(id, registerUserDTO);
            return ResponseEntity.ok("User updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
