'use strict';
const child_process = require("child_process")
const iconv = require('iconv-lite');
const extend = require('util')._extend;
const path = require('path');

let S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

let guid = () => {
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
};

let NodeSharp = function (option, messageCallback, errorCallback) {
    this.childprocess = null;
    this.onceListenters = {};
    this.alawysListenters = {};
    this.cachedata = "";
    this.alwaysListenter = null;
    this.errorListenter = null;
    this.trueClose = false;
    let me = this;

    let defaultOpt = {
        exe: 'NYSProcess.exe',
        closeCallback: function (exitcode) {},
        autoReOpen: false,
        args: []
    };

    let opt = null;
    if (typeof option == 'string') {
        defaultOpt.exe = option;
        opt = defaultOpt;
    } else {
        opt = extend(defaultOpt, option);
    }
    opt.args = ['pos'].concat(opt.args);


    let getparam = function (obj) {
        return {
            cguid: guid(),
            data: obj
        }
    };

    this.open = function () {
        let exec = child_process.spawn;
        let exepath = path.resolve(__dirname, opt.exe);
        me.childprocess = exec(exepath, opt.args);
        me.childprocess.stdin.setEncoding("binary");
        me.childprocess.stdout.setEncoding("binary");
        if (me.childprocess == null && opt.closeCallback)
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
            let json = '';
            try {
                json = data.toString();
                if (json.endsWith('\r\n'))
                    json = json.substr(0, json.length - 1);
                json = me.cachedata + json;
                me.cachedata = "";
                var resultdatas = json.split('@=@');
                for (var j in resultdatas) {
                    if (resultdatas.length == 1) {
                        me.cachedata += resultdatas[j];
                        continue;
                    }
                    if (j == (resultdatas.length - 1) && resultdatas[j] != '') {
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
        me.childprocess.stdout.on('error', e => {
            console.error(e)
            errorCallback(e)
        })
        me.childprocess.stdin.on('error', e => {
            console.error(e)
            errorCallback(e)
        })
    };

    this.close = function (close) {
        me.trueClose = !!close;
        me.childprocess.kill();
    };

    this.send = function ({
        param,
        oncecb,
        alawyscb
    }) {
        if (!me.childprocess && oncecb)
            return oncecb('所需进程尚未启动');
        if (!me.childprocess.stdin.writable && oncecb)
            return oncecb('无法建立通道连接');
        if (!me.childprocess && alawyscb)
            return alawyscb('所需进程尚未启动');
        if (!me.childprocess.stdin.writable && alawyscb)
            return alawyscb('无法建立通道连接');
        param = getparam(param);
        //console.log(JSON.stringify(data));
        if (oncecb)
            me.onceListenters[param.cguid] = oncecb;
        if (alawyscb)
            me.alawysListenters[param.cguid] = alawyscb;
        let senddata = iconv.encode(JSON.stringify(param) + "\r\n", 'gbk');
        me.childprocess.stdin.write(senddata);
    };

    me.alwaysListenter = messageCallback;
    me.errorListenter = errorCallback;
    me.open();
};
module.exports = NodeSharp;