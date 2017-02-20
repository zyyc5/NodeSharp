using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JsonFx;
using JsonFx.Json;
using System.Collections.Concurrent;
using System.Data;

namespace NodeSharpLib.util
{
    public class jsonutil
    {
        static JsonReader reader = new JsonReader();
        static JsonWriter writer = new JsonWriter();
        public static string Serialize(object obj) {
            try
            {
                return writer.Write(obj);
            }
            catch (Exception e) {
                return null;
            }
           
        }

        public static dynamic DeserializeObject(string json)
        {
            return ToObjectDictionary<dynamic>(json);
        }

        public static List<Dictionary<string,object>> DeserializeList(string jsonString)
        {
            if (object.Equals(jsonString, null))
                return null;
            System.Web.Script.Serialization.JavaScriptSerializer jserizor = new System.Web.Script.Serialization.JavaScriptSerializer();
            jserizor.MaxJsonLength = 10240000;
            return jserizor.Deserialize<List<Dictionary<string, object>>>(jsonString);
        }

        public static Dictionary<string, T> ToObjectDictionary<T>(string jsonString)
        {
            if (object.Equals(jsonString, null))
                return null;
            System.Web.Script.Serialization.JavaScriptSerializer jserizor = new System.Web.Script.Serialization.JavaScriptSerializer();
            jserizor.MaxJsonLength = 10240000;
            return jserizor.Deserialize<Dictionary<string, T>>(jsonString);
        }

        public static List<Dictionary<string, object>> DataSet2Object(DataSet dataset)
        {
            List<Dictionary<string, object>> list = new List<Dictionary<string, object>>();
            
            if(dataset.Tables.Count>0&& dataset.Tables[0].Rows.Count>0)
            {
                foreach(DataRow row in dataset.Tables[0].Rows)
                {
                    Dictionary<string, object> obj = new Dictionary<string, object>();
                    foreach(DataColumn col in dataset.Tables[0].Columns)
                    {
                        obj[col.ColumnName] = row[col];
                    }
                    list.Add(obj);
                }
            }

            return list;
        }
    }

    

   

    public class SqlResult
    {
        dynamic _data;
        public dynamic row
        {
            get { return _data; }
            set {
                this.rowsAffected = value.Count;
                this._data = value;
            }
        }

        public int rowsAffected { get; set; }

        public string error;
    }


}
