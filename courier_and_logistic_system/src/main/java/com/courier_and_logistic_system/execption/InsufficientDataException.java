package com.courier_and_logistic_system.execption;

public class InsufficientDataException extends RuntimeException{
	public InsufficientDataException(String message) {
		super(message);
	}
}
