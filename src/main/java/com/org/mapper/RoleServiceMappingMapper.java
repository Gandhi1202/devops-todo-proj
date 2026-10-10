package com.org.mapper;

import com.org.dto.RoleServiceMappingDTO;
import com.org.model.Role;
import com.org.model.RoleServiceMapping;
import com.org.model.Services;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class RoleServiceMappingMapper {

    // Convert RoleServiceMapping entity to DTO
    public RoleServiceMappingDTO mapToRoleServiceMappingDTO(RoleServiceMapping mapping) {
        // Create a new DTO object
        RoleServiceMappingDTO dto = new RoleServiceMappingDTO();

        // Set the role ID from the mapping entity
        dto.setRoleId(mapping.getRole().getId());

        // Set the service IDs from the mapping entity (in this case, only one service)
        Set<Long> serviceIds = new HashSet<>();
        serviceIds.add(mapping.getServices().getId());
        dto.setServiceIds(serviceIds); // Set the serviceIds set

        return dto;
    }

    // Convert RoleServiceMappingDTO to entities (RoleServiceMapping) for a set of services
    public Set<RoleServiceMapping> mapToRoleServiceMappingEntities(RoleServiceMappingDTO dto, Role role, Set<Services> services) {
        Set<RoleServiceMapping> mappings = new HashSet<>();

        // Iterate over the set of services and create a mapping for each
        for (Services service : services) {
            RoleServiceMapping mapping = new RoleServiceMapping();
            mapping.setRole(role);
            mapping.setServices(service);
            mappings.add(mapping);
        }

        return mappings;
    }
}
