package xyz.kyyz.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.ExceptionHandler;
import xyz.kyyz.model.Request;
import xyz.kyyz.model.RequestHead;
import xyz.kyyz.model.Response;
import xyz.kyyz.model.ResponseHead;
import xyz.kyyz.model.exception.BusinessException;
import xyz.kyyz.utils.helper.LogHelper;
import xyz.kyyz.utils.web.WebHelper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;


public class BaseController {
    private ObjectMapper objectMapper = new ObjectMapper();

    protected <T> Response<T> getResponse(long statusCode, String note) {
        Response<T> response = new Response<T>();
        ResponseHead head = new ResponseHead();
        head.setStatusCode(statusCode);
        head.setNote(note);
        response.setHead(head);
        return response;
    }


    public RequestHead getRequestHead(HttpServletRequest request) {
        RequestHead requestHead = new RequestHead();
        requestHead.setUserIp(WebHelper.getIp(request));
        try {
//			TenThousandsUserModel model = AuthHelper.getLoginUserModel(request);
//			if(model != null && model.getId() != 0){
//				requestHead.setLoginUserId(model.getId());
//			}
        } catch (Exception ex) {
        }
        return requestHead;
    }

    @SuppressWarnings("unchecked")
    protected <T> Request<T> GetRequest(Class<T> type, HttpServletRequest httpRequest) throws Exception {
        Request<T> request = null;

        try {
            request = (Request<T>) objectMapper.readValue(httpRequest.getAttribute("requestModel").toString(), objectMapper.getTypeFactory().constructParametrizedType(Request.class, Request.class, type));
        } catch (Exception ex) {
            request = (Request<T>) objectMapper.readValue(httpRequest.getAttribute("requestModel").toString(), Request.class);
            throw ex;
        }

        return request;
    }

    @ExceptionHandler
    public void ExceptionProcess(HttpServletRequest request, HttpServletResponse response, Exception ex) {

        boolean isAjax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
        Map<String, Object> map = new HashMap<>();
        map.put("success", false);
        if (ex instanceof BusinessException) {
            BusinessException be = (BusinessException) ex;
            map.put("message", be.getMessage());
        } else {
            map.put("message", "系统异常");
        }
        LogHelper.Error(ex.getMessage(), ex);
        if (isAjax) {
            OutputStream ps = null;
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json; charset=utf-8");
            try {
                ps = response.getOutputStream();
                ps.write(objectMapper.writeValueAsString(map).getBytes("UTF-8"));
            } catch (IOException e) {
                //
            } finally {
                if (ps != null) {
                    try {
                        ps.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }

        } else {
            try {
                response.sendRedirect(request.getContextPath() + "/error/index?msg=" + URLEncoder.encode(map.get("message").toString(), "utf-8"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
