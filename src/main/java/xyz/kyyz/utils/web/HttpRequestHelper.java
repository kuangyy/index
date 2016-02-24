package xyz.kyyz.utils.web;



import xyz.kyyz.utils.extention.StringExtention;

import javax.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 *  内部请求外部url赋值类 
 * @author yinqiang
 *
 *
 */
public class HttpRequestHelper {

		/**
		 * get方式请求指定url，并返回内容
		 * @param url
		 * @param urlGetParas
		 * @return
		 * @throws Exception
		 */
		public static String getResponse(String url,String urlGetParas) throws Exception{
			if(StringExtention.isNullOrEmpty(url)){
				throw new IllegalArgumentException("url不能为空");
			}
			String fullUrl=url+(StringExtention.isNullOrEmpty(urlGetParas)? "":"?"+urlGetParas);
			URL url_str =new URL(fullUrl);
			HttpURLConnection urlConnection=  (HttpURLConnection) url_str.openConnection();
			if(urlConnection != null){
				urlConnection.connect();
			}
			int httpCode = urlConnection.getResponseCode();
			if(httpCode != 200){
				throw new Exception("返回非200:"+httpCode);
			}
			 InputStream responseMessage = urlConnection.getInputStream();
			 byte[] responseBytes = new byte[responseMessage.available()];
			 responseMessage.read(responseBytes);
			 responseMessage.close();
	         if (responseBytes == null || responseBytes.length == 0) {
	            throw new Exception("无数据返回");
	         }
	         String responseStr = new String(responseBytes);
	         return responseStr;
		}
		

		//判断是否微信客户端访问
		public static  boolean isWeiXinAPPAccess(HttpServletRequest httpRequest){
			return  httpRequest.getHeader("User-Agent")!=null &&
					httpRequest.getHeader("User-Agent").toLowerCase().contains("micromessenger");
		}
		//获取操作系统类型 0 未知 1IOS 2ANDROID
		public static int getSystemType(HttpServletRequest httpRequest){
			if(httpRequest.getHeader("User-Agent")!=null){
				String userAgent = httpRequest.getHeader("User-Agent").toLowerCase();
				if(userAgent.contains("iphone") || userAgent.contains("mac os")){
					return  1;
				}else if(userAgent.contains("android")){
					return  2;
				}
			}
			return 0;
		}
}
