package com.org.model;


import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Task {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	@NotNull(message="enter a name")
	private String name;
	private String status;
	private LocalDateTime dateTime;
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="project_id",nullable=false)
	private Project project;
	@ManyToMany(fetch=FetchType.EAGER)
	@JoinTable(name="tasks_users", joinColumns=@JoinColumn(name="task_id"),inverseJoinColumns=@JoinColumn(name="user_id"))
	private  List<Users> users;


}
