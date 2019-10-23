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