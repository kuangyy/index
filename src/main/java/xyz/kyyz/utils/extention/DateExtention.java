package xyz.kyyz.utils.extention;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * 
* @ClassName: DateExtention 
* @Description: Date扩展
* @author yinqiang
* @date Jul 23, 2015 6:24:36 PM 
*
 */
public class DateExtention {
	final static String dataFromat="yyyy-MM-dd";
	
	/**
	 * 
	 * @Title: prase 
	 * @Description: 字符串转换Date 格式:yyyy-MM-dd
	 * @param source
	 * @return
	 * @author yinqiang
	 * @throws
	 */
	public static Date prase(String source){
		SimpleDateFormat sdFormat=new SimpleDateFormat(dataFromat);
		try {
			Date date= sdFormat.parse(source);
			return date;
		} catch (Exception e) {			
			return null;			
			// TODO: handle exception
		}		
	}
}
