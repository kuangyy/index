package xyz.kyyz.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import xyz.kyyz.data.index.MessageBoardModelMapper;
import xyz.kyyz.ibusiness.IMessageBoard;
import xyz.kyyz.model.SplitPageRequest;
import xyz.kyyz.model.SplitPageResponse;
import xyz.kyyz.model.index.MessageBoardListResponse;
import xyz.kyyz.model.index.MessageBoardModel;

import java.net.URLEncoder;
import java.util.List;

/**
 * Created by kuangue on 2016/2/23.
 */
@Service
public class MessageBoardBusiness implements IMessageBoard {


    @Autowired
    private MessageBoardModelMapper messageBoardModelMapper;

    public MessageBoardListResponse listByPage(SplitPageRequest splitPageRequest) {

        MessageBoardListResponse response = new MessageBoardListResponse();

        Integer rowStart = null;
        Integer pageSize = null;

        if (splitPageRequest != null) {
            rowStart = UtilsBusiness.getRowStart(splitPageRequest);
            pageSize = UtilsBusiness.getRowCount(splitPageRequest);
        }

        List<MessageBoardModel> messageBoardModelList = messageBoardModelMapper.select(rowStart, pageSize);
        response.setMessageBoardModelList(messageBoardModelList);

        if (splitPageRequest != null && splitPageRequest.isReturnCount()) {
            int rowCount = messageBoardModelMapper.count();

            SplitPageResponse pageResponse = UtilsBusiness.getSplitPageResponse(rowCount, pageSize, splitPageRequest.getPageNo());
            response.setSplitPageResponse(pageResponse);
        }

        return response;
    }

    public boolean add(MessageBoardModel messageBoardModel) throws Exception {

        Assert.isTrue(messageBoardModel != null, "参数错误");
        Assert.hasText(messageBoardModel.getContent(), "请输入有效内容");
        Assert.hasText(messageBoardModel.getNickname(), "昵称无效");

        messageBoardModel.setId(null);
        messageBoardModel.setCreateTime(null);

        int i = messageBoardModelMapper.insertSelective(messageBoardModel);

        return i > 0;
    }


}
