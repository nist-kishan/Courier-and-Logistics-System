package com.courier_and_logistic_system.execption;

public class AlreadyUsedException extends RuntimeException{
	public AlreadyUsedException(String message) {
		super(message);
	}
}
