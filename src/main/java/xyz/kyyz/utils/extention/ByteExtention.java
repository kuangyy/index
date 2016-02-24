package xyz.kyyz.utils.extention;


/**
 * 
* @ClassName: ByteExtention 
* @Description: Byte类型扩展
* @author yinqiang
* @date Jun 14, 2015 11:05:42 AM 
*
 */
public class ByteExtention {
	
	/**
	 * 
	* @Title: hasValueAndMaxZero 
	* @Description: 判断Byte是否有值且大于0
	* @param value
	* @return
	* @author yinqiang
	* @throws
	 */
	public static boolean hasValueAndMaxZero(Byte value) {
		return (value != null && value>0);
	}
}
