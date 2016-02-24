/**   
* @Title: CeneterDB.java 
* @Package com.yiminbang.data 
* @Description: CenterDB的注解类文件
* @author A18ccms A18ccms_gmail_com   
* @date 2015年5月9日 下午3:13:42 
* @version V1.0   
*/
package xyz.kyyz.data;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** 
 * @ClassName: CeneterDB 
 * @Description: CenterDB的注解类
 * @author A18ccms a18ccms_gmail_com 
 * @date 2015年5月9日 下午3:13:42 
 *  
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface ContentDB {

}
