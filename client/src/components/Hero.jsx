import React, { useState } from "react";

export default function Hero({ onSearch }) {
  const [term, setTerm] = useState("");

  function submit(e){
    e && e.preventDefault();
    if(onSearch) onSearch(term);
  }

  return (
    <section className="hero">
      <div className="bg" style={{backgroundImage:'url(https://images.unsplash.com/photo-1529612700005-7e76b7ef25b0?auto=format&fit=crop&w=1600&q=60)'}}></div>
      <div className="overlay"></div>
      <div className="content container">
        <h1>Handpicked essentials — neat & simple.</h1>
        <p style={{marginTop:8}}>Browse categories, apply filters, and add items to your saved cart. Design focused on clarity.</p>
        <form className="hero-search" onSubmit={submit}>
          <input placeholder="Search products, e.g. cotton t shirt" value={term} onChange={e=>setTerm(e.target.value)} />
          <button type="submit">Search</button>
        </form>
      </div>
    </section>
  );
}
