package com.org.exception;

public class ProjectNotFoundException extends RuntimeException{

	public ProjectNotFoundException(String msg)
	{
		super(msg);
	}

}
