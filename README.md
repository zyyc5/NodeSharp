## Nodejs与C#之间进行跨进程通信方案

原理详见 [NodeSharp](http://blog.qicheen.com/archives/14)
主要是利用 NodeJs的child_process模块和C#中的标准输入输出，理论上来说，只要实现方案中C#部分对标准输入输出的封装，可支持任何语言及操作系统
### 使用方法

分为两个部分，Nodejs和C#
# Nodejs


```markdown
'use strict';
const nodesharp = require('./nodesharp');


let start = () => {

	// var exeservice=new nodesharp('./exe/NodeSharpTest.exe');

	// var defaultOpt = {
	// 	exePath: 'NYSProcess.exe', 
	// 	autoReOpen: false, 
	// 	args: [], 
	// 	dataListener: (err, data) => {},
	// 	errorListener: (err, data) => {}
	// };

	let exeservice = nodesharp.connect({
		exePath: './exe/NodeSharpTest.exe',
		autoReOpen: true,
		args: []
	});
	return exeservice;
}

let onceCallBackTest = (exe) => {
	//Exe has run a communication object that must be formatted as a json string and must have a command field
	let onceparam = {
		command: 'once',
		data: "demo-----------"
	};

	exe.send({
		param: onceparam,
		oncecb: (err, data) => {
			console.log(data);
		}
	});

}


let alwaysCallBackTest = (exe) => {

	let alwaysparam = {
		command: 'always',
		data: {
			demo: "long time data"
		}
	};

	exe.send({
		param: alwaysparam,
		alawyscb: (err, data) => {
			if (err)
				return console.error(err);
			console.log(data);
		}
	});
}


let stop = (exe) => {
	console.log('close exe')
	exe.close();
}

let exe = start();
alwaysCallBackTest(exe);
onceCallBackTest(exe);

// -----------------events-----------------

exe.on('close', (exitCode, realClose) => {
	console.log('close', exitCode, realClose)
})
exe.on('reopen', (exeInstance) => {
	console.log('reopen', exeInstance)
})
// exe.on('message', (message) => { // Raw Data
// 	console.log('message', message)
// })
// exe.on('data', (err, data) => { // formatted data
// 	console.log(data);
// })
exe.on('error', (error) => {
	console.log(error);
})
// -----------------end events-----------------


setTimeout(() => {
	stop(exe);
	exe.reOpen();
	setTimeout(() => {
		alwaysCallBackTest(exe);
	}, 1000)
}, 6000)

```
# CSharp
```markdown

新建项目，可以是控制台应用，也可以是winform，或者是WPF，总之只要能引用 NodeSharpLib 这个dll就行
在项目运行后，调用NodeSharpLib里的方法，即可监听Nodejs的调用，一般放在项目的 Main方法里

static void Main(string[] args)
        {
            NodeSharp.Start((nodeparam)=> {
                RPCHandle rpc = nodeparam.GetRPCHandle();

                //一般性的单次任务
                if (nodeparam.command=="once")
                {
                    rpc.Send("once test"+nodeparam["data"]);
                }

                //长时间的监听任务
                if (nodeparam.command == "always")
                {
                    Task.Factory.StartNew(()=> {
                        while(true)
                        {
                            System.Threading.Thread.Sleep(3000);
                            try
                            {
                                dynamic param = nodeparam["data"];
                                var obj = new { date = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"), param = param.ToString(), demo = param["demo"] };
                                rpc.Send(obj);
                            }
                            catch (Exception e) {
                                rpc.SendWithError(e.ToString());
                            }
                        }
                    });
                }

            });
        }

```
### 效果图
![image](https://github.com/zyyc5/NodeSharp/blob/master/screen_shot.png)
