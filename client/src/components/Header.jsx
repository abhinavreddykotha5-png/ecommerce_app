import React from "react";
export default function Header({ onNavigate, onLogout, userName, theme, setTheme }) {
  const isDark = theme === "dark";
  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }
  return (
    <header className="site-header container" role="banner">
      <div style={{display:"flex", alignItems:"center", gap:"0.9rem"}}>
        <div className="brand" style={{display:"flex", alignItems:"center", gap:10}}>
          <div className="brand-mark" aria-hidden="true">{"✦"}</div>
          <div>
            <h2 style={{margin:0}}>E-Shop</h2>
            <div style={{fontSize:12, color:"var(--muted)"}}>curated goods</div>
          </div>
        </div>
      </div>

      <div style={{flex:1}} />

      <nav className="site-nav" aria-label="Main navigation">
        <button className="btn btn-link" onClick={()=>onNavigate("listing")} aria-label="Browse">Browse</button>
        <button className="btn btn-link" onClick={()=>onNavigate("cart")} aria-label="Cart">Cart</button>

        <div style={{width:12}} />

        {/* Toggle: label + track + dot */}
        <div
          className="toggle"
          role="button"
          tabIndex={0}
          aria-pressed={isDark}
          onClick={toggle}
          onKeyDown={(e)=>{ if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
        >
          <div className="label">{isDark ? "Dark" : "Light"}</div>
          <div className="track" aria-hidden="true">
            <div className="dot" />
          </div>
        </div>

        <div style={{width:12}} />

        {userName ? (
          <>
            <div style={{padding:"0 0.6rem"}}>Welcome, <strong>{userName}</strong></div>
            <button className="btn btn-outline" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={()=>onNavigate("login")}>Login</button>
            <button className="btn btn-outline ms-2" onClick={()=>onNavigate("signup")}>Signup</button>
          </>
        )}
      </nav>
    </header>
  );
}
