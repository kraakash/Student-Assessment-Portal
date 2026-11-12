import { useState } from "react";
import { useNavigate } from "react-router";


function Login(){

    const navigate = useNavigate();
    const  [form, setForm] = useState({
        email:"",
        password:""
    })


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>{
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
             const response  = await api.post("/auth/login" , form);
             console.log("Login Successful", response.data);
             navigate("/dashboard");
        }catch(err){
            setError(
                err.resoponse?.data?.messaage|| "Login Failed , Please try again"
            );
        }finally{
            setLoading(false);
        }

    }
    
    return(
           
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h1 className="text-2xl font-bold text-center">
          Student Assessment Portal
        </h1>

        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg mt-6"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg mt-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg mt-5 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
    )
}
export default Login;