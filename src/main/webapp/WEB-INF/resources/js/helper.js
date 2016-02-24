(function(){
	window.ymbApp = new ymframework({ });
	window.parsleyAlert=ymbApp.alertTip;
    window.extension = {
    	alert : function(msg, f) {
    		ymbApp.alert(msg,"移民帮",f);
    		

    	},
    	tip : function(msg){
    		ymbApp.alertTip(msg);
    	},
    	showloading : function(){
    		ymbApp.showIndicator();
    	},
    	hideloading :function(){
    		ymbApp.hideIndicator();
    	}
    };
    
    window.alertify={
    		showBox:function(message){
    			ymbApp.alertTip(message)
    		}
    	};
     

    Date.prototype.Format = function(fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
    
    $.ajaxSettings.timeout = 10000;
    $.ajaxSettings.beforeSend =  extension.showloading;
    $.ajaxSettings.complete = extension.hideloading;
  

})();
(function(){
    var cache = {};
    this.tmpl = function tmpl(str, data){
    var fn = !/\W/.test(str) ?
        cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
        new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        "with(obj){p.push('" +
        str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'")
        + "');}return p.join('');");
    return data ? fn( data ) : fn;
    };
    //获取url参数
    this.requestParams= function getrequest() {
 
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
    }
})();



