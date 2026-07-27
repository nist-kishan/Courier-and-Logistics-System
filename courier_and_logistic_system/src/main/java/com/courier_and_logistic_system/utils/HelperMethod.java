package com.courier_and_logistic_system.utils;

import com.courier_and_logistic_system.enums.DeliveryStatus;
import com.courier_and_logistic_system.enums.PackageType;
import com.courier_and_logistic_system.enums.PaymentMethod;
import com.courier_and_logistic_system.enums.PaymentStatus;

public class HelperMethod {
	public static Boolean phoneNumberValidation(String contactNumber) {
		if (contactNumber == null)
			return false;

		return contactNumber.length() == 10 ? true : false;
	}

	public static Boolean paymentStatusValidation(String status) {
		for (PaymentStatus paymentStatus : PaymentStatus.values()) {
			if (paymentStatus.name().equalsIgnoreCase(status)) {
				return true;
			}
		}

		return false;
	}

	public static Boolean deliveryStatusValidation(String status) {
		for (DeliveryStatus deliveryStatus : DeliveryStatus.values()) {
			if (deliveryStatus.name().equalsIgnoreCase(status)) {
				return true;
			}
		}

		return false;
	}

	public static Boolean packageTypeValidation(String status) {
		for (PackageType packageType : PackageType.values()) {
			if (packageType.name().equalsIgnoreCase(status)) {
				return true;
			}
		}

		return false;
	}

	public static Boolean paymentMethodValidation(String status) {
		for (PaymentMethod paymentMethod : PaymentMethod.values()) {
			if (paymentMethod.name().equalsIgnoreCase(status)) {
				return true;
			}
		}

		return false;
	}

	public static double calculateShipmentCost(double weight, double length, double breadth, double height,boolean fragile) {

		double volumetricWeight = (length * breadth * height) / 5000.0;

		double chargeableWeight = Math.max(weight, volumetricWeight);

		double shippingCharge = chargeableWeight * 50; 

		if (fragile) {
			shippingCharge += shippingCharge * 0.10;
		}

		return shippingCharge;
	}
}
