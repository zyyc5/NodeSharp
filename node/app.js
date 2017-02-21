
var childprocess=require('./ChildProcess');

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

var exeservice=new childprocess({exe:'./exe/NodeSharpTest.exe', autoReOpen: true,args:[]},function(data){
//这里可以获取到exe的所有正常返回
// console.log(data);
},function(error){
//这里可以获取到exe的所有异常（业务上抛出的异常信息）
// console.log(error);
});

//exe已经运行时的 通信对象，要求是必须可以格式化为json字符串，而且必须有command字段
var onceparam={command:'once',data:"demo"};
// 一次性的回调，执行后即被回收
var oncefun=function(err,data){console.log(data);};

var alwaysparam={command:'always',data:{demo:"this is demo date"}};

// 监听性的回调，创建后可伴随exe整个生命周期
var alwaysfun=function(err,data){
	if(err)
		return console.error(err);
	console.log(data);
};
exeservice.send(onceparam,oncefun);
exeservice.send(alwaysparam,function(){},alwaysfun);
// console.log(exeservice);
//exeservice.close(true);//强制退出，不传true的话，如果exe设置成了自动重启，那么还是会重启