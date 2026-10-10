package com.org.dto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class LoginResponseDTO {
    private UserDTO user;
    private List<ProjectDTO> projects;
    private List<TaskDTO> tasks;

    public LoginResponseDTO(UserDTO user, List<ProjectDTO> projects, List<TaskDTO> tasks) {
        this.user = user;
        this.projects = projects;
        this.tasks = tasks;
    }
}