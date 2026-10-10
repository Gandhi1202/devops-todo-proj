package com.org.repository;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RestController;

import com.org.model.Task;

public interface TaskRepository extends JpaRepository<Task,Long>{

	List<Task> findByProjectId(Long projectId);
	List<Task> findByDateTimeBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
//	@Query("SELECT t FROM Task t JOIN FETCH t.users WHERE t.id = :id")
//	Optional<Task> findByIdWithUsers(@Param("id") Long id);
	List<Task> findByUsers_Id(Long userId);

}
