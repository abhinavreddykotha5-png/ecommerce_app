import React, {useState} from "react";

export default function Login({api, onLogin}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  async function submit(e){
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(api+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const data = await res.json();
      if(res.ok && data.token){ onLogin(data.token, data.name || ""); }
      else setErr(data.error || "Login failed");
    } catch (e){
      setErr("Network error");
    }
  }
  return (
    <div className="card p-3">
      <h4>Login</h4>
      <form onSubmit={submit}>
        <div className="mb-2">
          <input className="form-control" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="mb-2">
          <input type="password" className="form-control" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {err && <div className="text-danger mb-2">{err}</div>}
        <button className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}
