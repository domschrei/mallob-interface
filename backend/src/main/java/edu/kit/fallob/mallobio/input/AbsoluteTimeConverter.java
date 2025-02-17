package edu.kit.fallob.mallobio.input;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.Date;

import edu.kit.fallob.dataobjects.JobConfiguration;
import edu.kit.fallob.mallobio.listeners.outputloglisteners.MallobTimeListener;

public class AbsoluteTimeConverter {
		
	private static final double MILLISECONDS_TO_SECONDS = 0.001;
	
	
	
	/**
	 * Converts a given string in format ISO 8601, which represents an absolute time, to a reltive time in seconds,
	 * since mallob-start.
	 * For example, if it is not currently 14:02 and mallob is exactly running since 2 minutes (so since 14:00), and the absolute
	 * time specified in the string is 14:05, this method would return 300. Because 300seconds after mallob-start (14:00) is 14:05,
	 * meaning mallob would start the job at exactly 14:05
	 * 
	 * @param timeString absolute point in time, formatted as specified in ISO 8601
	 * @return time in seconds, since mallob-start, to match the absolute point specified by the string. If the given string is before 
	 * the current date (absolute), JobConfiguration.DOUBLE_NOT_SET is returned 
	 */
	public static double convertTimeToDouble(String timeString)  {
		if (timeString == null) {return JobConfiguration.DOUBLE_NOT_SET;}
		
		/*
		OffsetDateTime odt = OffsetDateTime.parse(timeString);
		Date d = Date.from(odt.toInstant());
		TemporalAccessor ta = DateTimeFormatter.ISO_INSTANT.parse(timeString);
	    Date d = Date.from(Instant.from(ta));
	    */
		ZonedDateTime zonedTime = ZonedDateTime.parse(timeString);
		Date d = Date.from(zonedTime.toInstant());
		
		if (d.before(new Date())) { //date is before today
			return JobConfiguration.DOUBLE_NOT_SET;
		}
		
		double timeDifferenceInMS = d.getTime() - new Date().getTime();
		return (MallobTimeListener.getInstance().getAmountOfSecondsSinceStart() + (timeDifferenceInMS * MILLISECONDS_TO_SECONDS));
	}
}
