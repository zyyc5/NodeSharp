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
    return (S4() + S4() + S4() + S4());
};


/**
 * 
 */
class NodeSharp extends EventEmitter {
    constructor(option) {
        super();
        this.childprocess = null;
        this.onceListenters = {};
        this.onListenters = {};
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

                let jsondata = "";
                try {
                    jsondata = JSON.parse(json);
                } catch (_ee) {
                    return
                }
                if (this.onceListenters[jsondata.Pid]) {
                    this.onceListenters[jsondata.Pid](jsondata.Error, jsondata.Data);
                    delete this.onceListenters[jsondata.Pid];
                }
                if (this.onListenters[jsondata.Pid]) {
                    this.onListenters[jsondata.Pid](jsondata.Error, jsondata.Data);
                }
                this.emit('data', jsondata.Error, jsondata.Data);

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
        if (!this.childprocess.killed) {
            this.childprocess.kill('SIGTERM');
        }
    };

    reOpen() {
        this._needReOpen = true;
        if (!this.childprocess.killed) {
            return this.childprocess.kill();
        }
        this.open();
    }

    buildParam(obj) {
        return {
            pid: guid(),
            data: obj
        }
    }

    send({
        param,
        once,
        on
    }) {
        if (!this.childprocess && (once || on))
            return (once || on)('The required process has not started');
        if (!this.childprocess.stdin.writable && (once || on))
            return (once || on)('Unable to establish channel connection');
        param = this.buildParam(param);
        if (once) {
            this.onceListenters[param.pid] = once;
        }
        if (on) {
            this.onListenters[param.pid] = on;
        }
        let senddata = iconv.encode(JSON.stringify(param) + "\r\n", 'gbk');
        this.childprocess.stdin.write(senddata);
    };
}

module.exports = NodeSharp;