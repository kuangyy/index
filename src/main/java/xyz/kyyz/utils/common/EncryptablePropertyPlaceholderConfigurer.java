package xyz.kyyz.utils.common;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanInitializationException;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import xyz.kyyz.utils.helper.SecurityHelper;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;

public class EncryptablePropertyPlaceholderConfigurer extends PropertyPlaceholderConfigurer {


    protected void processProperties(ConfigurableListableBeanFactory beanFactory, Properties props) throws BeansException {
        Enumeration<?> propertyNames = props.propertyNames();
        if (propertyNames.hasMoreElements()) {
            Map<String, String> map = new HashMap<>();
            do {
                String propertyName = (String) propertyNames.nextElement();
                String propertyValue = props.getProperty(propertyName);
                if (propertyValue == null || ("".equals(propertyValue))) {
                    throw new BeanInitializationException(propertyName + "的值为空,加载jdbc.properties文件失败");
                }
                map.put(propertyName, propertyValue);
            } while (propertyNames.hasMoreElements());

            //获取key jdbc连接明文
            final String key = map.get("securityKey");
            for (Entry<String, String> entry : map.entrySet()) {
                if (!"securityKey".equals(entry.getKey())) {
                    props.setProperty(entry.getKey(), SecurityHelper.desDecrypt(entry.getValue(), key));
                }
            }
            super.processProperties(beanFactory, props);
        } else {
            throw new BeanInitializationException("jdbc.properties文件内容为空");
        }
    }
}