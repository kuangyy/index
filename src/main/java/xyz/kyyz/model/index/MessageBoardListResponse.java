package xyz.kyyz.model.index;

import xyz.kyyz.model.SplitPageResponse;

import java.util.List;

/**
 * Created by kuangye on 2016/2/23.
 */
public class MessageBoardListResponse {

    List<MessageBoardModel> messageBoardModelList;

    SplitPageResponse splitPageResponse;

    public List<MessageBoardModel> getMessageBoardModelList() {
        return messageBoardModelList;
    }

    public void setMessageBoardModelList(List<MessageBoardModel> messageBoardModelList) {
        this.messageBoardModelList = messageBoardModelList;
    }

    public SplitPageResponse getSplitPageResponse() {
        return splitPageResponse;
    }

    public void setSplitPageResponse(SplitPageResponse splitPageResponse) {
        this.splitPageResponse = splitPageResponse;
    }
}
