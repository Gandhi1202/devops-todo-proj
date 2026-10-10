package com.org.securityConfig;
import com.org.JwtUtilSecurity.JwtTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@EnableWebSecurity
@Component
public class SecurityConfig {
        @Autowired
    private JwtTokenFilter jwtTokenFilter;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/role/get/all").permitAll()
                        .requestMatchers("/role/**").hasRole("1")
                        .requestMatchers("/service/**").hasRole("1")
                        .requestMatchers("/rsc/**").hasRole("1")
                        .requestMatchers("/user/login", "/user/register","/user/get/all").permitAll() // Public access
                    .requestMatchers("/projects/all", "/projects/{id}", "/projects/user/{userId}").hasAnyRole("ADMIN","USER","GUEST","1","2","3") // Both roles can access
                        .requestMatchers(HttpMethod.POST, "/projects").hasRole("1") // Only ADMIN can create projects
                        .requestMatchers(HttpMethod.PUT, "/projects/update/{id}").hasRole("1") // Only ADMIN can update projects
                        .requestMatchers(HttpMethod.DELETE, "/projects/delete/{id}").hasRole("1") // Only ADMIN can delete projects

                        //.requestMatchers("/tasks/**").hasRole("ADMIN") // Both roles can access tasks
                        .requestMatchers("/tasks/all", "/tasks/{id}", "/tasks/user/{userId}").hasAnyRole("ADMIN","USER","GUEST","1","2","3") // Both roles can access
                        .requestMatchers(HttpMethod.POST, "/tasks").hasRole("1") // Both roles can create tasks
                        .requestMatchers(HttpMethod.PUT, "/tasks/update/{id}").hasAnyRole("1", "2") // Both roles can update tasks
                        .requestMatchers(HttpMethod.DELETE, "/tasks/delete/{id}").hasRole("1") // Only ADMIN can delete tasks
                        .anyRequest().authenticated() // All other requests require authentication
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Use stateless session
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class); // Add JWT filter

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Adjust this as needed
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true); // Allow credentials if needed

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
//    @Bean
//    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(authorize -> authorize
////                        .requestMatchers("/customer/register", "/customer/login").permitAll() // Allow these endpoints
//                                .anyRequest().permitAll()//.authenticated()
//                );
//        return http.build();
//    }


    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    AuthenticationManager authManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        return authenticationManagerBuilder.build();
    }
}