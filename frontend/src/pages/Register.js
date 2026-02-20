import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Auth.css";
import bg from "../assets/images/library.jpg";

export default function Register(){

  const [form,setForm]=useState({
    studentId:"",
    name:"",
    surname:"",
    email:"",
    telephone:"",
    password:"",
    confirm:""
  });

  const [loading,setLoading]=useState(false);

  const handleChange=e=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const submit=async(e)=>{
    e.preventDefault();

    if(form.password!==form.confirm)
      return alert("Password mismatch");

    if(form.password.length<6)
      return alert("Password must be at least 6 characters");

    setLoading(true);

    try{
      const res=await fetch("http://localhost:3001/api/auth/register",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(form)
      });

      const data=await res.json();

      if(res.ok){
        alert("Register success");
        window.location="/login";
      }
      else{
        alert(data.message || data.error);
      }

    }catch(err){
      alert("Server error");
    }

    setLoading(false);
  };

  return (
  <div className="auth-container">

    <div className="auth-card">

      <h2>Register</h2>

      <form onSubmit={submit}>

        <input name="studentId" placeholder="Student ID" onChange={handleChange}/>
        <input name="name" placeholder="First Name" onChange={handleChange}/>
        <input name="surname" placeholder="Last Name" onChange={handleChange}/>
        <input name="email" placeholder="Email" onChange={handleChange}/>
        <input name="telephone" placeholder="Telephone" onChange={handleChange}/>
        <input type="password" name="password" placeholder="Password" onChange={handleChange}/>
        <input type="password" name="confirm" placeholder="Confirm Password" onChange={handleChange}/>

        <button className="btn-primary">
          {loading ? "Loading..." : "Register"}
        </button>

      </form>

      <p className="auth-link">
        Already have account? <Link to="/login">Login</Link>
      </p>

    </div>
  </div>
);


}
