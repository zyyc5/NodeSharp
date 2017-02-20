using NodeSharpLib.util;
using System;

namespace NodeSharpLib
{
    public class RPCHandle
    {
        public RPCHandle(string cguid)
        {
            this.cguid = cguid;
        }

        public RPCHandle(string cguid, string error)
        {
            this.cguid = cguid;
            this.Error = error;
        }

        public string cguid { get; set; }

        public dynamic data { get; set; }

        public string Error { get; set; }

        override
        public string ToString()
        {
            return jsonutil.Serialize(this);
        }

        public void Send(object data=null,string error=null)
        {
            if (data != null)
                this.data = data;
            if (!string.IsNullOrEmpty(error))
                this.Error = error;

            var filterchar = "@=@";
            Console.WriteLine(this.ToString().Replace("\r\n", "").Replace("\n", "") + filterchar);
        }

        public void SendWithError(string error)
        {
            this.Send(null, error);
        }
    }

}
