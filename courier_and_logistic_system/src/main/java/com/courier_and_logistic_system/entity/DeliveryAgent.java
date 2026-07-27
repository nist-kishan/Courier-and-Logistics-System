package com.courier_and_logistic_system.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAgent {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer deliveryAgentId;
	
	private String deliveryAgentName;
	
	@Column(unique = true,length = 10)
	private String deliveryAgentContactNumber;
	
	@Column(unique = true)
	private String vehicleNumber;
	
	private Boolean availability;
	
	private Integer rating;
	
	@OneToMany(mappedBy = "deliveryAgent", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<Shipment> shipment;
	
}
