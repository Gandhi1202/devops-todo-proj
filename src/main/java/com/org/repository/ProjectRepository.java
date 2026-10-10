package com.org.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RestController;

import com.org.model.Project;

public interface ProjectRepository extends JpaRepository<Project,Long> {
	List<Project> findByDateTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

	List<Project> findByUsers_Id(Long userId);

}
