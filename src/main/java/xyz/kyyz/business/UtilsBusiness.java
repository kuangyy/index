/**
 * @Title: utils.java
 * @Package com.yiminbang.business
 * @Description: 业务操作工具类
 * @author liwei
 * @date 2015年5月4日 下午6:54:52
 * @version V1.0
 */
package xyz.kyyz.business;

import org.springframework.web.multipart.commons.CommonsMultipartFile;
import xyz.kyyz.model.RequestHead;
import xyz.kyyz.model.SplitPageRequest;
import xyz.kyyz.model.SplitPageResponse;
import xyz.kyyz.model.exception.BusinessException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

/**
 * @ClassName: utils
 * @Description: 业务操作工具类
 */
public class UtilsBusiness {
    public static void pubMapforSplitPage(SplitPageRequest request,
                                          Map<String, Object> map) {
        map.put("rowStart", getRowStart(request));
        map.put("rowCount", getRowCount(request));
    }

    public static int getRowStart(SplitPageRequest request) {
        if (request != null) {
            return (request.getPageNo() - 1) * request.getPageSize();
        } else {
            return 0;
        }
    }

    public static int getRowCount(SplitPageRequest request) {
        if (request != null) {
            return request.getPageSize();
        } else {
            return 20;
        }
    }

    public static SplitPageResponse getSplitPageResponse(int rowCount,
                                                         int pageSize, int pageNo) {
        int pageCount = 1;
        SplitPageResponse response = new SplitPageResponse();
        pageCount = (int) Math.ceil((double) rowCount / pageSize);
        response.setPageCount(pageCount);
        response.setRecordCount(rowCount);
        response.setPageNo(pageNo);
        return response;
    }

    /**
     * 文件上传oss
     * @author wuzhaoyang
     * @date 2015/08/13
     * @param file
     * @return
     */
//    public static String fileUpload(CommonsMultipartFile file, boolean isWaterDrw) {
//        String fileUlr = "";
//
//        try {
//            if (file != null) {
//                FileAbstract ifile = FileUploadBusinessFactory.create(file.getInputStream(), file.getOriginalFilename());
//
//                ExecuteResultModel executeResult = ifile.uploadFile(isWaterDrw);
//
//                if (executeResult.isSuccess()) {
//
//                    fileUlr = executeResult.getMessage();
//                }
//            }
//
//        } catch (Exception e) {
//            throw new BusinessException("文件出错了");
//        }
//        return fileUlr;
//    }

    /**
     * refactor by John 20101028
     * @param file
     * @param isWaterDrw
     * @param waterDrwPath
     * @return
     * @throws BusinessException
     */
//    public static String imageUpload(CommonsMultipartFile file, boolean isWaterDrw, String waterDrwPath) throws BusinessException {
//        return fileUpload(file, isWaterDrw);
//		String imageUlr="";
//		PictureBusiness iImage=new PictureBusiness();
//		try {
//			String fileName = file.getOriginalFilename();
//			if(fileName.lastIndexOf(".")<0){
//				throw new BusinessException("图片格式错误");
//			}
//			String imgFormat = fileName.substring(fileName.lastIndexOf(".")+1);
//
//			ExecuteResultModel executeResult = null;
//			if (isWaterDrw) {
//				executeResult = iImage.uploadImage(file.getInputStream(), imgFormat, 10, 10, (float) 1.0, waterDrwPath);
//			} else {
//				executeResult = iImage.uploadImage(file.getInputStream(), imgFormat);
//			}
//			if (executeResult.isSuccess()) {
//				imageUlr = executeResult.getMessage();
//			}
//
//		} catch (Exception e) {
//			throw new BusinessException("上传图片出错了");
//		}
//		return imageUlr;
//    }

    /**
     *  refactor by John 20101028
     * @param file
     * @param isWaterDrw
     * @param waterDrwPath
     * @return
     * @throws BusinessException
     */
//    public static String imgUpload(CommonsMultipartFile file, boolean isWaterDrw, String waterDrwPath) throws BusinessException {
//        return fileUpload(file, isWaterDrw);
//		String imageUlr="";
//		ImageBusiness iImage=new ImageBusiness();
//		try {
//			String fileName = file.getOriginalFilename();
//			if (fileName.lastIndexOf(".") < 0) {
//				throw new BusinessException("图片格式错误");
//			}
//			String imgFormat = fileName
//					.substring(fileName.lastIndexOf(".") + 1);
//			InputStream input = file.getInputStream();
//
//			BufferedImage sourceImage = ImageIO.read(input);
//			ExecuteResultModel executeResult = null;
//			if (isWaterDrw) {
//				executeResult = iImage.upLoadImage(sourceImage, imgFormat, 10,
//						10, (float) 1.0, waterDrwPath);
//			} else {
//				executeResult = iImage.upLoadImage(sourceImage, imgFormat);
//			}
//			if (executeResult.isSuccess()) {
//				String host = "http://img1.yiminbang.com/";
//				imageUlr = host + executeResult.getMessage();
//			}
//
//		} catch (Exception e) {
//			throw new BusinessException("上传图片出错了");
//		}
//		return imageUlr;
//    }

    /**
     * 获取sub 在str中出现的次数
     *
     * @param str
     * @param sub
     * @return
     */
    public static int getCount(String str, String sub) {
        int index = 0;
        int count = 0;
        while ((index = str.indexOf(sub, index)) != -1) {

            index = index + sub.length();
            count++;
        }
        return count;
    }

    /***
     *
     * 判断操作人是否操作自己 或是管理员操作
     * @date 10:07:35 AM Aug 11, 2015
     * @author kuangye
     * @return boolean
     */
//    public static boolean isSelfOrAdmin(Integer id, RequestHead requestHead) throws Exception {
//
//        Integer loginId = requestHead.getLoginUserId();
//        if (loginId.intValue() == id.intValue() || AuthHelper.isSuperAdmin(loginId)) {
//            return true;
//        }
//
//        return false;
//    }

    /**
     * @Title:getDateRegion
     * @Description: 根据类型获取两个日期之间的连续日期
     * @param startTime 开始时间
     * @param endTime   截止时间
     * @param type      年:year  月:month  日:day
     * @return List<String> 返回日期格式字符串集合
     * @throws ParseException  日期转换异常
     *  author: liulin  Nov 26, 2015 9:03:48 PM
     */
    public static List<String> getDateRegion(String startTime, String endTime, String type) throws Exception {
        if (!"year".equals(type) && !"month".equals(type) && !"day".equals(type)) {
            throw new BusinessException("日期类型没有指定");
        }
        List<String> dateList = new ArrayList<String>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Calendar beginDate = Calendar.getInstance();
        Calendar endDate = Calendar.getInstance();
        beginDate.setTime(sdf.parse(startTime));
        endDate.setTime(sdf.parse(endTime));
        int startTimeOfMonth = beginDate.get(Calendar.MONTH);
        int endTimeOfMonth = endDate.get(Calendar.MONTH);
        int startTimeOfYear = beginDate.get(Calendar.YEAR);
        int endTimeOfYear = endDate.get(Calendar.YEAR);
        if ("month".equals(type)) {
            sdf = new SimpleDateFormat("yyyy-MM");
            beginDate.set(startTimeOfYear, startTimeOfMonth, 1);
            endDate.set(endTimeOfYear, endTimeOfMonth, 1);
            endDate.add(Calendar.MONTH, 1);// 月增加1天
            endDate.add(Calendar.DAY_OF_MONTH, -1);// 日期倒数一日,既得到本月最后一天
            Calendar temp = Calendar.getInstance();
            temp.setTime(beginDate.getTime());
            dateList.add(sdf.format(temp.getTime()));
            temp.add(Calendar.MONTH, 1);
            while (temp.before(endDate)) {
                dateList.add(sdf.format(temp.getTime()));
                temp.add(Calendar.MONTH, 1);
            }
        } else if ("year".equals(type)) {
            sdf = new SimpleDateFormat("yyyy");
            beginDate.set(startTimeOfYear, 0, 1);
            endDate.set(endTimeOfYear, 11, 31);
            if (beginDate.get(Calendar.YEAR) == endDate.get(Calendar.YEAR)) {
                dateList.add(sdf.format(beginDate.getTime()));
            } else {
                Calendar temp = Calendar.getInstance();
                temp.setTime(beginDate.getTime());
                dateList.add(sdf.format(temp.getTime()));
                temp.add(Calendar.YEAR, 1);
                while (temp.before(endDate)) {
                    dateList.add(sdf.format(temp.getTime()));
                    temp.add(Calendar.YEAR, 1);
                }
            }
        } else {
            Calendar temp = Calendar.getInstance();
            temp.setTime(beginDate.getTime());
            temp.add(Calendar.DAY_OF_YEAR, 1);
            dateList.add(sdf.format(beginDate.getTime()));
            while (temp.before(endDate)) {
                dateList.add(sdf.format(temp.getTime()));
                temp.add(Calendar.DAY_OF_YEAR, 1);
            }
            dateList.add(sdf.format(endDate.getTime()));
        }
        return dateList;
    }
}
