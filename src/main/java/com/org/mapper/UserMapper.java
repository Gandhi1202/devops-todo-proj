package com.org.mapper;


import com.org.dto.RegisterUserDTO;
import com.org.dto.UserDTO;
import com.org.dto.ProjectDTO;
import com.org.dto.TaskDTO;
import com.org.model.Role;
import com.org.model.Users;
import com.org.model.Project;
import com.org.model.Task;
import com.org.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    @Autowired
    RoleRepository roleRepository;

    public Users toEntity(RegisterUserDTO registerUserDTO) {
        Users user = new Users();
        user.setName(registerUserDTO.getName());
        user.setEmail(registerUserDTO.getEmail());
        user.setContact(registerUserDTO.getContact());

        // Set the role using roleId
        if (registerUserDTO.getRoleId() != null) {
            Role role = roleRepository.findById(registerUserDTO.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        return user;
    }

    public UserDTO toDTO(Users user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRoleId(user.getRole() != null ? user.getRole().getId() : null);
        dto.setContact(user.getContact());

        return dto;
    }

    public ProjectDTO toProjectDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDateTime(project.getDateTime());
        return dto;
    }

    public TaskDTO toTaskDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setName(task.getName());
        dto.setStatus(task.getStatus());
        dto.setDateTime(task.getDateTime());
        dto.setProjectId(task.getProject().getId());
        return dto;
    }
}
