package com.courier_and_logistic_system.execption;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.courier_and_logistic_system.dto.ResponseStructure;

@ControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(AlreadyUsedException.class)
	public ResponseEntity<ResponseStructure<String>> handlerAUE(AlreadyUsedException exception){
		ResponseStructure<String> res=new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.CONFLICT.value());
		res.setMessage(exception.getMessage());
		res.setData("Failed");
		
		return new ResponseEntity<ResponseStructure<String>>(res,HttpStatus.CONFLICT);
	}
	
	@ExceptionHandler(InvalidContactNumberException.class)
	public ResponseEntity<ResponseStructure<String>> handlerICNE(InvalidContactNumberException exception){
		ResponseStructure<String> res=new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.LENGTH_REQUIRED.value());
		res.setMessage(exception.getMessage());
		res.setData("Failed");
		
		return new ResponseEntity<ResponseStructure<String>>(res,HttpStatus.LENGTH_REQUIRED);
	}
	
	@ExceptionHandler(InsufficientDataException.class)
	public ResponseEntity<ResponseStructure<String>> handlerISDE(InsufficientDataException exception){
		ResponseStructure<String> res=new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.NOT_ACCEPTABLE.value());
		res.setMessage(exception.getMessage());
		res.setData("Failed");
		
		return new ResponseEntity<ResponseStructure<String>>(res,HttpStatus.NOT_ACCEPTABLE);
	}
	
	@ExceptionHandler(NoRecordFoundException.class)
	public ResponseEntity<ResponseStructure<String>> handlerNDFE(NoRecordFoundException exception){
		ResponseStructure<String> res=new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.NOT_FOUND.value());
		res.setMessage(exception.getMessage());
		res.setData("Failed");
		
		return new ResponseEntity<ResponseStructure<String>>(res,HttpStatus.NOT_FOUND);
	}
	
	@ExceptionHandler(NoAttributeFoundException.class)
	public ResponseEntity<ResponseStructure<String>> handlerNAFE(NoAttributeFoundException exception){
		ResponseStructure<String> res=new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.NOT_FOUND.value());
		res.setMessage(exception.getMessage());
		res.setData("Failed");
		
		return new ResponseEntity<ResponseStructure<String>>(res,HttpStatus.NOT_FOUND);
	}
	
	@ExceptionHandler(UnAuthorizedOperationException.class)
	public ResponseEntity<ResponseStructure<String>> handlerUAOE(UnAuthorizedOperationException exception){
		ResponseStructure<String> res=new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.CONFLICT.value());
		res.setMessage(exception.getMessage());
		res.setData("Failed");
		
		return new ResponseEntity<ResponseStructure<String>>(res,HttpStatus.CONFLICT);
	}
	
	@ExceptionHandler(InvalidStatusException.class)
	public ResponseEntity<ResponseStructure<String>> handlerISE(InvalidStatusException exception){
		ResponseStructure<String> res=new ResponseStructure<String>();
		res.setStatusCode(HttpStatus.NOT_FOUND.value());
		res.setMessage(exception.getMessage());
		res.setData("Failed");
		
		return new ResponseEntity<ResponseStructure<String>>(res,HttpStatus.NOT_FOUND);
	}
}

