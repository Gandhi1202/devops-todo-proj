package com.org.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
public class RoleServiceMappingDTO {

    private Long roleId;           // ID of the role
    private Set<Long> serviceIds;  // Set of service IDs
    
    

    // Constructor for easier initialization
    public RoleServiceMappingDTO(Long roleId, Set<Long> serviceIds) {
        this.roleId = roleId;
        this.serviceIds = serviceIds;
    }

    // Default constructor (this is required by Spring and other frameworks like Jackson)
    public RoleServiceMappingDTO() {}
}
