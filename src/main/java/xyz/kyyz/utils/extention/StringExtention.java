package xyz.kyyz.utils.extention;

import java.util.Random;

/**
 * 
* @ClassName: StringExtention 
* @Description: String类型扩展
* @author yinqiang
* @date Jun 14, 2015 11:07:40 AM 
*
 */
public class StringExtention {
	
	/**
	 * 	
	* @Title: isNullOrEmpty 
	* @Description: 判断字符串是否是null或者空
	* @param str
	* @return
	* @author yinqiang
	* @throws
	 */
	public static  boolean isNullOrEmpty(String str){
		return isNullOrEmpty(str,false);
	}

	/**
	 * 判断字符串是否是null或者空 如果不为null 则问trim后结果
	 * @param str
	 * @return
	 */
	public  static  boolean isTrimNullOrEmpty(String str){
		return  isNullOrEmpty(str,true);
	}
	/**
	 * 判断字符串是否是null或者空
	 * @param str
	 * @param isTrim 是否需要trim
	 * @return
	 */
	public static boolean isNullOrEmpty(String str, boolean isTrim) {
		if (str == null || str.isEmpty()) {
			return true;
		}
		if (isTrim) {
			return str.trim().isEmpty();
		}
		return false;
	}

    static String  str = "abcdefghijklmnopqrstuvwxyz";
    static String num = "0123456789";

    public static char getRandomLetterChar(){
      return str.charAt(new Random().nextInt(26));
    }

    public static char getRandomNumChar(){
        return num.charAt(new Random().nextInt(10));
    }
}
