package com.courier_and_logistic_system.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.courier_and_logistic_system.dto.Dimension;
import com.courier_and_logistic_system.dto.ResponseStructure;
import com.courier_and_logistic_system.entity.DeliveryAgent;
import com.courier_and_logistic_system.entity.Payment;
import com.courier_and_logistic_system.entity.Shipment;
import com.courier_and_logistic_system.entity.TrackingHistory;
import com.courier_and_logistic_system.entity.Warehouse;
import com.courier_and_logistic_system.enums.DeliveryStatus;
import com.courier_and_logistic_system.enums.PaymentStatus;
import com.courier_and_logistic_system.execption.InsufficientDataException;
import com.courier_and_logistic_system.execption.InvalidStatusException;
import com.courier_and_logistic_system.execption.NoRecordFoundException;
import com.courier_and_logistic_system.execption.UnAuthorizedOperationException;
import com.courier_and_logistic_system.repository.DeliveryAgentRepository;
import com.courier_and_logistic_system.repository.ShipmentRepository;
import com.courier_and_logistic_system.repository.WarehouseRepository;
import com.courier_and_logistic_system.utils.HelperMethod;

@Service
public class ShipmentService {
	
	@Autowired
	private ShipmentRepository shipmentRepository;
	
	@Autowired
	private DeliveryAgentRepository deliveryAgentRepository;
	
	@Autowired
	private WarehouseRepository warehouseRepository;
	
	public ResponseStructure<Shipment> createNewShipment(Shipment newShipment){
		if (newShipment == null) {
	        throw new InsufficientDataException("Shipment details are required.");
	    }

	    if (newShipment.getSource() == null || newShipment.getSource().isBlank()) {
	        throw new InsufficientDataException("Source location is required.");
	    }

	    if (newShipment.getDestination() == null || newShipment.getDestination().isBlank()) {
	        throw new InsufficientDataException("Destination location is required.");
	    }

	    if (newShipment.getCustomer() == null) {
	        throw new InsufficientDataException("Customer information is required to create a shipment.");
	    }

	    if (newShipment.getPayment() == null) {
	        throw new InsufficientDataException("Payment information is required to create a shipment.");
	    }

	    if (newShipment.getWarehouse() == null) {
	        throw new InsufficientDataException("Warehouse information is required to create a shipment.");
	    }

	    if (newShipment.getTrackingHistory() == null) {
	        throw new InsufficientDataException("Tracking history information is required to create a shipment.");
	    }

	    if (newShipment.getWeight() == null || newShipment.getWeight() <= 0) {
	        throw new InsufficientDataException("Shipment weight must be greater than zero.");
	    }

	    if (newShipment.getSource().equalsIgnoreCase(newShipment.getDestination())) {
	        throw new InsufficientDataException("Source and destination cannot be the same.");
	    }
	    
	    if(newShipment.getPackageEntity()==null || newShipment.getPackageEntity().getDimension()==null || newShipment.getPackageEntity().getFragile()==null) {
	    	 throw new InsufficientDataException("Package Entity is required.");
	    }
	    
	    Dimension dimension=newShipment.getPackageEntity().getDimension();
	    if(dimension.getLength()==null || dimension.getWidth()==null || dimension.getHeight()==null) {
	    	throw new InsufficientDataException("Box deimension is required.");
	    }
	    
	    double totalAmount=HelperMethod.calculateShipmentCost(newShipment.getWeight(),dimension.getLength(),dimension.getWidth(),dimension.getHeight(),newShipment.getPackageEntity().getFragile());
	    
	    newShipment.getPayment().setAmount(totalAmount);
	    
	    if (newShipment.getPayment().getPaymentStatus() == null) {
	        newShipment.getPayment().setPaymentStatus(PaymentStatus.PENDING);
	    }

	    if (newShipment.getTrackingHistory().getDeliveryStatus() == null) {
	        newShipment.getTrackingHistory().setDeliveryStatus(DeliveryStatus.PENDING);
	    }

	    Shipment savedShipment = shipmentRepository.save(newShipment);

	    ResponseStructure<Shipment> res = new ResponseStructure<>();
	    res.setStatusCode(HttpStatus.CREATED.value());
	    res.setMessage("Shipment created successfully.");
	    res.setData(savedShipment);

	    return res;
	}
	
	public ResponseStructure<List<Shipment>> getAllShipment(){
		List<Shipment> shipments=shipmentRepository.findAll();
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("No Shipment found");
		}
		
		ResponseStructure<List<Shipment>> res=new ResponseStructure<List<Shipment>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All shipments fetched successfully");
		res.setData(shipments);
		
		return res;
	}
	
	public ResponseStructure<Shipment> getShipmentById(Integer shipmentId){
		Optional<Shipment> shipments=shipmentRepository.findById(shipmentId);
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("No shipment found with id : " + shipmentId);
		}
		
		ResponseStructure<Shipment> res=new ResponseStructure<Shipment>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Shipment fetched successfully");
		res.setData(shipments.get());
		
		return res;
	}
	
	public ResponseStructure<Shipment> getShipmentByTrackingNumber(Integer trackingId){
		Optional<Shipment> shipments=shipmentRepository.findByTrackingNumber(trackingId);
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("No shipment found with tracking number : " + trackingId);
		}
		
		ResponseStructure<Shipment> res=new ResponseStructure<Shipment>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Shipment fetched successfully");
		res.setData(shipments.get());
		
		return res;
	}
	
	public ResponseStructure<List<Shipment>> getAllShipmentByCustomer(Integer customerId){
		List<Shipment> shipments=shipmentRepository.findByCustomerCustomerId(customerId);
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("No shipments found for customer id : " + customerId);
		}
		
		ResponseStructure<List<Shipment>> res=new ResponseStructure<List<Shipment>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Customer shipments fetched successfully");
		res.setData(shipments);
		
		return res;
	}
	
	public ResponseStructure<List<Shipment>> getAllShipmentByDeliveryAgent(Integer deliveryAgentId){
		List<Shipment> shipments=shipmentRepository.findByDeliveryAgentDeliveryAgentId(deliveryAgentId);
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("No shipments assigned to delivery agent id : " + deliveryAgentId);
		}
		
		ResponseStructure<List<Shipment>> res=new ResponseStructure<List<Shipment>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Delivery agent shipments fetched successfully");
		res.setData(shipments);
		
		return res;
	}
	
	public ResponseStructure<List<Shipment>> getAllShipmentByDeliveryDate(LocalDate date){
		List<Shipment> shipments=shipmentRepository.findByDeliveryDate(date);
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("No shipments found for delivery date : " + date);
		}
		
		ResponseStructure<List<Shipment>> res=new ResponseStructure<List<Shipment>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Shipments fetched successfully");
		res.setData(shipments);
		
		return res;
	}
	
	public ResponseStructure<Page<Shipment>> getAllShipmentByPaginationAndSorting(Integer currentPage,Integer pageNumber,String fieldName,String direction){
		PageRequest pageRequest = PageRequest.of(currentPage, pageNumber, direction.equals("desc")?Sort.by(fieldName).descending():Sort.by(fieldName).ascending());
		Page<Shipment> shipments=shipmentRepository.findAll(pageRequest);
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("Pagination details are required");
		}
		
		ResponseStructure<Page<Shipment>> res=new ResponseStructure<Page<Shipment>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Shipments fetched successfully with pagination and sorting");
		res.setData(shipments);
		
		return res;
	}
	
	public ResponseStructure<List<Shipment>> getAllShipmentBySourceAndAvailability(String source,Boolean availability){
		List<Shipment> shipments=shipmentRepository.findBySourceAndDeliveryAgentAvailability(source,availability);
		
		if(shipments.isEmpty()) {
			throw new NoRecordFoundException("No shipment is present there ");
		}
		
		ResponseStructure<List<Shipment>> res=new ResponseStructure<List<Shipment>>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("All Shipments present depending on source and avaibilitys");
		res.setData(shipments);
		
		return res;
	}
	
	public ResponseStructure<Shipment> assignDeliveryAgent(Integer shipmentId ,Integer deliveryAgentId){
		if(deliveryAgentId==null || shipmentId==null) {
			throw new InsufficientDataException("Both delivery agent and shipment ids are required");
		}
		
		Optional<DeliveryAgent> deliveryAgent=deliveryAgentRepository.findById(deliveryAgentId);
		
		if(deliveryAgent.isEmpty()) {
			throw new NoRecordFoundException("No delivery Agent found with id : "+deliveryAgentId);
		}
		if(!deliveryAgent.get().getAvailability()){
			throw new UnAuthorizedOperationException("Delivery agent is unavailability with id : "+deliveryAgentId);
		}
		Optional<Shipment> shipmentOptional=shipmentRepository.findById(shipmentId);
		
		if(shipmentOptional.isEmpty()) {
			throw new NoRecordFoundException("No Shipment found with id : "+shipmentId);
		}
		
		
		shipmentOptional.get().setDeliveryAgent(deliveryAgent.get());
		
		Shipment shipment=shipmentRepository.save(shipmentOptional.get());

		ResponseStructure<Shipment> res=new ResponseStructure<Shipment>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Successfull assigned the delivery agent");
		res.setData(shipment);
		
		return res;
	}
	
	public ResponseStructure<Shipment> assignWarehouse(Integer shipmentId ,Integer warehouseId){
		if(warehouseId==null || shipmentId==null) {
			throw new InsufficientDataException("Both shipment id and warehouse id are required");
		}
		
		Optional<Warehouse> warehouse=warehouseRepository.findById(warehouseId);
		
		if(warehouse.isEmpty()) {
			throw new NoRecordFoundException("No delivery Agent found with id : "+warehouseId);
		}
		
		Optional<Shipment> shipmentOptional=shipmentRepository.findById(shipmentId);
		
		if(shipmentOptional.isEmpty()) {
			throw new NoRecordFoundException("No Shipment found with id : "+shipmentId);
		}
		
		shipmentOptional.get().setWarehouse(warehouse.get());
		
		Shipment shipment=shipmentRepository.save(shipmentOptional.get());
		
		ResponseStructure<Shipment> res=new ResponseStructure<Shipment>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Successfull assigned the delivery agent");
		res.setData(shipment);
		
		return res;
	}
	
	public ResponseStructure<Shipment> updateStatus(Integer shipmentId,Map<String, String> status){
		if(status==null) {
			throw new InsufficientDataException("Status requires some values");
		}
		
		Optional<Shipment> shipment=shipmentRepository.findById(shipmentId);
		
		if(shipment.isEmpty()) {
			throw new NoRecordFoundException("No Shipment found with id : "+shipmentId);
		}
		
		for(Map.Entry<String, String> entry:status.entrySet()) {
			switch(entry.getKey()) {
			case "paymentStatus":
				if(!HelperMethod.paymentStatusValidation(entry.getValue())) {
					throw new InvalidStatusException("Invalid payment Status");
				}
				Payment payment=shipment.get().getPayment();
				payment.setPaymentStatus(PaymentStatus.valueOf(entry.getValue().toUpperCase()));
				
				break;
			case "deliveryStatus":
				if(!HelperMethod.deliveryStatusValidation(entry.getValue())) {
					throw new InvalidStatusException("Invalid Delivary Status");
				}
				
				TrackingHistory trackingHistory=shipment.get().getTrackingHistory();
				trackingHistory.setDeliveryStatus(DeliveryStatus.valueOf(entry.getValue().toUpperCase()));
				break;
				
			default:
	            throw new InvalidStatusException("Invalid field: " + entry.getKey()+ ". Allowed fields are paymentStatus and deliveryStatus.");
			}
		}
		
		shipmentRepository.save(shipment.get());
		
		ResponseStructure<Shipment> res=new ResponseStructure<Shipment>();
		res.setStatusCode(HttpStatus.OK.value());
		res.setMessage("Status updated successfully.");
		res.setData(shipment.get());
		
		return res;
	}
}
