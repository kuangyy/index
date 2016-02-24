package xyz.kyyz.utils.extention;

/**
 * 
* @ClassName: BooleanExtention 
* @Description: Boolean类型扩展方法
* @author yinqiang
* @date Jun 18, 2015 8:16:37 PM 
*
 */
public class BooleanExtention {

	/**
	 * 
	* @Title: isTrue 
	* @Description: 判断Boolean对象是否有值且是true
	* @param booleanValue
	* @return
	* @author yinqiang
	* @throws
	 */
	public static boolean isTrue(Boolean booleanValue) {
		return booleanValue != null && booleanValue.booleanValue();
	}
}
