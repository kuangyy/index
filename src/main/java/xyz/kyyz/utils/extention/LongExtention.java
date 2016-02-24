package xyz.kyyz.utils.extention;

/**
 * 
* @ClassName: LongExtention 
* @Description: Long扩展类 
* @author ky
* @date AUG 8, 2015 15:53:30  
*
 */
public class LongExtention {
	
	/**
	 * 
	* @Title: hasValueAndMaxZero 
	* @Description: 判断Long是否有值且大于0
	* @param value
	* @return
	* @author kuangye
	* @throws
	 */
	public static boolean hasValueAndMaxZero(Long value) {
		return (value != null && value >0);
	}	
		
}
