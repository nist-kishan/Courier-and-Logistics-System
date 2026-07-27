package com.courier_and_logistic_system.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.PackageEntity;
import com.courier_and_logistic_system.enums.PackageType;
import com.courier_and_logistic_system.execption.InvalidStatusException;
import com.courier_and_logistic_system.execption.NoRecordFoundException;
import com.courier_and_logistic_system.repository.PackageEntityRepository;
import com.courier_and_logistic_system.utils.HelperMethod;

@Service
public class PackageEntityService {

	@Autowired
	private PackageEntityRepository packageEntityRepository;

	public ResponseStructure<List<PackageEntity>> getAllPackage() {
		List<PackageEntity> packageEntities = packageEntityRepository.findAll();

		if (packageEntities.isEmpty()) {
			throw new NoRecordFoundException("No package records found.");
		}

		ResponseStructure<List<PackageEntity>> res = new ResponseStructure<List<PackageEntity>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All package records retrieved successfully.");
		res.setData(packageEntities);

		return res;
	}

	public ResponseStructure<PackageEntity> getPackageById(Integer packageId) {
		Optional<PackageEntity> packageEntities = packageEntityRepository.findById(packageId);

		if (packageEntities.isEmpty()) {
			throw new NoRecordFoundException("Package not found with ID: " + packageId);
		}

		ResponseStructure<PackageEntity> res = new ResponseStructure<PackageEntity>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Package details retrieved successfully.");
		res.setData(packageEntities.get());

		return res;
	}

	public ResponseStructure<PackageEntity> getPackageByType(String packageType) {
		if (!HelperMethod.packageTypeValidation(packageType)) {
			throw new InvalidStatusException("Invalid package type: " + packageType);
		}
		Optional<PackageEntity> packageEntities = packageEntityRepository
				.findByPackageType(PackageType.valueOf(packageType.toUpperCase()));

		if (packageEntities.isEmpty()) {
			throw new NoRecordFoundException("Package not found with type: " + packageType);
		}

		ResponseStructure<PackageEntity> res = new ResponseStructure<PackageEntity>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Package details retrieved successfully.");
		res.setData(packageEntities.get());

		return res;
	}
}
