package com.courier_and_logistic_system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.Warehouse;
import com.courier_and_logistic_system.service.WarehouseService;

@RestController
@RequestMapping("/warehouse")
public class WarehouseController {
	
	@Autowired
	private WarehouseService warehouseService;
	
	@PostMapping
	public ResponseEntity<ResponseStructure<Warehouse>> createWarehouse(@RequestBody Warehouse newWarehouse){
		return new ResponseEntity<ResponseStructure<Warehouse>>(warehouseService.createNewWarehouse(newWarehouse),HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<ResponseStructure<List<Warehouse>>> getAllWarehouse(){
		return new ResponseEntity<ResponseStructure<List<Warehouse>>>(warehouseService.getAllWareHouseDetails(),HttpStatus.OK);
	}
	
	@GetMapping("warehouse/{warehouseId}")
	public ResponseEntity<ResponseStructure<Warehouse>> getWarehouseById(@PathVariable Integer warehouseId){
		return new ResponseEntity<ResponseStructure<Warehouse>>(warehouseService.getWarehouseById(warehouseId),HttpStatus.OK);
	}
	
	@GetMapping("location/{location}")
	public ResponseEntity<ResponseStructure<List<Warehouse>>> getWarehouseByLocation(@PathVariable String location){
		return new ResponseEntity<ResponseStructure<List<Warehouse>>>(warehouseService.getWarehouseByLocation(location),HttpStatus.OK);
	}
	
	@GetMapping("capacity/{capacity}")
	public ResponseEntity<ResponseStructure<List<Warehouse>>> getWarehouseByCapcityGreaterThan(@PathVariable Double capacity){
		return new ResponseEntity<ResponseStructure<List<Warehouse>>>(warehouseService.getWarehouseByCapacity(capacity),HttpStatus.OK);
	}
	
	@PatchMapping("edit/{warehouseId}")
	public ResponseEntity<ResponseStructure<Warehouse>> updateWarehouseById(@PathVariable Integer warehouseId,@RequestBody Map<String, String> updatedWarehouse) {
	    return new ResponseEntity<>(warehouseService.updateWarehouseById(warehouseId, updatedWarehouse),HttpStatus.OK);
	}
	
	@DeleteMapping("delete/{warehouseId}")
	public ResponseEntity<ResponseStructure<String>> deleteWarehouseById(@PathVariable Integer warehouseId){
		return new ResponseEntity<ResponseStructure<String>>(warehouseService.deleteWarehouseById(warehouseId),HttpStatus.OK);
	}
}
