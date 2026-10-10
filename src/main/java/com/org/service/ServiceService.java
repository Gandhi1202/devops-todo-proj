package com.org.service;

import com.org.dto.ServicesDTO;
import com.org.mapper.ServiceMapper;
import com.org.model.Services;
import com.org.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service
public class ServiceService {
    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServiceMapper serviceMapper;

    public ServicesDTO createService(ServicesDTO serviceDTO) {
        Services service = serviceMapper.toEntity(serviceDTO);
        Services savedService = serviceRepository.save(service);
        return serviceMapper.toDto(savedService);
    }

    public List<ServicesDTO> getAllServices() {
        return serviceRepository.findAll()
                .stream()
                .map(serviceMapper::toDto)
                .collect(Collectors.toList());
    }
    public List<ServicesDTO> getServicesByRoleId(Long roleId) {
        return serviceRepository.findServicesByRoleId(roleId)
                .stream()
                .map(serviceMapper::toDto)
                .collect(Collectors.toList());
    }


    public ServicesDTO getServiceById(Long id) {
        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return serviceMapper.toDto(service);
    }

    public ServicesDTO updateService(Long id, ServicesDTO serviceDTO) {
        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setServiceName(serviceDTO.getServiceName());
        Services updatedService = serviceRepository.save(service);
        return serviceMapper.toDto(updatedService);
    }

    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}
