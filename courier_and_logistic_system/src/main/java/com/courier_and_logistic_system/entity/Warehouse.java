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
public class Warehouse {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer warehouseId;
	
	private String warehouseName;
	
	private String location;
	
	private Double capacity;
	
	@Column(unique = true,length = 10)
	private String warehouseContactNumber;
	
	@OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<Shipment> shipment;
}
