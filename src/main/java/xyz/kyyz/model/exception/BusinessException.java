/**   
* @Title: BusinessException.java 
* @Package com.yiminbang.model.exception 
* @Description: 业务逻辑异常的类文件 
* @author liwei  
* @date 2015年5月4日 上午10:01:06 
* @version V1.0   
*/
package xyz.kyyz.model.exception;



/**
 * @ClassName: BusinessException 
 * @Description: 业务逻辑异常的类
 * @author liwei
 * @date 2015年5月4日 上午10:01:06 
 *  
 */
public class BusinessException extends RuntimeException {
	/** 
	* @Fields serialVersionUID : 业务逻辑异常的类
	*/ 
	private static final long serialVersionUID = 1L;

	private long errorCode=-998;
	public BusinessException(String message) {
		super(message);
	}
	public BusinessException(long errorCode, String message){
		this(message);
		this.errorCode = errorCode;
	}
	public long getErrorCode() {
		return errorCode;
	}
	public void setErrorCode(long errorCode) {
		this.errorCode = errorCode;
	}
}
