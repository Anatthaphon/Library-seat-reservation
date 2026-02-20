import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Auth.css";

export default function Login(){

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const login=async(e)=>{
    e.preventDefault();

    const res=await fetch("http://localhost:3001/api/auth/login",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({email,password})
    });

    const data=await res.json();

    if(data.token){
      localStorage.setItem("token",data.token);
      localStorage.setItem("user",JSON.stringify(data.user));
      alert("Login success");
      window.location="/reserve";
    }
    else{
      alert(data.message || data.error);
    }
  };

  return(
    <div className="auth-container">
      <div className="auth-card">

        <h2>Login</h2>

        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />

          <button className="btn-primary" type="submit">
            LOGIN
          </button>
        </form>

        <div className="auth-link">
          Don't have account? <Link to="/register">Register</Link>
        </div>

      </div>
    </div>
  );
}
