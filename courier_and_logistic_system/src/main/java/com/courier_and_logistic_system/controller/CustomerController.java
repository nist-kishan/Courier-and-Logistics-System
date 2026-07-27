package com.courier_and_logistic_system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
import com.courier_and_logistic_system.entity.Customer;
import com.courier_and_logistic_system.service.CustomerService;

@RestController
@RequestMapping("/customer")
public class CustomerController {
	
	@Autowired
	private CustomerService customerService;
	
	@PostMapping
	public ResponseEntity<ResponseStructure<Customer>> createNewCustomer(@RequestBody Customer newCustomer){
		return new ResponseEntity<ResponseStructure<Customer>>(customerService.createCustomer(newCustomer),HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<ResponseStructure<List<Customer>>> getAllCustomer(){
		return new ResponseEntity<ResponseStructure<List<Customer>>>(customerService.getAllCustomerInformation(),HttpStatus.OK);
	}
	
	@GetMapping("/{customerId}")
	public ResponseEntity<ResponseStructure<Customer>> getCustomerById(@PathVariable Integer customerId){
		return new ResponseEntity<ResponseStructure<Customer>>(customerService.getCustomerInfoById(customerId),HttpStatus.OK);
	}
	
	@GetMapping("/email/{customerEmail}")
	public ResponseEntity<ResponseStructure<Customer>> getCustomerByEmail(@PathVariable String customerEmail){
		return new ResponseEntity<ResponseStructure<Customer>>(customerService.getCustomerInfoByEmail(customerEmail),HttpStatus.OK);
	}
	
	@GetMapping("/pagination/{currentPage}/{pageSize}/sortby/{fieldName}/{direction}")
	public ResponseEntity<ResponseStructure<Page<Customer>>> getAllCustomerUsingPaginationAndSorting(@PathVariable Integer currentPage,@PathVariable Integer pageSize,@PathVariable String fieldName,@PathVariable String direction){
		return new ResponseEntity<ResponseStructure<Page<Customer>>>(customerService.getAllCustomerInformationUsingPaginationAndSorting(currentPage,pageSize,fieldName,direction),HttpStatus.OK);
	}
	
	@GetMapping("/ccontact/{customerPhoneNumber}")
	public ResponseEntity<ResponseStructure<Customer>> getCustomerByContact(@PathVariable String customerPhoneNumber){
		return new ResponseEntity<ResponseStructure<Customer>>(customerService.getCustomerInfoByContactNumber(customerPhoneNumber),HttpStatus.OK);
	}
	
	@PatchMapping("/{customerId}")
	public ResponseEntity<ResponseStructure<Customer>> updateCustomerById(@PathVariable Integer customerId,@RequestBody Map<String,String> updatedInfo){
		return new ResponseEntity<ResponseStructure<Customer>>(customerService.updateCustomerDetails(customerId,updatedInfo),HttpStatus.OK);
	}
	
	@DeleteMapping("/{customerId}")
	public ResponseEntity<ResponseStructure<String>> deleteCustomerById(@PathVariable Integer customerId){
		return new ResponseEntity<ResponseStructure<String>>(customerService.deleteCustomerById(customerId),HttpStatus.OK);
	}
}
