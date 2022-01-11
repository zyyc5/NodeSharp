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
                if (nodeparam.Command=="once")
                {
                    rpc.Send("once test"+nodeparam["data"]);
                }

                //长时间的监听任务
                else if (nodeparam.Command == "always")
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
                } else
                {
                    rpc.Send("Not Supported Command: " + nodeparam.Command);
                }

            });
        }



        //{"pid":"c2e713166d13156a4d8e2ce8d10680ee","data":{"command":"FormTest","path":"D:\\gittest\\test"}}
        //{"pid":"c2e713166d13156a4d8e2ce8d10680ee","data":{"command":"FormTest","path":"D:\\gittest\\test"}}
    }
}
