import React, {useState} from "react";

export default function Signup({api, onSignup}){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  async function submit(e){
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(api+"/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});
      const data = await res.json();
      if(res.ok && data.token){ onSignup(data.token, data.name || name); }
      else setErr(data.error || "Signup failed");
    } catch(e){
      setErr("Network error");
    }
  }
  return (
    <div className="card p-3">
      <h4>Create account</h4>
      <form onSubmit={submit}>
        <div className="mb-2"><input className="form-control" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="mb-2"><input className="form-control" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="mb-2"><input type="password" className="form-control" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        {err && <div className="text-danger mb-2">{err}</div>}
        <button className="btn btn-secondary">Signup</button>
      </form>
    </div>
  );
}
