package com.org.service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import com.org.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.org.dto.ProjectDTO;
import com.org.exception.ProjectNotFoundException;
import com.org.model.Project;
import com.org.model.Users;
import com.org.repository.ProjectRepository;
@Service
public class ProjectService {
    @Autowired
    public ProjectRepository projectRepository;
    @Autowired public UserRepository usersRepository;
    private ProjectDTO entityToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        if (project != null) {
            dto.setId(project.getId());
            dto.setName(project.getName());
            dto.setDateTime(project.getDateTime());
            if (project.getUsers() != null) {
                Set<Long> userIds = project.getUsers().stream()
                        .map(Users::getId)  // Assuming Users class has a getId() method
                        .collect(Collectors.toSet());
                dto.setUserId(userIds);
            }
        }
        return dto;
    }
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream().map(this::entityToDTO).collect(Collectors.toList());
    }


    public ProjectDTO getProject(Long id) {
        return entityToDTO(projectRepository.findById(id) .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id)));
    }
    public List<ProjectDTO> getProjectsByUserId(Long userId) {
        List<Project> projects = projectRepository.findByUsers_Id(userId);
        return projects.stream().map(this::entityToDTO).collect(Collectors.toList());
    }

    public ProjectDTO createProject(ProjectDTO projectDTO) {
        // Check if projectDTO is valid
        if (projectDTO.getName() == null || projectDTO.getName().trim().isEmpty() || containsDigits(projectDTO.getName()) || containsSpecialCharacters(projectDTO.getName())) {
            throw new IllegalArgumentException("Project name cannot be null, empty, a number, or contain special characters.");
        }

        // Create the project
        Project project = new Project();
        project.setName(projectDTO.getName());
        project.setDateTime(projectDTO.getDateTime());

        // Convert user IDs to Users objects
        if (projectDTO.getUserId() != null) {
            List<Users> users = usersRepository.findAllById(projectDTO.getUserId());
            project.setUsers(users);
        }

        return entityToDTO(projectRepository.save(project));
    }

    // Method to check if the name contains digits
    public boolean containsDigits(String name) {
        return name.matches(".*\\d.*");
    }

    // Method to check if the name contains special characters
    public boolean containsSpecialCharacters(String name) {
        // This regular expression allows only letters (both uppercase and lowercase) and spaces.
        return !name.matches("[a-zA-Z ]*");
    }

    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));
        if (project != null) {
            project.setName(projectDTO.getName());
            project.setDateTime(projectDTO.getDateTime());
            if (projectDTO.getUserId() != null) {
                List<Users> users = usersRepository.findAllById(projectDTO.getUserId());
                project.setUsers(users);
            }
            return entityToDTO(projectRepository.save(project));
        }
        return null;
    }


    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ProjectNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    public List<ProjectDTO> getProjectsByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay(); // Start of the day
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59); // End of the day
        return projectRepository.findByDateTimeBetween(startDateTime, endDateTime).stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

}