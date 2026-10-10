package com.org.controller;

import com.org.dto.RoleServiceMappingDTO;
import com.org.service.RoleServiceMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rsc")
public class RoleServiceMappingController {

    @Autowired
    private RoleServiceMappingService roleServiceMappingService;

    // Endpoint to assign a service to a role
    @PostMapping("/assign")
    public ResponseEntity<RoleServiceMappingDTO> assignServiceToRole(@RequestBody RoleServiceMappingDTO roleServiceMappingDTO) {
        try {
            // Call the service method to assign the service to the role
            RoleServiceMappingDTO result = roleServiceMappingService.assignServiceToRole(roleServiceMappingDTO.getRoleId(), roleServiceMappingDTO.getServiceIds());
            return ResponseEntity.ok(result);  // Return the DTO with status 200 OK
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);  // Return 400 Bad Request if something went wrong
        }
    }

    // Endpoint to delete a RoleServiceMapping by roleId and serviceId
    @DeleteMapping("/{roleId}/service/{serviceId}")
    public ResponseEntity<Void> deleteRoleServiceMapping(@PathVariable Long roleId, @PathVariable Long serviceId) {
        try {
            // Call the service method to delete the RoleServiceMapping
            roleServiceMappingService.deleteRoleServiceMapping(roleId, serviceId);
            return ResponseEntity.noContent().build();  // Return 204 No Content for successful deletion
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();  // Return 404 Not Found if mapping not found
        }
    }
}
