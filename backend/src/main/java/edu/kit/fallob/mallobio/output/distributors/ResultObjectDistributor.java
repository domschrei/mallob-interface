package edu.kit.fallob.mallobio.output.distributors;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import edu.kit.fallob.mallobio.listeners.resultlisteners.ResultObjectListener;
import edu.kit.fallob.mallobio.outputupdates.ResultAvailableObject;

public class ResultObjectDistributor {
	
	private List<ResultObjectListener> listeners;
	
	
	public ResultObjectDistributor() {
		this.listeners = new CopyOnWriteArrayList<>();
	}
	

	public void distributeResultObject(ResultAvailableObject rao) {
		for (ResultObjectListener listener : listeners) {
			listener.processResultObject(rao);
		}
	}

	public void addListener(ResultObjectListener listener) {
		this.listeners.add(listener);
	}

	public void removeListener(ResultObjectListener listener) {
		this.listeners.remove(listener);
	}
}
