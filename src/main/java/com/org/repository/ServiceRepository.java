package com.org.repository;

import com.org.model.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.User;

import java.util.Arrays;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Services,Long> {
    @Query("SELECT s FROM Services s JOIN RoleServiceMapping rsm ON s.id = rsm.services.id WHERE rsm.role.id = :roleId")
    List<Services> findServicesByRoleId(@Param("roleId") Long roleId);

}
