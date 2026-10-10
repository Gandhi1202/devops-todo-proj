package com.org.mapper;

import com.org.dto.ServicesDTO;
import com.org.model.Services;
import org.springframework.stereotype.Component;

@Component
public class ServiceMapper {

    public ServicesDTO toDto(Services service) {
        ServicesDTO dto = new ServicesDTO();
        dto.setId(service.getId());
        dto.setServiceName(service.getServiceName());
        return dto;
    }
    public Services toEntity(ServicesDTO serviceDTO) {
        Services service = new Services();
        service.setId(serviceDTO.getId());
        service.setServiceName(serviceDTO.getServiceName());
        return service;
    }
}
