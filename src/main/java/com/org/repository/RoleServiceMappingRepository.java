package com.org.repository;

import com.org.model.RoleServiceMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository

public interface RoleServiceMappingRepository extends JpaRepository<RoleServiceMapping, Long> {
//    List<RoleServiceMapping> findByRoleId(Long roleId);

	 Optional<RoleServiceMapping> findByRoleIdAndServices_Id(Long roleId, Long serviceId);

}