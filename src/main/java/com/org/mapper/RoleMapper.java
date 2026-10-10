package com.org.mapper;

import com.org.dto.RoleDTO;
import com.org.model.Role;
import com.org.model.Services;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class RoleMapper {

    public RoleDTO toDto(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setRoleName(role.getRoleName());

        return dto;
    }

    public Role toEntity(RoleDTO roleDTO, Set<Services> services) {
        Role role = new Role();
        role.setId(roleDTO.getId());
        role.setRoleName(roleDTO.getRoleName());
        return role;
    }
}
