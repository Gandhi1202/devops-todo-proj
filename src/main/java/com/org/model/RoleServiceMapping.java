package com.org.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class RoleServiceMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;  // Foreign key to Role
    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Services services; // Foreign key to Services
}
