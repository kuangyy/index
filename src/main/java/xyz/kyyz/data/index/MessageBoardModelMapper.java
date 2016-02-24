package xyz.kyyz.data.index;

import org.apache.ibatis.annotations.Param;
import xyz.kyyz.data.ContentDB;
import xyz.kyyz.model.index.MessageBoardModel;

import java.util.List;

@ContentDB
public interface MessageBoardModelMapper {
    int deleteByPrimaryKey(Integer id);

    int insert(MessageBoardModel record);

    int insertSelective(MessageBoardModel record);

    MessageBoardModel selectByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(MessageBoardModel record);

    int updateByPrimaryKeyWithBLOBs(MessageBoardModel record);

    int updateByPrimaryKey(MessageBoardModel record);

    List<MessageBoardModel> select(@Param("rowStart") Integer rowStart, @Param("rowCount") Integer rowCount);

    int count();

}