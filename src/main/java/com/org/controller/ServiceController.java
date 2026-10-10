package com.org.controller;

import com.org.dto.ServicesDTO;
import com.org.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/service")
public class ServiceController {
    @Autowired
    private ServiceService serviceService;

    @PostMapping("/post")
    public ResponseEntity<ServicesDTO> createService(@RequestBody ServicesDTO serviceDTO) {
        return new ResponseEntity<>(serviceService.createService(serviceDTO), HttpStatus.CREATED);
    }

    @GetMapping("/get/all")
    public ResponseEntity<List<ServicesDTO>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ServicesDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }
    @GetMapping("/get/byRole/{roleId}")
    public ResponseEntity<List<ServicesDTO>> getServicesByRoleId(@PathVariable Long roleId) {
        return ResponseEntity.ok(serviceService.getServicesByRoleId(roleId));
    }
   

    @PutMapping("/update/{id}")
    public ResponseEntity<ServicesDTO> updateService(@PathVariable Long id, @RequestBody ServicesDTO serviceDTO) {
        return ResponseEntity.ok(serviceService.updateService(id, serviceDTO));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
