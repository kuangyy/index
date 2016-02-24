package xyz.kyyz.utils.helper;

import org.apache.log4j.Logger;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * 日志辅助类 记录本地日志
 * @author Administrator
 *
 */
public class LogHelper {
	
	private static final String loggerName ="file";
	private static Logger logger = Logger.getLogger(loggerName);
	
	public static void Error(String message){
		logger.error(message);
	}
	
	/**
	 * 记录异常日志 含堆栈信息
	 * @Title: SystemError 
	 * @Description: TODO
	 * @param message
	 * @param t
	 * @Date Sep 29, 2015 4:05:10 PM
	 * @author yinqiang
	 * @throws
	 */
	public static void SystemError(String message,Throwable t){
		StringBuilder sb =new StringBuilder();
		sb.append("****************************************"+"\n");
		sb.append("系统异常日志:"+message+"\n");
		try {
			StringWriter sw = new StringWriter();  
		    PrintWriter pw = new PrintWriter(sw);  
		    sb.append("message:"+t.getMessage()+"\n");
		    try  
		    {  
		        t.printStackTrace(pw);  
		        sb.append("堆栈信息:"+sw.toString()+"\n");
		    }  
		    finally  
		    {  
		        pw.close();
		    }
		} catch (Exception e) {
			// TODO: handle exception
		}		
		sb.append("****************************************"+"\n");
		logger.error(sb.toString());
		
	}
	
	public static void info(String message){
		logger.info(message);
	}
	//打印出异常的堆栈信息 方便查找异常
	public static void Error(String message,Exception e){
		logger.error(message, e);
	}

}
