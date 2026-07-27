package com.courier_and_logistic_system.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.PackageEntity;
import com.courier_and_logistic_system.service.PackageEntityService;

@RestController
@RequestMapping("/packages")
public class PackageEntityController {

	@Autowired
	private PackageEntityService packageEntityService;

	@GetMapping
	public ResponseEntity<ResponseStructure<List<PackageEntity>>> getAllPackage() {
		return new ResponseEntity<>(packageEntityService.getAllPackage(), HttpStatus.OK);
	}

	@GetMapping("/{packageId}")
	public ResponseEntity<ResponseStructure<PackageEntity>> getPackageById(@PathVariable Integer packageId) {
		return new ResponseEntity<>(packageEntityService.getPackageById(packageId), HttpStatus.OK);
	}

	@GetMapping("/type/{packageType}")
	public ResponseEntity<ResponseStructure<PackageEntity>> getPackageByType(@PathVariable String packageType) {
		return new ResponseEntity<>(packageEntityService.getPackageByType(packageType), HttpStatus.OK);
	}
}