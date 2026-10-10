package com.org.service;

import com.org.dto.RoleServiceMappingDTO;
import com.org.mapper.RoleServiceMappingMapper;
import com.org.model.Role;
import com.org.model.RoleServiceMapping;
import com.org.model.Services;
import com.org.repository.RoleRepository;
import com.org.repository.ServiceRepository;
import com.org.repository.RoleServiceMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class RoleServiceMappingService {

    @Autowired
    private RoleServiceMappingRepository roleServiceMappingRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private RoleServiceMappingMapper roleServiceMappingMapper;

    // Method to assign services to a role
    public RoleServiceMappingDTO assignServiceToRole(Long roleId, Set<Long> serviceIds) {
        // Fetch the role by ID
        Optional<Role> roleOpt = roleRepository.findById(roleId);
        if (!roleOpt.isPresent()) {
            throw new IllegalArgumentException("Role not found with ID: " + roleId);
        }
        Role role = roleOpt.get();

        // Fetch the services by IDs and check that they exist
        Set<Services> services = new HashSet<>();
        for (Long serviceId : serviceIds) {
            Optional<Services> serviceOpt = serviceRepository.findById(serviceId);
            if (!serviceOpt.isPresent()) {
                throw new IllegalArgumentException("Service not found with ID: " + serviceId);
            }
            services.add(serviceOpt.get());
        }

        // Use the mapper to convert the DTO and services to entities
        Set<RoleServiceMapping> roleServiceMappings = roleServiceMappingMapper.mapToRoleServiceMappingEntities(
            new RoleServiceMappingDTO(roleId, serviceIds), role, services
        );

        // Save all the RoleServiceMappings in the repository
        roleServiceMappingRepository.saveAll(roleServiceMappings);

        // Return the RoleServiceMappingDTO with all serviceIds
        return new RoleServiceMappingDTO(roleId, serviceIds);  // return a single DTO with all serviceIds
    }



    // Method to delete RoleServiceMapping by roleId and serviceId
    public void deleteRoleServiceMapping(Long roleId, Long serviceId) {
        // Fetch the RoleServiceMapping by roleId and serviceId
        Optional<RoleServiceMapping> roleServiceMappingOpt = roleServiceMappingRepository
            .findByRoleIdAndServices_Id(roleId, serviceId);  // Use the corrected query

        if (!roleServiceMappingOpt.isPresent()) {
            throw new IllegalArgumentException("No RoleServiceMapping found for the given Role and Service IDs.");
        }

        // If mapping exists, delete it
        RoleServiceMapping roleServiceMapping = roleServiceMappingOpt.get();
        roleServiceMappingRepository.delete(roleServiceMapping);
    }
}
