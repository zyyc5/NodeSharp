using NodeSharpLib.util;
using System;

namespace NodeSharpLib
{
    public class RPCHandle
    {
        public RPCHandle(string Pid)
        {
            this.Pid = Pid;
        }

        public RPCHandle(string Pid, string error)
        {
            this.Pid = Pid;
            this.Error = error;
        }

        public string Pid { get; set; }

        public dynamic Data { get; set; }

        public string Error { get; set; }

        override
        public string ToString()
        {
            return JsonUtil.Serialize(this);
        }

        public void Send(object data=null,string error=null)
        {
            if (data != null)
            {
                this.Data = data;
            }
            if (!string.IsNullOrEmpty(error))
            {
                this.Error = error;
            }
            
            Console.WriteLine(this.ToString());
        }

        public void SendWithError(string error)
        {
            this.Send(null, error);
        }
    }

}
