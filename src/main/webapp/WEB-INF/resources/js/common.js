/**
 * Created by 野 on 2015/12/5.
 */


var requestParams = function getrequest() {

    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
        }
    }
    return theRequest;
};


var resgister = {
    el: $("#resgister"),
    data: {},
    selector: {
        btnCommit: '#commit',
    },
    events: function () {
        this.el.on("click", this.selector.btnCommit, this.eventsCallBack.resgister);
    },
    eventsCallBack: {
        resgister: function () {
            if (resgister.validate()) {
                $.post($$.basePath+'/user/register', resgister.el.serialize(),
                    function (response) {
                        if (response) {
                            if (response.success) {
                                if (response.backUrl) {
                                    window.location.href = decodeURIComponent(response.backUrl);
                                }
                                else if (requestParams() && requestParams().backurl) {
                                    window.location.href = decodeURIComponent(requestParams().backurl);
                                }
                                else {
                                    window.location.href = decodeURIComponent($$.basePath+'/user/index');
                                }

                            } else {
                                ymbApp.alertTip(response.msg);
                            }
                        } else {
                            ymbApp.alertTip('服务器无响应');
                        }
                    });
            }
        },
    }, validate: function () {
        var username = $('input[name=username]').val();
        var password = $('input[name=password]').val();
        var password_chk = $('input[name=password_chk]').val();
        var name = $('input[name=name]').val();

        var reg = /^[a-zA-Z0-9]+$/;
        if ($.trim(username) == '') {
            ymbApp.alertTip('请填写账号');
            return false;
        }
        if (!reg.test(username)) {
            ymbApp.alertTip('请输入字母或数字');
            return false;
        }
        if ($.trim(password) == '') {
            ymbApp.alertTip('请填写密码');
            return false;
        }
        if (password!=password_chk) {
            ymbApp.alertTip('两次输入密码不同');
            return false;
        }
        if ($.trim(name) == '') {
            ymbApp.alertTip('请填写姓名');
            return false;
        }
        return true;
    },
    init: function () {
        this.events();
    }
};