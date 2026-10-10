package com.org.service;

import com.org.JwtUtilSecurity.JwtTokenUtil;
import com.org.dto.*;
import com.org.mapper.UserMapper;
import com.org.model.Users;
import com.org.repository.ProjectRepository;
import com.org.repository.RoleRepository;
import com.org.repository.TaskRepository;
import com.org.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final TaskRepository taskRepository;

    @Autowired
    private final ProjectRepository projectRepository;

    @Autowired
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserRepository userRepository, TaskRepository taskRepository,
                       ProjectRepository projectRepository, BCryptPasswordEncoder passwordEncoder,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    // Method to register a user
    public void registerUser(RegisterUserDTO registerUserDTO, BindingResult bindingResult) {
        // Check if email already exists
        if (userRepository.existsByEmail(registerUserDTO.getEmail())) {
            bindingResult.rejectValue("email", "email.exists", "This email is already registered.");
            return;
        }

        // Perform password strength validation
        if (!isValidPassword(registerUserDTO.getPassword())) {
            bindingResult.rejectValue("password", "password.invalid", "Password does not meet the required criteria.");
            return;
        }

        // If any validation errors exist, do not proceed with registration
        if (bindingResult.hasErrors()) {
            throw new IllegalArgumentException("Invalid data");
        }

        // If no errors, map DTO to entity and save
        Users user = userMapper.toEntity(registerUserDTO);
        user.setPassword(passwordEncoder.encode(registerUserDTO.getPassword()));  // Encrypt password
        userRepository.save(user);
    }

    // Helper method to check if password is valid
    private boolean isValidPassword(String password) {
        // Example: Password must be at least 8 characters, contain a number, and a special character
        String passwordRegex = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$";
        return password.matches(passwordRegex);
    }

    public Optional<LoginResponseDTO> loginUser(LoginUserDTO loginUserDTO) {
        return userRepository.findByEmail(loginUserDTO.getEmail())
                .filter(user -> passwordEncoder.matches(loginUserDTO.getPassword(), user.getPassword()))
                .map(user -> {
                    UserDTO userDTO = userMapper.toDTO(user);

                    List<ProjectDTO> projects;
                    List<TaskDTO> tasks;

                    // Determine projects and tasks based on user role
                    if (user.getRole() != null && "ADMIN".equals(user.getRole().getRoleName())) {
                        projects = projectRepository.findAll().stream()
                                .map(userMapper::toProjectDTO)
                                .collect(Collectors.toList());

                        tasks = taskRepository.findAll().stream()
                                .map(userMapper::toTaskDTO)
                                .collect(Collectors.toList());
                    } else {
                        projects = projectRepository.findByUsers_Id(user.getId()).stream()
                                .map(userMapper::toProjectDTO)
                                .collect(Collectors.toList());

                        tasks = taskRepository.findByUsers_Id(user.getId()).stream()
                                .map(userMapper::toTaskDTO)
                                .collect(Collectors.toList());
                    }

                    return new LoginResponseDTO(userDTO, projects, tasks);
                });
    }


    public LoginResponseDTO getUserDetailsFromToken(String token) {
        String email = jwtTokenUtil.extractEmail(token);
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = userMapper.toDTO(user);
        List<ProjectDTO> projects = getUserProjects(user);
        List<TaskDTO> tasks = getUserTasks(user);

        return new LoginResponseDTO(userDTO, projects, tasks);
    }
 // get the all users
    public List<UserDTO> getAllUsers() {
        List<Users> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
//get user by id
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
//update the user
    public void updateUser(Long id, RegisterUserDTO registerUserDTO) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user properties
        user.setName(registerUserDTO.getName());
        user.setEmail(registerUserDTO.getEmail());
        user.setContact(registerUserDTO.getContact());
        if (registerUserDTO.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(registerUserDTO.getPassword()));
        }

        // Find and set the Role object
        if (registerUserDTO.getRoleId() != null) {
            roleRepository.findById(registerUserDTO.getRoleId())
                    .ifPresent(user::setRole);
        }

        userRepository.save(user);
    }
//delete the user
    public void deleteUser(Long id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    private List<ProjectDTO> getUserProjects(Users user) {
        if (user.getRole() != null && "ADMIN".equals(user.getRole().getRoleName())) {
            return projectRepository.findAll().stream()
                    .map(userMapper::toProjectDTO)
                    .collect(Collectors.toList());
        } else {
            return projectRepository.findByUsers_Id(user.getId()).stream()
                    .map(userMapper::toProjectDTO)
                    .collect(Collectors.toList());
        }
    }

    private List<TaskDTO> getUserTasks(Users user) {
        if (user.getRole() != null && "ADMIN".equals(user.getRole().getRoleName())) {
            return taskRepository.findAll().stream()
                    .map(userMapper::toTaskDTO)
                    .collect(Collectors.toList());
        } else {
            return taskRepository.findByUsers_Id(user.getId()).stream()
                    .map(userMapper::toTaskDTO)
                    .collect(Collectors.toList());
        }
    }
}
