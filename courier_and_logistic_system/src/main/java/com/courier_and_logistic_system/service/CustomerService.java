package com.courier_and_logistic_system.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.Customer;
import com.courier_and_logistic_system.entity.Shipment;
import com.courier_and_logistic_system.execption.AlreadyUsedException;
import com.courier_and_logistic_system.execption.InsufficientDataException;
import com.courier_and_logistic_system.execption.InvalidContactNumberException;
import com.courier_and_logistic_system.execption.NoAttributeFoundException;
import com.courier_and_logistic_system.execption.NoRecordFoundException;
import com.courier_and_logistic_system.execption.UnAuthorizedOperationException;
import com.courier_and_logistic_system.repository.CustomerRepository;
import com.courier_and_logistic_system.utils.HelperMethod;

@Service
public class CustomerService {

	@Autowired
	private CustomerRepository customerRepository;

	public ResponseStructure<Customer> createCustomer(Customer newCustomer) {
		if (newCustomer == null || newCustomer.getCustomerEmail() == null || newCustomer.getCustomerPhone() == null) {
			throw new InsufficientDataException("Customer email and phone number are required.");
		}
		if (newCustomer.getCustomerName() == null || newCustomer.getCustomerName().isBlank()) {
			throw new InsufficientDataException("Customer name is required.");
		}
		if (newCustomer.getCustomerAddress() == null || newCustomer.getCustomerAddress().isBlank()) {
			throw new InsufficientDataException("Customer address is required.");
		}
		if (customerRepository.existsByCustomerEmail(newCustomer.getCustomerEmail())) {
			throw new AlreadyUsedException("Email '" + newCustomer.getCustomerEmail() + "' is already registered.");
		}

		if (customerRepository.existsByCustomerPhone(newCustomer.getCustomerPhone())) {
			throw new AlreadyUsedException(
					"Phone number '" + newCustomer.getCustomerPhone() + "' is already registered.");
		}

		if (!HelperMethod.phoneNumberValidation(newCustomer.getCustomerPhone())) {
			throw new InvalidContactNumberException("Phone number must contain exactly 10 digits.");
		}

		Customer customer = customerRepository.save(newCustomer);

		ResponseStructure<Customer> res = new ResponseStructure<Customer>();
		res.setStatusCode(HttpStatus.CREATED.value());
		res.setMessage("Customer created successfully.");
		res.setData(customer);

		return res;
	}

	public ResponseStructure<List<Customer>> getAllCustomerInformation() {
		List<Customer> customers = customerRepository.findAll();
		if (customers.isEmpty()) {
			throw new NoRecordFoundException("No customer records found.");
		}

		ResponseStructure<List<Customer>> res = new ResponseStructure<List<Customer>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All customer records retrieved successfully.");
		res.setData(customers);

		return res;
	}

	public ResponseStructure<Customer> getCustomerInfoById(Integer customerId) {
		Optional<Customer> customer = customerRepository.findById(customerId);

		if (customer.isEmpty()) {
			throw new NoRecordFoundException("Customer not found with ID: " + customerId);
		}

		ResponseStructure<Customer> res = new ResponseStructure<Customer>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Customer details retrieved successfully.");
		res.setData(customer.get());

		return res;
	}

	public ResponseStructure<Customer> getCustomerInfoByEmail(String customerEmail) {
		Optional<Customer> customer = customerRepository.findByCustomerEmail(customerEmail);

		if (customer.isEmpty()) {
			throw new NoRecordFoundException("Customer not found with email: " + customerEmail);
		}

		ResponseStructure<Customer> res = new ResponseStructure<Customer>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Customer details retrieved successfully.");
		res.setData(customer.get());

		return res;
	}

	public ResponseStructure<Customer> getCustomerInfoByContactNumber(String contactNumber) {
		Optional<Customer> customer = customerRepository.findByCustomerPhone(contactNumber);

		if (customer.isEmpty()) {
			throw new NoRecordFoundException("Customer not found with phone number: " + contactNumber);
		}

		ResponseStructure<Customer> res = new ResponseStructure<Customer>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Customer details retrieved successfully.");
		res.setData(customer.get());

		return res;
	}

	public ResponseStructure<Page<Customer>> getAllCustomerInformationUsingPaginationAndSorting(Integer currentPage,
			Integer pageSize, String fieldName, String direction) {

		Page<Customer> customers = customerRepository.findAll(PageRequest.of(currentPage, pageSize,
				direction.equalsIgnoreCase("desc") ? Sort.by(fieldName).descending() : Sort.by(fieldName).ascending()));

		if (customers.isEmpty()) {
			throw new NoRecordFoundException("No customer records found.");
		}

		ResponseStructure<Page<Customer>> res = new ResponseStructure<Page<Customer>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Customer records retrieved successfully.");
		res.setData(customers);

		return res;
	}

	public ResponseStructure<Customer> updateCustomerDetails(Integer customerId, Map<String, String> updatedInfo) {

		if (updatedInfo == null || updatedInfo.isEmpty()) {
			throw new InsufficientDataException("No update data provided.");
		}

		Optional<Customer> customerOptional = customerRepository.findById(customerId);

		if (customerOptional.isEmpty()) {
			throw new NoRecordFoundException("Customer not found with ID: " + customerId);
		}

		Customer customer = customerOptional.get();

		if (updatedInfo.containsKey("customerEmail")) {
			String newEmail = updatedInfo.get("customerEmail");

			if (!customer.getCustomerEmail().equals(newEmail) && customerRepository.existsByCustomerEmail(newEmail)) {
				throw new AlreadyUsedException("Email '" + newEmail + "' is already registered.");
			}
		}

		if (updatedInfo.containsKey("customerPhone")) {
			String newPhone = updatedInfo.get("customerPhone");

			if (!HelperMethod.phoneNumberValidation(newPhone)) {
				throw new InvalidContactNumberException("Phone number must contain exactly 10 digits.");
			}

			if (!customer.getCustomerPhone().equals(newPhone) && customerRepository.existsByCustomerPhone(newPhone)) {
				throw new AlreadyUsedException("Phone number '" + newPhone + "' is already registered.");
			}
		}

		for (Map.Entry<String, String> entry : updatedInfo.entrySet()) {

			switch (entry.getKey()) {

			case "customerName":
				customer.setCustomerName(entry.getValue());
				break;

			case "customerEmail":
				customer.setCustomerEmail(entry.getValue());
				break;

			case "customerPhone":
				customer.setCustomerPhone(entry.getValue());
				break;

			case "customerAddress":
				customer.setCustomerAddress(entry.getValue());
				break;

			default:
				throw new NoAttributeFoundException("Invalid field name: " + entry.getKey());
			}
		}

		customer = customerRepository.save(customer);

		ResponseStructure<Customer> res = new ResponseStructure<>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Customer details updated successfully.");
		res.setData(customer);

		return res;
	}

	public ResponseStructure<String> deleteCustomerById(Integer customerId) {

		Optional<Customer> customerOptional = customerRepository.findById(customerId);

		if (customerOptional.isEmpty()) {
			throw new NoRecordFoundException("Customer not found with ID: " + customerId);
		}

		Customer customer = customerOptional.get();

		if (customer.getShipment() != null && !customer.getShipment().isEmpty()) {
			throw new UnAuthorizedOperationException("Delete all associated shipments before deleting this customer.");
		}

		customerRepository.deleteById(customerId);

		ResponseStructure<String> res = new ResponseStructure<>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Customer deleted successfully. ID: " + customerId);
		res.setData("Deleted");

		return res;
	}

}