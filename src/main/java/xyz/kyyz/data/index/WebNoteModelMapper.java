package xyz.kyyz.data.index;

import xyz.kyyz.data.ContentDB;
import xyz.kyyz.model.index.WebNoteModel;

import java.util.List;

@ContentDB
public interface WebNoteModelMapper {
    int deleteByPrimaryKey(Integer id);

    int insert(WebNoteModel record);

    int insertSelective(WebNoteModel record);

    WebNoteModel selectByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(WebNoteModel record);

    int updateByPrimaryKeyWithBLOBs(WebNoteModel record);

    int updateByPrimaryKey(WebNoteModel record);


    List<WebNoteModel> selectByPage();
}