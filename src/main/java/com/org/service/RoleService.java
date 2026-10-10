package com.org.service;


import com.org.dto.RoleDTO;
import com.org.mapper.RoleMapper;
import com.org.model.Role;
import com.org.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleMapper roleMapper;

    /**
     * Creates a new Role based on the provided RoleDTO.
     * @param roleDTO The role data to be created.
     * @return The created RoleDTO.
     */
    public RoleDTO createRole(RoleDTO roleDTO) {
        // Convert RoleDTO to Role entity
        Role role = roleMapper.toEntity(roleDTO, null);  // Since no services are involved in this case, passing null for services
        // Save the Role entity to the database
        Role savedRole = roleRepository.save(role);
        // Convert the saved Role entity to a RoleDTO for response
        return roleMapper.toDto(savedRole);
    }

    /**
     * Retrieves a Role by its ID.
     * @param id The ID of the role to retrieve.
     * @return The RoleDTO corresponding to the found Role.
     */
    public RoleDTO getRoleById(Long id) {
        Optional<Role> roleOptional = roleRepository.findById(id);
        if (roleOptional.isEmpty()) {
            throw new RuntimeException("Role not found with id: " + id);
        }
        // Convert the Role entity to RoleDTO
        return roleMapper.toDto(roleOptional.get());
    }

    /**
     * Retrieves all roles in the system.
     * @return A list of RoleDTOs for all roles.
     */
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toList());
    }
}
