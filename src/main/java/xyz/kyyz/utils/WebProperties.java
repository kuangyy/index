package xyz.kyyz.utils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class WebProperties {
    static private Boolean isDebug = false;
    static private String securityKey = null;
    static private String domain = null;
    static private String cookieDomain = null;

    //微信 appid
    static private String openWechatAppId = null;
    //微信 secret
    static private String openWechatSecret = null;

    //商户号
    static private String openWechatMerchant = null;
    //这个参数partnerkey是在商户后台配置的一个32位的key,微信商户平台-账户设置-安全设置-api安全
    static private String openWechatPartnerkey = null;

    //alipay

    static private String alipay_partner = null;
    static private String alipay_private_key = null;

    static {
        loads();
    }

    synchronized static public void loads() {
        InputStream is = null;
        try {
            is = new FileInputStream(System.getProperty("tenthousandsPath") + "/web.properties");

            Properties webProperties = new Properties();
            webProperties.load(is);

            isDebug = Boolean.parseBoolean(webProperties.getProperty("debug"));

            securityKey = webProperties.getProperty("securityKey");

            domain = webProperties.getProperty("domain");

            cookieDomain = webProperties.getProperty("cookieDomain");

            openWechatAppId = webProperties.getProperty("openWechatAppid");

            openWechatSecret = webProperties.getProperty("openWechatSecret");

            openWechatMerchant = webProperties.getProperty("openWechatMerchant");

            openWechatMerchant = webProperties.getProperty("openWechatPartnerkey");

            alipay_partner = webProperties.getProperty("openWechatPartnerkey");
            alipay_private_key = webProperties.getProperty("openWechatPartnerkey");

        } catch (Exception e) {
            System.err.println("不能读取属性文件. " + "请确保web.properties在指定的路径中");
        } finally {
            try {
                if (is != null) {
                    is.close();
                }
            } catch (IOException e) {
            }
        }
    }

    public static Boolean getIsDebug() {
        return isDebug;
    }

    public static String getSecurityKey() {
        return securityKey;
    }

    public static String getDomain() {
        return domain;
    }

    public static String getCookieDomain() {
        return cookieDomain;
    }

    public static String getOpenWechatMerchant() {
        return openWechatMerchant;
    }

    public static String getOpenWechatAppId() {
        return openWechatAppId;
    }

    public static String getOpenWechatSecret() {
        return openWechatSecret;
    }

    public static String getOpenWechatPartnerkey() {
        return openWechatPartnerkey;
    }

    public static String getAlipay_partner() {
        return alipay_partner;
    }

    public static String getAlipay_private_key() {
        return alipay_private_key;
    }
}
