package xyz.kyyz.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import xyz.kyyz.ibusiness.IMessageBoard;
import xyz.kyyz.model.SplitPageRequest;
import xyz.kyyz.model.index.MessageBoardListResponse;
import xyz.kyyz.model.index.MessageBoardModel;
import xyz.kyyz.utils.extention.StringExtention;
import xyz.kyyz.utils.web.RequestParamHelper;
import xyz.kyyz.utils.web.WebHelper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by ky on 2016/2/23.
 */


@RequestMapping("/board")
@Controller
public class MessageBoardController extends BaseController {

    @Autowired
    IMessageBoard iMessageBoard;

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public
    @ResponseBody
    Map<String, Object> list(HttpServletRequest request, HttpServletResponse response) throws Exception {

        Map<String, Object> map = new HashMap<>();
        SplitPageRequest splitPageRequest = new SplitPageRequest();

        splitPageRequest.setPageSize(10);
        Integer pageNoInteger = RequestParamHelper.getInteger(request, "pageno");
        if (pageNoInteger == null || pageNoInteger == 0)
            pageNoInteger = 1;
        splitPageRequest.setPageNo(pageNoInteger);
        splitPageRequest.setReturnCount(true);

        MessageBoardListResponse messageBoardListResponse = iMessageBoard.listByPage(splitPageRequest);

        map.put("success", true);
        map.put("response", messageBoardListResponse);

        return map;
    }


    @RequestMapping(value = "/add", method = RequestMethod.POST)
    public
    @ResponseBody
    Map<String, Object> add(HttpServletRequest request, HttpServletResponse response,
                            MessageBoardModel model
    ) throws Exception {

        Map<String, Object> map = new HashMap<>();

        if (model != null) {
            String nickName = model.getNickname();
            if (StringExtention.isTrimNullOrEmpty(nickName)) {
                nickName = WebHelper.getIp(request);

                if (StringExtention.isTrimNullOrEmpty(nickName)) {
                    nickName = "" + StringExtention.getRandomLetterChar()
                            + StringExtention.getRandomLetterChar()
                            + StringExtention.getRandomLetterChar()
                            + StringExtention.getRandomLetterChar()
                            + StringExtention.getRandomLetterChar()
                            + StringExtention.getRandomNumChar()
                            + StringExtention.getRandomNumChar();
                }
            }

            model.setNickname(nickName);
        }

        boolean b = iMessageBoard.add(model);

        map.put("success", b);

        return map;
    }

}
