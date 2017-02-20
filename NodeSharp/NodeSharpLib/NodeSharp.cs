using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NodeSharpLib
{
    public class NodeSharp
    {
        public static void  Start(Action<NodeParam> action)
        {
            while (true)
            {
                var ch = Console.ReadLine();
                if (string.IsNullOrEmpty(ch))
                {
                    System.Threading.Thread.Sleep(100);
                    continue;
                }
                try
                {
                    doWork(ch, action);
                }
                catch(Exception ee) {
                    new RPCHandle("", ee.Message).Send();
                }
            }
        }

        static void doWork(string json, Action<NodeParam> action)
        {
            NodeParam param = new NodeParam(json);
            action(param);
        }
    }
}
