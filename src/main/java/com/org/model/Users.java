package com.org.model;

import java.util.Set;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Users {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull(message="Name is not null")
	private String name;
	@Email(message = "please enter a valid mail id")
	@NotNull(message="email is mandatory")
	private String email;
	@NotNull(message="password is mandatory")
	private String password;
	@NotNull(message="Number is mandatory")
	private Long contact;
	@ManyToOne
	@JoinColumn(name="roleId")
	private Role role;
	@ManyToMany(mappedBy = "users")
	private Set<Project> projects;
	@ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
	private Set<Task> tasks;
}
