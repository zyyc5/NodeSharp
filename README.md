## Nodejs与C#之间进行跨进程通信方案

原理详见 [NodeSharp](http://blog.qicheen.com/archives/14)
主要是利用 NodeJs的child_process模块和C#中的标准输入输出，理论上来说，只要实现方案中C#部分对标准输入输出的封装，可支持任何语言及操作系统
### 使用方法

分为两个部分，Nodejs和C#
# Nodejs


```markdown
var childprocess=require('./ChildProcess');

//正常启动一个exe
// var exeservice=new childprocess('./exe/NodeSharpTest.exe');
// console.log(exeservice);


//高级启动
// var defaultOpt = {
//         exe: '',//exe 路径
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

```
# C#

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

