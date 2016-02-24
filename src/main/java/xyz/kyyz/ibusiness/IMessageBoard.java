package xyz.kyyz.ibusiness;

import xyz.kyyz.model.SplitPageRequest;
import xyz.kyyz.model.index.MessageBoardListResponse;
import xyz.kyyz.model.index.MessageBoardModel;

/**
 * Created by 野 on 2015/12/25.
 */
public interface IMessageBoard {

    MessageBoardListResponse listByPage(SplitPageRequest splitPageRequest);

    boolean add(MessageBoardModel messageBoardModel) throws Exception;

}
