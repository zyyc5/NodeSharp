var childProcess = function (option, messageCallback, errorCallback) {
    this.childprocess = null;
    this.onceListenters = {};
    this.alawysListenters = {};
    this.cachedata = "";
    this.alwaysListenter = null;
    this.errorListenter = null;
    this.trueClose = false;
    var me = this;
    var iconv = require('iconv-lite');

    var defaultOpt = {
        exe: 'NYSProcess.exe',
        closeCallback: function (exitcode) { },
        autoReOpen: false,
        args: []
    };
    var opt = null;
    if (typeof option == 'string') {
        defaultOpt.exe = option;
        opt = defaultOpt;
    }
    else {
        var extend =require('util')._extend;
        opt = extend( defaultOpt, option);
        // console.log(opt);
    }
    opt.args = ['pos'].concat(opt.args);

    this.guid = function() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    };

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    var getparam = function (obj) { return { cguid: me.guid(), data: obj } };

    this.open = function () {
        var exec = require("child_process").spawn;
        //var path = require('path');
        //var nwPath = process.execPath;
        //var nwDir = path.dirname(nwPath);
        
        //me.childprocess = exec(nwDir + "/" + opt.exe, opt.args);
        me.childprocess = exec(opt.exe, opt.args);
        me.childprocess.stdin.setEncoding("binary");
        me.childprocess.stdout.setEncoding("binary");
        if (me.childprocess == null)
            if (opt.closeCallback)
                opt.closeCallback(-1);
        me.childprocess.on('exit', function (code) {
            if (opt.autoReOpen && code != 0 && !me.trueClose)
               setTimeout(function () {
                    me.open();
                    console.log('reopen' + opt.exe, !!me.childprocess);
                }, 2000);
            if (opt.closeCallback)
                opt.closeCallback(code);
        });

        me.childprocess.stdout.on('data', function (data) {
            //console.log('' + data);
            var result = null;
            var json = '';
            try {

                json = data.toString();

                if (endsWith(json,'\r\n'))
                    json = json.substr(0, json.length - 1);
                json = me.cachedata + json;
                me.cachedata = "";
                var resultdatas = json.split('@=@');
                for (var j in resultdatas) {
                    if (resultdatas.length == 1)
                    {
                        me.cachedata += resultdatas[j];
                        continue;
                    }
                    if (j == (resultdatas.length - 1) && resultdatas[j]!='')
                    {
                        me.cachedata += resultdatas[j];
                        continue;
                    }
                        
                    var jsondata = "";
                    try {
                        var jsondata = JSON.parse(resultdatas[j]);
                        
                    } catch (ee) {
                        me.cachedata += resultdatas[j];
                        //console.error(resultdatas[j]);
                        continue;
                    }
                    if (me.onceListenters[jsondata.cguid]) {
                        me.onceListenters[jsondata.cguid](jsondata.Error, jsondata.data);
                        delete me.onceListenters[jsondata.cguid];
                    }

                    if (me.alawysListenters[jsondata.cguid]) {
                        me.alawysListenters[jsondata.cguid](jsondata.Error, jsondata.data);
                    }

                    if (me.alwaysListenter)
                        me.alwaysListenter(jsondata.data, jsondata.Error);
                    if (me.errorListenter && jsondata.Error && jsondata.Error.length > 2)
                        me.errorListenter(jsondata.Error);

                }
            } catch (e) {
                if (me.errorListenter)
                    me.errorListenter(e.message);
                console.error(e);
                //console.error(json);
            }
        });
    };

    this.close = function (close) {
        me.trueClose = !!close;
        me.childprocess.kill();
    };

    this.send = function (data, oncecb,alawyscb) {
        if (!me.childprocess && oncecb)
            return oncecb('所需进程尚未启动');
        if (!me.childprocess.stdin.writable && oncecb)
            return oncecb('无法建立通道连接');
        var data = getparam(data);
        //console.log(JSON.stringify(data));
        if (oncecb)
            me.onceListenters[data.cguid] = oncecb;
        if (alawyscb)
            me.alawysListenters[data.cguid] = alawyscb;
        var senddata = iconv.encode(JSON.stringify(data)+"\r\n", 'gbk');
        me.childprocess.stdin.write(senddata );
    };

    me.alwaysListenter = messageCallback;
    me.errorListenter = errorCallback;
    me.open();
};
module.exports = childProcess;