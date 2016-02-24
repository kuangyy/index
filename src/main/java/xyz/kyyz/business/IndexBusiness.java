package xyz.kyyz.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.kyyz.data.index.WebNoteModelMapper;
import xyz.kyyz.ibusiness.IIndex;
import xyz.kyyz.model.index.WebNoteModel;

import java.util.List;

/**
 * Created by 野 on 2015/12/25.
 */
@Service
public class IndexBusiness implements IIndex {

    @Autowired
    WebNoteModelMapper webNoteModelMapper;

   public List<WebNoteModel> select(){


       return webNoteModelMapper.selectByPage();
   }
}
