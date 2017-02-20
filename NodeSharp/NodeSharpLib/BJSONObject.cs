using NodeSharpLib.util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NodeSharpLib
{
    public class BJSONObject : System.Dynamic.DynamicObject
    {
        private Dictionary<string, object> _dict = new Dictionary<string, object>();

        public BJSONObject(string jsonstr)
        {
            this._dict = jsonutil.DeserializeObject(jsonstr);
            Dict2BJsonObj(this._dict);
        }

        public BJSONObject()
        {

        }

        public BJSONObject(Dictionary<string, object> dic)
        {
            this._dict = dic;
            Dict2BJsonObj(this._dict);
        }

        void Dict2BJsonObj(Dictionary<string, object> dic)
        {
            var keys = dic.Keys.ToArray();
            for (int i = 0; i < dic.Keys.Count(); i++)
            {
                var key = keys[i];
                if (dic[key] is Dictionary<string, object>)
                    dic[key] = new BJSONObject(dic[key] as Dictionary<string, object>);
            }

        }

        public dynamic this[string key]
        {
            get
            {
                return _dict[key];
            }
            set
            {
                if (_dict.ContainsKey(key))
                    _dict[key] = value;
                else
                    _dict.Add(key, value);
            }
        }

        public override bool TryGetMember(System.Dynamic.GetMemberBinder binder, out object result)
        {
            result = null;
            if (_dict.ContainsKey(binder.Name))
            {
                result = _dict[binder.Name];
                return true;
            }
            return false;
        }

        public override bool TrySetMember(System.Dynamic.SetMemberBinder binder, object value)
        {
            if (_dict.ContainsKey(binder.Name))
                _dict[binder.Name] = value;
            else
                _dict.Add(binder.Name, value);
            return true;
        }

        public Dictionary<string, object> GetProperties()
        {
            return _dict;
        }

        public bool HasProto(string key)
        {
            return this._dict.Keys.Contains(key);
        }

        public override string ToString()
        {
            return jsonutil.Serialize(this);
        }
    }

}
