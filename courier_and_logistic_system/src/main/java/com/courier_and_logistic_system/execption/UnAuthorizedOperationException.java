package com.courier_and_logistic_system.execption;

public class UnAuthorizedOperationException extends RuntimeException{
	public UnAuthorizedOperationException(String message) {
		super(message);
	}
}
