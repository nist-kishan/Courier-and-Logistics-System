package com.courier_and_logistic_system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.courier_and_logistic_system.entity.PackageEntity;
import com.courier_and_logistic_system.enums.PackageType;

public interface PackageEntityRepository extends JpaRepository<PackageEntity, Integer> {

	Optional<PackageEntity> findByPackageType(PackageType packageType);
}
