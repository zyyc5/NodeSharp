using NodeSharpLib;
using System;
using System.Threading.Tasks;

namespace NodeSharpTest
{
    class Program
    {
        static void Main(string[] args)
        {
            NodeSharp.Start((nodeparam)=> {
                RPCHandle rpc = nodeparam.GetRPCHandle();

                //一般性的单次任务
                if (nodeparam.command=="once")
                {
                    rpc.Send("once test");
                }

                //监听任务
                if (nodeparam.command == "always")
                {
                    Task.Factory.StartNew(()=> {
                        while(true)
                        {
                            rpc.Send(DateTime.Now);
                            System.Threading.Thread.Sleep(3000);
                        }
                    });
                }

            });
        }
    }
}
