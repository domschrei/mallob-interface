package edu.kit.fallob.mallobio.output;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * 
 * @author Simon Wilhelm Schübel
 * @version 1.0
 *
 */
public class MallobOutputReader implements MallobOutputActionChecker {

	
	private String pathToMallobOutputLog;
	
	private List<OutputProcessor> processors;
	
	private int lastReadLine;
	
	/**
	 * Constructor of MallobOutputReader 
	 * 
	 * 
	 * @param pathToMallobOutputLog log-file which this reader is reading
	 */
	public MallobOutputReader(String pathToMallobOutputLog) {
		this.pathToMallobOutputLog = pathToMallobOutputLog;
		this.lastReadLine = 0;
		processors = new ArrayList<>();
	}
	
	
	/**
	 * Read the next Line of the file, which path is sepcified in pathToMallobOutputLog
	 */
	public void readNextLine() {
		String line = null;
		try (Stream<String> lines = Files.lines(Paths.get(pathToMallobOutputLog))){
			Optional<String> optional = lines.skip(lastReadLine).findFirst();
			if (optional.isEmpty()) {
				return;
			}
			line = optional.get();
		} catch(IOException e) {
			System.out.println(e.getMessage());
		}
		this.giveLineToProcessors(line);
		lastReadLine++;
	}
	
	/**
	 * 
	 * @param line
	 */
	private void giveLineToProcessors(String line) {
		if (line == null) {return;}
		for(OutputProcessor p : processors) {
			p.processLogLine(line);
		}
	}
	
	
	public void addProcessor(OutputProcessor p) {
		processors.add(p);
	}


	@Override
	public void checkForAction() {
		readNextLine();
	}


	@Override
	public boolean isDone() {
		return false;
	}
}
