'use strict';
const child_process = require("child_process")
const iconv = require('iconv-lite');
const extend = require('util')._extend;
const EventEmitter = require('events').EventEmitter;
const path = require('path');

let S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

let guid = () => {
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
};

let getparam = (obj) => {
    return {
        cguid: guid(),
        data: obj
    }
};

/**
 * 
 */
class NodeSharp extends EventEmitter {
    constructor(option) {
        super();
        this.childprocess = null;
        this.onceListenters = {};
        this.alawysListenters = {};
        this.cachedata = "";
        this._needReOpen = false;
        this.opt = {};

        let defaultOpt = {
            exePath: '',
            autoReOpen: false,
            args: [],
            dataListener: null,
            errorListener: null
        };

        if (typeof option == 'string') {
            defaultOpt.exePath = option;
            this.opt = defaultOpt;
        } else {
            this.opt = extend(defaultOpt, option);
        }
        // this.opt.args = ['pos'].concat(this.opt.args);
        if (this.opt.dataListener) {
            this.on('data', dataListener)
        }
        if (this.opt.errorListener) {
            this.on('error', errorListener)
        }
    }

    /**
     * start a exe and connect
     * @param {*} option exePath OR {exePath，autoReOpen，args, dataListener, errorListener }
     */
    static connect(option) {
        let exe = new this(option)
        exe.open();
        return exe;
    }



    open() {
        let exec = child_process.spawn;
        let exepath = path.resolve(__dirname, this.opt.exePath);
        this.childprocess = exec(exepath, this.opt.args);
        this.childprocess.stdin.setEncoding("binary");
        this.childprocess.stdout.setEncoding("binary");
        if (this.childprocess == null && this.opt.closeCallback)
            this.opt.closeCallback(-1);
        this.childprocess.on('exit', (code, signal) => {
            if ((this.opt.autoReOpen && signal !== 'SIGTERM') || this._needReOpen)
                setTimeout(function () {
                    this.open();
                    this.emit('reopen', this);
                }.bind(this), 1000);
            this._needReOpen = false;
            this.emit('close', code, this.trueClose);
        });

        this.childprocess.stdout.on('data', (data) => {
            this.emit('message', data);
            let json = '';
            try {
                json = data.toString();
                if (json.endsWith('\r\n'))
                    json = json.substr(0, json.length - 1);
                json = this.cachedata + json;
                this.cachedata = "";
                let resultdatas = json.split('@=@');
                for (let j in resultdatas) {
                    if (resultdatas.length == 1) {
                        this.cachedata += resultdatas[j];
                        continue;
                    }
                    if (j == (resultdatas.length - 1) && resultdatas[j] != '') {
                        this.cachedata += resultdatas[j];
                        continue;
                    }
                    let jsondata = "";
                    try {
                        jsondata = JSON.parse(resultdatas[j]);
                    } catch (ee) {
                        this.cachedata += resultdatas[j];
                        continue;
                    }
                    if (this.onceListenters[jsondata.cguid]) {
                        this.onceListenters[jsondata.cguid](jsondata.Error, jsondata.data);
                        delete this.onceListenters[jsondata.cguid];
                    }
                    if (this.alawysListenters[jsondata.cguid]) {
                        this.alawysListenters[jsondata.cguid](jsondata.Error, jsondata.data);
                    }
                    this.emit('data', jsondata.Error, jsondata.data);
                }
            } catch (e) {
                this.emit('error', e);
            }
        });
        this.childprocess.stdout.on('error', e => {
            console.error(e)
            this.emit('error', e)
        })
        this.childprocess.stdin.on('error', e => {
            console.error(e)
            this.emit('error', e)
        })
    };

    close() {
        this._needReOpen = false;
        if (!this.childprocess.killed)
            this.childprocess.kill('SIGTERM');
    };

    reOpen() {
        this._needReOpen = true;
        if (!this.childprocess.killed)
            return this.childprocess.kill();
        this.open();
    }

    send({
        param,
        oncecb,
        alawyscb
    }) {
        if (!this.childprocess && oncecb)
            return oncecb('The required process has not started');
        if (!this.childprocess.stdin.writable && oncecb)
            return oncecb('Unable to establish channel connection');
        if (!this.childprocess && alawyscb)
            return alawyscb('The required process has not started');
        if (!this.childprocess.stdin.writable && alawyscb)
            return alawyscb('Unable to establish channel connection');
        param = getparam(param);
        //console.log(JSON.stringify(data));
        if (oncecb)
            this.onceListenters[param.cguid] = oncecb;
        if (alawyscb)
            this.alawysListenters[param.cguid] = alawyscb;
        let senddata = iconv.encode(JSON.stringify(param) + "\r\n", 'gbk');
        this.childprocess.stdin.write(senddata);
    };
}

module.exports = NodeSharp;