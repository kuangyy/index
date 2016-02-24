package xyz.kyyz.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import xyz.kyyz.ibusiness.IIndex;
import xyz.kyyz.model.index.WebNoteModel;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * Created by 野 on 2015/12/25.
 */

@RequestMapping("/index")
@Controller
public class IndexController extends BaseController {

    @Autowired
   private IIndex iIndex;

    @RequestMapping(value = "/list",method = RequestMethod.GET)
    public
    @ResponseBody List<WebNoteModel>
    noteList(HttpServletRequest request, HttpServletResponse response){

        return iIndex.select();
    }

}
