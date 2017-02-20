
namespace NodeSharpLib
{
    public class NodeParam
    {
        BJSONObject _json;

        public NodeParam(string param)
        {
            this._json = new BJSONObject(param);
        }
        public string cid {
            get {
                return _json["cguid"];
            }
        }

        public string command {
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
            return new RPCHandle(this.cid);
        }
    }
}
