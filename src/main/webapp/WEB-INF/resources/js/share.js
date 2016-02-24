/**
 * Created by kuangye on 2015/11/18.
 */

$(document).ready(function(){

    var addShare = {
        el: $("form"),
        data: {articleId:"",contact:[],view:""},
        events: function() {
            $(".tab-item.friend").on("click", addShare.eventsCallBack.friend),
                $(".tab-item.group").on("click",  addShare.eventsCallBack.group)
        },
        scene:"",
        eventsCallBack: {
            friend: function() {
                addShare.scene=Wechat.Scene.SESSION;
                addShare.eventsCallBack.commit();
            },
            group: function() {
                addShare.scene=Wechat.Scene.TIMELINE;
                addShare.eventsCallBack.commit();
            },
            commit:function(){
                if (addShare.validate()) {
                    $("#commit").attr("disabled",true);
                    $.post($$.basePath+'/home/addShare', addShare.el.serialize(),
                        function(response) {
                            if (response!=null){
                                if(response.head.statusCode==0){
                                    //var coverurl = $("#coverurl").attr("src");
                                    Wechat.share({
                                        message: {
                                            title: $("#title").text(),
                                            description: description,
                                            thumb: coverUrl+"@100h_100w_0e",
                                            media: {
                                                type: Wechat.Type.WEBPAGE,
                                                webpageUrl: response.body+'#mp.weixin.qq.com'
                                            }
                                        },
                                        scene: addShare.scene
                                    }, function () {
                                      window.location.href= $$.basePath+'/home/index';
                                    }, function (reason) {
                                        addShare.alertMsg("分享失败");
                                    });

                                }else{
                                    addShare.alertMsg(response.head.note);
                                }
                            }else {
                                addShare.alertMsg('服务器无响应');
                            }
                        });
                }
            }

        },
        validate:function(){
            var left_checked = $("input[name='tel']").attr("checked");
            var right_checked = $("input[name='qrCode']").attr("checked");
            if(!left_checked&&!right_checked){
                ymbApp.alertTip("请至少选择一种联系方式");
                window.location.href="#contectselect";
                return false;
            }
            return true;
        },
        alertMsg:function(msg){
            ymbApp.alertTip(msg);
        },
        init: function() {
            this.events();
            //预览显示
            $(".tab-item.preview").click(function(){
                view = $("#property").val();
                $("input[name='view']").val(view);
                $("#preview_porperty").html(view);
                left_checked = $("input[name='tel']").attr("checked");
                right_checked = $("input[name='qrCode']").attr("checked");

                if(left_checked || right_checked){
                    if(left_checked){
                        $(".p-mask .column-l").show();
                    }else{
                        $(".p-mask .column-l").hide();
                    }
                    if(right_checked){
                        $(".p-mask .column-r").show();
                    }else{
                        $(".p-mask .column-r").hide();
                    }

                    $(".p-mask").show();
                }else{
                    window.location.href="#contectselect";
                    ymbApp.alertTip("请至少选择一种联系方式");
                }
                if(view==''){
                    $("#myThought").hide();
                }else{
                    $("#myThought").show();
                }
            });
            //关闭预览
            $(".close").click(function(){
                $(".p-mask").hide();
            });
            //未填写提示
            $(".list-block").on("click",".label-checkbox",function(){
                var str="";
                if($(this).children("input[name='tel'][disabled]").length>0){
                    str="联系方式";
                }else if($(this).children("input[name='qrCode'][disabled]").length>0){
                    str="二维码";
                }
                if(str!=''){
                    ymbApp.alertTip("请添加"+str);
                }
            });
        }
    };
    addShare.init();
});