package com.org.service;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.swing.text.TableView.TableRow;

import com.org.repository.UserRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Table;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.table.OdfTable;
import org.odftoolkit.odfdom.doc.table.OdfTableCell;
import org.odftoolkit.odfdom.doc.table.OdfTableRow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.org.dto.TaskDTO;
import com.org.exception.ProjectNotFoundException;
import com.org.exception.TaskNotFoundException;
import com.org.model.Project;
import com.org.model.Task;
import com.org.model.Users; // Make sure to import the Users model
import com.org.repository.ProjectRepository;
import com.org.repository.TaskRepository;
import com.org.repository.UserRepository; // Import the Users repository
@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository usersRepository; // Inject the Users repository

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream().map(this::entityToDTO).collect(Collectors.toList());
    }

    public TaskDTO getTask(Long id) {
        return entityToDTO(taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException("Task is not found on id " + id)));
    }

    public List<TaskDTO> createTasks(List<TaskDTO> taskDTOs) {
        return taskDTOs.stream()
                .map(taskDTO -> {
                    // Validate the task name
                    if (taskDTO.getName() == null || taskDTO.getName().trim().isEmpty() || containsDigits(taskDTO.getName()) || containsSpecialCharacters(taskDTO.getName())) {
                        throw new IllegalArgumentException("Task name cannot be null, empty, a number, or contain special characters.");
                    }

                    // Retrieve the project for the task
                    Project project = projectRepository.findById(taskDTO.getProjectId())
                            .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + taskDTO.getProjectId()));

                    // Create the task object
                    Task task = new Task();
                    task.setName(taskDTO.getName());
                    task.setStatus(taskDTO.getStatus());
                    task.setProject(project);
                    task.setDateTime(taskDTO.getDateTime());

                    // Handle user IDs
                    if (taskDTO.getUserId() != null && !taskDTO.getUserId().isEmpty()) {
                        List<Users> validUsers = validateTaskUsers(project, taskDTO.getUserId());
                        task.setUsers(validUsers);
                    } else {
                        task.setUsers(Collections.emptyList()); // Set to empty if no users provided
                    }

                    return entityToDTO(taskRepository.save(task)); // Save the task and convert to DTO
                })
                .collect(Collectors.toList()); // Collect the list of DTOs
    }

    // Method to check if the name contains digits
    public boolean containsDigits(String name) {
        return name.matches(".*\\d.*"); // Regex to check if there are digits in the name
    }

    // Method to check if the name contains special characters
    public boolean containsSpecialCharacters(String name) {
        // This regular expression allows only letters (both uppercase and lowercase) and spaces
        return !name.matches("[a-zA-Z ]*"); // If the name contains anything other than letters and spaces, it returns true
    }



    private List<Users> validateTaskUsers(Project project, Set<Long> userIds) {
        // Get the list of users assigned to the project
        Set<Long> projectUserIds = project.getUsers().stream()
                .map(Users::getId)
                .collect(Collectors.toSet());

        // Check if all task user IDs belong to the project’s user IDs
        List<Users> validUsers = userIds.stream()
                .filter(projectUserIds::contains) // Only keep valid users
                .map(usersRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());

        // If some user IDs are invalid, throw an exception
        if (validUsers.size() != userIds.size()) {
            throw new IllegalArgumentException("Some users are not assigned to the project.");
        }

        return validUsers;
    }

    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException("Task not found with id " + id));

        task.setName(taskDTO.getName());
        task.setStatus(taskDTO.getStatus());
        task.setDateTime(taskDTO.getDateTime());

        // Get the project associated with the task
        Project project = projectRepository.findById(taskDTO.getProjectId())
                .orElseThrow(() -> new TaskNotFoundException("Task is not found with id " + id));
        task.setProject(project);

        // Validate users belong to the project before assigning
        if (taskDTO.getUserId() != null && !taskDTO.getUserId().isEmpty()) {
            List<Users> validUsers = validateTaskUsers(project, taskDTO.getUserId());
            task.setUsers(validUsers);
        }

        return entityToDTO(taskRepository.save(task));
    }


    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<TaskDTO> getTasksByProjectId(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream().map(this::entityToDTO).collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay(); // Start of the day
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59); // End of the day

        List<Task> tasks = taskRepository.findByDateTimeBetween(startDateTime, endDateTime);
        return tasks.stream().map(this::entityToDTO).collect(Collectors.toList());
    }
    public List<TaskDTO> getTasksByUserId(Long userId) {
        List<Task> tasks = taskRepository.findByUsers_Id(userId);
        return tasks.stream().map(this::entityToDTO).collect(Collectors.toList());
    }

    private TaskDTO entityToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        if (task != null) {
            dto.setId(task.getId());
            dto.setName(task.getName());
            dto.setStatus(task.getStatus());
            dto.setProjectId(task.getProject().getId());
            dto.setDateTime(task.getDateTime());

            Set<Long> userIds = task.getUsers().stream()
                    .map(Users::getId) // Convert each user to its ID
                    .collect(Collectors.toSet());
            dto.setUserId(userIds);
        }
        return dto;
    }
    public void importTasks(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             OdfDocument document = OdfDocument.loadDocument(inputStream)) {

            List<Task> tasks = new ArrayList<>();

            // Get all tables from the document
            List<OdfTable> tables = document.getTableList();
            if (tables.isEmpty()) {
                throw new IllegalArgumentException("No tables found in the document.");
            }

            OdfTable table = tables.get(0); // Get the first table

            // Skip the header row by starting from the second row
            for (int i = 1; i < table.getRowList().size(); i++) {
                OdfTableRow row = table.getRowList().get(i);
                Task task = new Task();

                // Parse task data (assuming specific column indexes)
                task.setName(row.getCellByIndex(0).getStringValue());
                task.setStatus(row.getCellByIndex(1).getStringValue());
                Long projectId = Long.valueOf(row.getCellByIndex(2).getStringValue());
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid project ID: " + projectId));
                task.setProject(project);

                // Parse date and time
                String dateStr = row.getCellByIndex(3).getStringValue();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yy HH:mm");
                LocalDateTime localDateTime = LocalDateTime.parse(dateStr, formatter);
                task.setDateTime(localDateTime);

                // Parse user IDs (assuming comma-separated in a string cell)
                String userIdsStr = row.getCellByIndex(4).getStringValue();
                Set<Long> userIds = Arrays.stream(userIdsStr.split(","))
                        .map(Long::parseLong)
                        .collect(Collectors.toSet());
                List<Users> users = validateTaskUsers(project, userIds);
                task.setUsers(users);

                // Validate the task before adding to the list
                validateTaskData(task);
                tasks.add(task);
            }

            // Save all tasks to the database
            taskRepository.saveAll(tasks);
        } catch (Exception e) {
            throw new RuntimeException("Error processing file: " + e.getMessage());
        }
    }



    private void validateTaskData(Task task) {
        if (task.getName() == null || task.getName().isEmpty()) {
            throw new IllegalArgumentException("Task name cannot be empty.");
        }
        if (task.getProject() == null) {
            throw new IllegalArgumentException("Task must be associated with a valid project.");
        }
    }

}