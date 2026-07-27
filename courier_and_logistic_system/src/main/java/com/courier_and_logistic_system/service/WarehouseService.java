package com.courier_and_logistic_system.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.Shipment;
import com.courier_and_logistic_system.entity.Warehouse;
import com.courier_and_logistic_system.execption.AlreadyUsedException;
import com.courier_and_logistic_system.execption.InsufficientDataException;
import com.courier_and_logistic_system.execption.InvalidContactNumberException;
import com.courier_and_logistic_system.execption.NoAttributeFoundException;
import com.courier_and_logistic_system.execption.NoRecordFoundException;
import com.courier_and_logistic_system.execption.UnAuthorizedOperationException;
import com.courier_and_logistic_system.repository.WarehouseRepository;
import com.courier_and_logistic_system.utils.HelperMethod;

@Service
public class WarehouseService {

	@Autowired
	private WarehouseRepository warehouseRepository;

	public ResponseStructure<Warehouse> createNewWarehouse(Warehouse newWarehouse) {
		if (newWarehouse == null || newWarehouse.getWarehouseContactNumber() == null) {
			throw new InsufficientDataException("Warehouse contact number is required.");
		}
		if (newWarehouse.getWarehouseName() == null || newWarehouse.getWarehouseName().isBlank()) {
			throw new InsufficientDataException("Warehouse name is required.");
		}
		if (newWarehouse.getLocation() == null || newWarehouse.getLocation().isBlank()) {
			throw new InsufficientDataException("Warehouse location is required.");
		}
		if (newWarehouse.getCapacity() == null || newWarehouse.getCapacity() <= 0) {
			throw new InsufficientDataException("Warehouse capacity must be greater than zero.");
		}

		if (warehouseRepository.existsByWarehouseContactNumber(newWarehouse.getWarehouseContactNumber())) {
			throw new AlreadyUsedException(
					"Contact number '" + newWarehouse.getWarehouseContactNumber() + "' is already registered.");
		}

		if (!HelperMethod.phoneNumberValidation(newWarehouse.getWarehouseContactNumber())) {
			throw new InvalidContactNumberException("Contact number must contain exactly 10 digits.");
		}

		if (newWarehouse.getShipment() != null) {
			for (Shipment shipment : newWarehouse.getShipment()) {
				shipment.setWarehouse(newWarehouse);
			}
		}

		Warehouse warehouse = warehouseRepository.save(newWarehouse);
		ResponseStructure<Warehouse> res = new ResponseStructure<Warehouse>();
		res.setStatusCode(HttpStatus.CREATED.value());
		res.setMessage("Warehouse created successfully.");
		res.setData(warehouse);

		return res;
	}

	public ResponseStructure<List<Warehouse>> getAllWareHouseDetails() {
		List<Warehouse> warehouses = warehouseRepository.findAll();

		if (warehouses.isEmpty()) {
			throw new NoRecordFoundException("No warehouse records found.");
		}

		ResponseStructure<List<Warehouse>> res = new ResponseStructure<List<Warehouse>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All warehouse records retrieved successfully.");
		res.setData(warehouses);

		return res;
	}

	public ResponseStructure<Warehouse> getWarehouseById(Integer warehouseId) {
		Optional<Warehouse> warehouse = warehouseRepository.findById(warehouseId);

		if (warehouse.isEmpty()) {
			throw new NoRecordFoundException("Warehouse not found with ID: " + warehouseId);
		}

		ResponseStructure<Warehouse> res = new ResponseStructure<Warehouse>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Warehouse details retrieved successfully.");
		res.setData(warehouse.get());

		return res;
	}

	public ResponseStructure<List<Warehouse>> getWarehouseByLocation(String location) {
		List<Warehouse> warehouse = warehouseRepository.findByLocation(location);

		if (warehouse.isEmpty()) {
			throw new NoRecordFoundException("No warehouse records found for location: " + location);
		}

		ResponseStructure<List<Warehouse>> res = new ResponseStructure<List<Warehouse>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Warehouse records retrieved successfully.");
		res.setData(warehouse);

		return res;
	}

	public ResponseStructure<List<Warehouse>> getWarehouseByCapacity(Double capacity) {
		List<Warehouse> warehouse = warehouseRepository.findBycapacityGreaterThan(capacity);

		if (warehouse.isEmpty()) {
			throw new NoRecordFoundException("No warehouse records found with capacity greater than " + capacity);
		}

		ResponseStructure<List<Warehouse>> res = new ResponseStructure<List<Warehouse>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Warehouse records retrieved successfully.");
		res.setData(warehouse);

		return res;
	}

	public ResponseStructure<Warehouse> updateWarehouseById(Integer warehouseId,
			Map<String, String> updatedWarehouseMap) {

		if (updatedWarehouseMap == null || updatedWarehouseMap.isEmpty()) {
			throw new InsufficientDataException("No update data provided.");
		}

		Optional<Warehouse> warehouseOptional = warehouseRepository.findById(warehouseId);

		if (warehouseOptional.isEmpty()) {
			throw new NoRecordFoundException("Warehouse not found with ID: " + warehouseId);
		}

		Warehouse warehouse = warehouseOptional.get();

		if (updatedWarehouseMap.containsKey("warehouseContactNumber")) {

			String newContact = updatedWarehouseMap.get("warehouseContactNumber");

			if (!HelperMethod.phoneNumberValidation(newContact)) {
				throw new InvalidContactNumberException("Contact number must contain exactly 10 digits.");
			}

			if (!warehouse.getWarehouseContactNumber().equals(newContact)
					&& warehouseRepository.existsByWarehouseContactNumber(newContact)) {

				throw new AlreadyUsedException("Contact number '" + newContact + "' is already registered.");
			}
		}

		for (Map.Entry<String, String> entry : updatedWarehouseMap.entrySet()) {

			switch (entry.getKey()) {

			case "warehouseName":
				warehouse.setWarehouseName(entry.getValue());
				break;

			case "location":
				warehouse.setLocation(entry.getValue());
				break;

			case "capacity":
				warehouse.setCapacity(Double.parseDouble(entry.getValue()));
				break;

			case "warehouseContactNumber":
				warehouse.setWarehouseContactNumber(entry.getValue());
				break;

			default:
				throw new NoAttributeFoundException("Invalid field name: " + entry.getKey());
			}
		}

		warehouse = warehouseRepository.save(warehouse);

		ResponseStructure<Warehouse> res = new ResponseStructure<>();

		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Warehouse details updated successfully.");
		res.setData(warehouse);

		return res;
	}

	public ResponseStructure<String> deleteWarehouseById(Integer warehouseId) {
		Optional<Warehouse> warehouseOptional = warehouseRepository.findById(warehouseId);

		if (warehouseOptional.isEmpty()) {
			throw new NoRecordFoundException("Warehouse not found with ID: " + warehouseId);
		}

		Warehouse warehouse = warehouseOptional.get();

		if (warehouse.getShipment() != null && !warehouse.getShipment().isEmpty()) {
			throw new UnAuthorizedOperationException("Delete all associated shipments before deleting this warehouse.");
		}
		warehouseRepository.deleteById(warehouseId);

		ResponseStructure<String> res = new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Warehouse deleted successfully. ID: " + warehouseId);
		res.setData("Deleted");

		return res;
	}
}