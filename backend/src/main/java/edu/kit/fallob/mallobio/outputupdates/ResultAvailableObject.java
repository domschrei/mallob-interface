package edu.kit.fallob.mallobio.outputupdates;

import java.io.File;

/**
 * 
 * @author Simon Wilhelm Schübel
 * @version 1.0
 *
 */
public class ResultAvailableObject extends OutputUpdate {
	
	
	private String filePathToResult;
	private File result;

	public ResultAvailableObject(String filePathToResult) {
		super(null);		//has no log line
		this.filePathToResult = filePathToResult;
	}

	public String getFilePathToResult() {
		return filePathToResult;
	}
	
	

}
