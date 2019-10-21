'use strict';
const childprocess = require('./ChildProcess');


let start = () => {
	//正常启动一个exe
	// var exeservice=new childprocess('./exe/NodeSharpTest.exe');
	// console.log(exeservice);


	//高级启动
	// var defaultOpt = {
	//         exe: 'NYSProcess.exe',//exe 路径
	//         closeCallback: function (exitcode) { },//exe退出的回调
	//         autoReOpen: false,//是否自动启动（如exe异常终止后可以自动重启）
	//         args: []//给exe的启动参数
	//     };

	let exeservice = new childprocess({
		exe: './exe/NodeSharpTest.exe',
		autoReOpen: true,
		args: []
	}, function (data) {
		//这里可以获取到exe的所有正常返回
		// console.log(data);
	}, function (error) {
		//这里可以获取到exe的所有异常（业务上抛出的异常信息）
		// console.log(error);
	});
	return exeservice;
}

// 一次性的回调，执行后即被回收
let onceCallBackTest = (exe) => {
	//exe已经运行时的 通信对象，要求是必须可以格式化为json字符串，而且必须有command字段
	let onceparam = {
		command: 'once',
		data: "demo"
	};

	exe.send({
		param: onceparam,
		oncecb: (err, data) => {
			console.log(data);
		}
	});

}

/**
 * 监听性的回调，创建后可伴随exe整个生命周期
 */
let alwaysCallBackTest = (exe) => {

	let alwaysparam = {
		command: 'always',
		data: {
			demo: "this is demo date"
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
	exe.close(true); //强制退出，不传true的话，如果exe设置成了自动重启，那么还是会重启
}

let exe = start();

alwaysCallBackTest(exe);
onceCallBackTest(exe);
setTimeout(() => {
	stop(exe);
}, 30000)