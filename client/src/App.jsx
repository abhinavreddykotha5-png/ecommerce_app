import React, {useState, useEffect} from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Listing from "./pages/Listing";
import CartPage from "./pages/Cart";
import Header from "./components/Header";

const API = import.meta.env.VITE_API || "http://localhost:4000";

function App(){
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [page, setPage] = useState("listing");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(()=> {
    if(!token){
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
    } else {
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName || "");
    }
  },[token, userName]);

  useEffect(()=> {
    if(theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  function logout(){
    setToken(null);
    setUserName("");
    setPage("listing");
  }

  return (
    <div className="container py-4">
      <Header onNavigate={setPage} onLogout={logout} userName={userName} theme={theme} setTheme={setTheme} />
      <main className="page" key={page + "-" + theme}>
        {page === "login" && <Login api={API} onLogin={(t,name)=>{ setToken(t); setUserName(name); setPage("listing"); }} />}
        {page === "signup" && <Signup api={API} onSignup={(t,name)=>{ setToken(t); setUserName(name); setPage("listing"); }} />}
        {page === "listing" && <Listing api={API} token={token} />}
        {page === "cart" && <CartPage api={API} token={token} onRequireLogin={()=>setPage("login")} />}
      </main>
    </div>
  );
}
export default App;
