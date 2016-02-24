//package xyz.kyyz.handler;
//
//
//import xyz.kyyz.model.exception.BusinessException;
//
//import javax.servlet.ServletContextEvent;
//import javax.servlet.ServletContextListener;
//
//
//public class ResourcesListener implements ServletContextListener {
//
//    public void contextDestroyed(ServletContextEvent arg0) {
//
//    }
//
//    public void contextInitialized(ServletContextEvent arg0) {
//        StringBuffer path = new StringBuffer(System.getProperty("catalina.home") == null ? "" : System.getProperty("catalina.home"));
//        if (path.length() == 0) {
//            path.append(System.getProperty("catalina.base") == null ? "" : System.getProperty("catalina.base"));
//        }
//        if (path.length() == 0) {
//            throw new BusinessException("+++++++++++system error: catalina.home or catalina.base is not found!+++++++++++");
//        } else {
//            String a = System.getProperty("file.separator");
//            path.append(a + "appconfig");
//            if(System.getProperty("configHome")==null){
//                System.setProperty("configHome", path.toString());
//            }
//            path.append(a + "tenthousands");
//            System.setProperty("tenthousandsPath", path.toString());
//        }
//    }
//}
