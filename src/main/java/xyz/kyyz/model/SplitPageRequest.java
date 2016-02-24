//
// 此文件是由 JavaTM Architecture for XML Binding (JAXB) 引用实现 v2.2.8-b130911.1802 生成的
// 请访问 <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// 在重新编译源模式时, 对此文件的所有修改都将丢失。
// 生成时间: 2015.05.04 时间 04:58:51 PM CST 
//


package xyz.kyyz.model;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>SplitPageRequest complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="SplitPageRequest">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="pageNo" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="pageSize" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="returnCount" type="{http://www.w3.org/2001/XMLSchema}boolean"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "SplitPageRequest", propOrder = {
    "pageNo",
    "pageSize",
    "returnCount"
})
public class SplitPageRequest {

    protected int pageNo;
    protected int pageSize;
    protected boolean returnCount;

    /**
     * 获取pageNo属性的值。
     * 
     */
    public int getPageNo() {
        return pageNo;
    }

    /**
     * 设置pageNo属性的值。
     * 
     */
    public void setPageNo(int value) {
        this.pageNo = value;
    }

    /**
     * 获取pageSize属性的值。
     * 
     */
    public int getPageSize() {
        return pageSize;
    }

    /**
     * 设置pageSize属性的值。
     * 
     */
    public void setPageSize(int value) {
        this.pageSize = value;
    }

    /**
     * 获取returnCount属性的值。
     * 
     */
    public boolean isReturnCount() {
        return returnCount;
    }

    /**
     * 设置returnCount属性的值。
     * 
     */
    public void setReturnCount(boolean value) {
        this.returnCount = value;
    }

}
