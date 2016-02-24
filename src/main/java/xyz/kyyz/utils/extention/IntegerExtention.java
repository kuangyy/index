package xyz.kyyz.utils.extention;

/**
 * 
* @ClassName: IntegerExtention 
* @Description: Integer扩展类 
* @author yinqiang
* @date Jun 14, 2015 10:58:30 AM 
*
 */
public class IntegerExtention {
	
	/**
	 * 
	* @Title: hasValueAndMaxZero 
	* @Description: 判断Integer是否有值且大于0
	* @param value
	* @return
	* @author yinqiang
	* @throws
	 */
	public static boolean hasValueAndMaxZero(Integer value) {
		return (value != null && value >0);
	}	
		
}
