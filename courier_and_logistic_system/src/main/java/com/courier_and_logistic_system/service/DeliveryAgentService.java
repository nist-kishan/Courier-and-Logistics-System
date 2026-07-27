package com.courier_and_logistic_system.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.DeliveryAgent;
import com.courier_and_logistic_system.entity.Shipment;
import com.courier_and_logistic_system.execption.AlreadyUsedException;
import com.courier_and_logistic_system.execption.InsufficientDataException;
import com.courier_and_logistic_system.execption.InvalidContactNumberException;
import com.courier_and_logistic_system.execption.NoAttributeFoundException;
import com.courier_and_logistic_system.execption.NoRecordFoundException;
import com.courier_and_logistic_system.execption.UnAuthorizedOperationException;
import com.courier_and_logistic_system.repository.DeliveryAgentRepository;
import com.courier_and_logistic_system.utils.HelperMethod;

@Service
public class DeliveryAgentService {

	@Autowired
	private DeliveryAgentRepository deliveryAgentRepository;

	public ResponseStructure<DeliveryAgent> createNewDeliveryAgent(DeliveryAgent newDeliveryAgent) {
		if (newDeliveryAgent == null || newDeliveryAgent.getVehicleNumber() == null
				|| newDeliveryAgent.getDeliveryAgentContactNumber() == null) {
			throw new InsufficientDataException("Vehicle number and contact number are required.");
		}
		if (newDeliveryAgent.getDeliveryAgentName() == null || newDeliveryAgent.getDeliveryAgentName().isBlank()) {
			throw new InsufficientDataException("Delivery agent name is required.");
		}

		if (deliveryAgentRepository.existsByVehicleNumber(newDeliveryAgent.getVehicleNumber())) {
			throw new AlreadyUsedException(
					"Vehicle number '" + newDeliveryAgent.getVehicleNumber() + "' is already registered.");
		}

		if (deliveryAgentRepository
				.existsByDeliveryAgentContactNumber(newDeliveryAgent.getDeliveryAgentContactNumber())) {
			throw new AlreadyUsedException(
					"Contact number '" + newDeliveryAgent.getDeliveryAgentContactNumber() + "' is already registered.");
		}

		if (!HelperMethod.phoneNumberValidation(newDeliveryAgent.getDeliveryAgentContactNumber())) {
			throw new InvalidContactNumberException("Contact number must contain exactly 10 digits.");
		}
		if (newDeliveryAgent.getShipment() != null) {
			for (Shipment shipment : newDeliveryAgent.getShipment()) {
				shipment.setDeliveryAgent(newDeliveryAgent);
			}
		}

		DeliveryAgent deliveryAgent = deliveryAgentRepository.save(newDeliveryAgent);

		ResponseStructure<DeliveryAgent> res = new ResponseStructure<DeliveryAgent>();
		res.setStatusCode(HttpStatus.CREATED.value());
		res.setMessage("Delivery agent created successfully.");
		res.setData(deliveryAgent);

		return res;
	}

	public ResponseStructure<List<DeliveryAgent>> getAllDeliveryAgent() {
		List<DeliveryAgent> deliveryAgents = deliveryAgentRepository.findAll();

		if (deliveryAgents.isEmpty()) {
			throw new NoRecordFoundException("No delivery agent records found.");
		}

		ResponseStructure<List<DeliveryAgent>> res = new ResponseStructure<List<DeliveryAgent>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All delivery agent records retrieved successfully.");
		res.setData(deliveryAgents);

		return res;
	}

	public ResponseStructure<DeliveryAgent> getDeliveryAgentById(Integer deliveryAgentId) {
		Optional<DeliveryAgent> deliveryAgentsOptional = deliveryAgentRepository.findById(deliveryAgentId);

		if (deliveryAgentsOptional.isEmpty()) {
			throw new NoRecordFoundException("Delivery agent not found with ID: " + deliveryAgentId);
		}

		DeliveryAgent deliveryAgent = deliveryAgentsOptional.get();

		ResponseStructure<DeliveryAgent> res = new ResponseStructure<DeliveryAgent>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agent details retrieved successfully.");
		res.setData(deliveryAgent);

		return res;
	}

	public ResponseStructure<DeliveryAgent> getDeliveryAgentByVehicleNumber(String vehicleNumber) {
		Optional<DeliveryAgent> deliveryAgentsOptional = deliveryAgentRepository.findByVehicleNumber(vehicleNumber);

		if (deliveryAgentsOptional.isEmpty()) {
			throw new NoRecordFoundException("Delivery agent not found with vehicle number: " + vehicleNumber);
		}

		DeliveryAgent deliveryAgent = deliveryAgentsOptional.get();

		ResponseStructure<DeliveryAgent> res = new ResponseStructure<DeliveryAgent>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agent details retrieved successfully.");
		res.setData(deliveryAgent);

		return res;
	}

	public ResponseStructure<DeliveryAgent> getDeliveryAgentByContactNumber(String contactNumber) {
		Optional<DeliveryAgent> deliveryAgentsOptional = deliveryAgentRepository
				.findByDeliveryAgentContactNumber(contactNumber);

		if (deliveryAgentsOptional.isEmpty()) {
			throw new NoRecordFoundException("Delivery agent not found with contact number: " + contactNumber);
		}

		DeliveryAgent deliveryAgent = deliveryAgentsOptional.get();

		ResponseStructure<DeliveryAgent> res = new ResponseStructure<DeliveryAgent>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agent details retrieved successfully.");
		res.setData(deliveryAgent);

		return res;
	}

	public ResponseStructure<List<DeliveryAgent>> getAllDeliveryAgentWithRating(Integer rating) {
		List<DeliveryAgent> deliveryAgents = deliveryAgentRepository.findByRatingGreaterThan(rating);

		if (deliveryAgents.isEmpty()) {
			throw new NoRecordFoundException("No delivery agents found with rating greater than " + rating);
		}

		ResponseStructure<List<DeliveryAgent>> res = new ResponseStructure<List<DeliveryAgent>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agents retrieved successfully.");
		res.setData(deliveryAgents);

		return res;
	}

	public ResponseStructure<DeliveryAgent> updateDeliveryAgentById(Integer deliveryAgentId,
			Map<String, String> updatedDeliveryAgentInfo) {

		if (updatedDeliveryAgentInfo == null || updatedDeliveryAgentInfo.isEmpty()) {
			throw new InsufficientDataException("No update data provided.");
		}

		Optional<DeliveryAgent> deliveryAgentsOptional = deliveryAgentRepository.findById(deliveryAgentId);

		if (deliveryAgentsOptional.isEmpty()) {
			throw new NoRecordFoundException("Delivery agent not found with ID: " + deliveryAgentId);
		}

		DeliveryAgent deliveryAgent = deliveryAgentsOptional.get();

		for (Map.Entry<String, String> entry : updatedDeliveryAgentInfo.entrySet()) {

			switch (entry.getKey()) {

			case "deliveryAgentName":
				deliveryAgent.setDeliveryAgentName(entry.getValue());
				break;

			case "deliveryAgentContactNumber":

				String newNumber = entry.getValue();

				if (!HelperMethod.phoneNumberValidation(newNumber)) {
					throw new InvalidContactNumberException("Contact number must contain exactly 10 digits.");
				}

				if (!deliveryAgent.getDeliveryAgentContactNumber().equals(newNumber)
						&& deliveryAgentRepository.existsByDeliveryAgentContactNumber(newNumber)) {

					throw new AlreadyUsedException("Contact number '" + newNumber + "' is already registered.");
				}

				deliveryAgent.setDeliveryAgentContactNumber(newNumber);
				break;

			case "vehicleNumber":

				String newVehicle = entry.getValue();

				if (!deliveryAgent.getVehicleNumber().equals(newVehicle)
						&& deliveryAgentRepository.existsByVehicleNumber(newVehicle)) {

					throw new AlreadyUsedException("Vehicle number '" + newVehicle + "' is already registered.");
				}

				deliveryAgent.setVehicleNumber(newVehicle);
				break;

			case "availability":
				deliveryAgent.setAvailability(Boolean.parseBoolean(entry.getValue()));
				break;

			case "rating":
				deliveryAgent.setRating(Integer.parseInt(entry.getValue()));
				break;

			default:
				throw new NoAttributeFoundException("Invalid field name: " + entry.getKey());
			}
		}

		deliveryAgent = deliveryAgentRepository.save(deliveryAgent);

		ResponseStructure<DeliveryAgent> res = new ResponseStructure<>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agent details updated successfully.");
		res.setData(deliveryAgent);

		return res;
	}

	public ResponseStructure<DeliveryAgent> updateAvailability(Integer deliveryAgentId,
			Map<String, String> updatedDeliveryAgentInfo) {

		if (updatedDeliveryAgentInfo == null || updatedDeliveryAgentInfo.isEmpty()) {
			throw new InsufficientDataException("No update data provided.");
		}

		Optional<DeliveryAgent> deliveryAgentsOptional = deliveryAgentRepository.findById(deliveryAgentId);

		if (deliveryAgentsOptional.isEmpty()) {
			throw new NoRecordFoundException("Delivery agent not found with ID: " + deliveryAgentId);
		}

		DeliveryAgent deliveryAgent = deliveryAgentsOptional.get();

		for (Map.Entry<String, String> entry : updatedDeliveryAgentInfo.entrySet()) {

			switch (entry.getKey()) {

			case "availability":
				deliveryAgent.setAvailability(Boolean.parseBoolean(entry.getValue()));
				break;

			default:
				throw new NoAttributeFoundException("Invalid field name: " + entry.getKey());
			}
		}

		deliveryAgent = deliveryAgentRepository.save(deliveryAgent);

		ResponseStructure<DeliveryAgent> res = new ResponseStructure<>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agent availability updated successfully.");
		res.setData(deliveryAgent);

		return res;
	}

	public ResponseStructure<String> deleteDeliveryAgentById(Integer deliveryAgentId) {
		Optional<DeliveryAgent> deliveryAgentsOptional = deliveryAgentRepository.findById(deliveryAgentId);

		if (deliveryAgentsOptional.isEmpty()) {
			throw new NoRecordFoundException("Delivery agent not found with ID: " + deliveryAgentId);
		}

		DeliveryAgent deliveryAgent = deliveryAgentsOptional.get();

		if (deliveryAgent.getShipment() != null && !deliveryAgent.getShipment().isEmpty()) {
			throw new UnAuthorizedOperationException(
					"Delete all associated shipments before deleting this delivery agent.");
		}

		deliveryAgentRepository.deleteById(deliveryAgentId);

		ResponseStructure<String> res = new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agent deleted successfully. ID: " + deliveryAgentId);
		res.setData("Delete");

		return res;
	}
}