
namespace NodeSharpLib
{
    public class NodeParam
    {
        private readonly BJSONObject _json;

        public NodeParam(string param)
        {
            this._json = new BJSONObject(param);
        }
        public string Pid {
            get {
                return _json["pid"];
            }
        }

        public string Command {
            get {
                return _json["data"]["command"];
            }
        }

        public object this[string key]
        {
           get
            {
                return _json["data"][key];
            }
        }

        public RPCHandle GetRPCHandle()
        {
            return new RPCHandle(this.Pid);
        }
    }
}
