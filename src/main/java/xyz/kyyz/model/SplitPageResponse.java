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
 * <p>SplitPageResponse complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="SplitPageResponse">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="pageCount" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="recordCount" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "SplitPageResponse", propOrder = {
    "pageCount",
    "recordCount"
})
public class SplitPageResponse {

    protected int pageCount;
    protected int recordCount;
    protected int pageNo;

    /** 
	 * @return pageNo 
	 */
	public int getPageNo() {
		return pageNo;
	}

	/**
	 * @param pageNo 要设置的 pageNo
	 */
	public void setPageNo(int pageNo) {
		this.pageNo = pageNo;
	}

	/**
     * 获取pageCount属性的值。
     * 
     */
    public int getPageCount() {
        return pageCount;
    }

    /**
     * 设置pageCount属性的值。
     * 
     */
    public void setPageCount(int value) {
        this.pageCount = value;
    }

    /**
     * 获取recordCount属性的值。
     * 
     */
    public int getRecordCount() {
        return recordCount;
    }

    /**
     * 设置recordCount属性的值。
     * 
     */
    public void setRecordCount(int value) {
        this.recordCount = value;
    }

}
