import React, {useState, useEffect} from "react";
import ProductCard from "../components/ProductCard";
import Hero from "../components/Hero";

export default function Listing({api, token}){
  const [items,setItems] = useState([]);
  const [category,setCategory] = useState("");
  const [q,setQ] = useState("");
  const [minPrice,setMin] = useState("");
  const [maxPrice,setMax] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showTop, setShowTop] = useState(false);

  useEffect(()=> {
    async function load(){ await fetchItems(); }
    load();
    function onScroll(){
      setShowTop(window.scrollY > 360);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function fetchItems(){
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if(category) params.set("category", category);
      if(minPrice) params.set("minPrice", minPrice);
      if(maxPrice) params.set("maxPrice", maxPrice);
      if(q) params.set("q", q);
      const res = await fetch(api + "/api/items?" + params.toString());
      if(!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchItems error:", err);
      setItems([]);
      setError("Unable to load items. Is the backend server running on http://localhost:4000 ?");
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(id){
    if(!token){ alert("Login required to save cart"); return; }
    try {
      const res = await fetch(api+"/api/cart", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
        body:JSON.stringify({itemId:id, qty:1})
      });
      if(!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.error || "Failed to add to cart");
      }
      alert("Added to cart (persisted)");
    } catch(e){
      alert("Add to cart failed: " + (e.message || e));
    }
  }

  function handleHeroSearch(term){
    setQ(term);
    setTimeout(()=> fetchItems(), 0);
    window.scrollTo({ top: 320, behavior: "smooth" });
  }

  function onBackToTop(){
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <Hero onSearch={handleHeroSearch} />

      <div className="container main-grid">
        <aside className="filters-card" aria-label="Filters">
          <div className="filters-header">
            <strong>Filters</strong>
            <button className="collapse-btn" onClick={()=>setFiltersOpen(!filtersOpen)}>{filtersOpen ? "Hide" : "Show"}</button>
          </div>

          {filtersOpen && (
            <div style={{marginTop:12}}>
              <div style={{marginBottom:8}}>
                <label className="small text-muted">Search</label>
                <input className="form-control" placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} />
              </div>

              <div style={{marginBottom:8}}>
                <label className="small text-muted">Category</label>
                <select className="form-select" value={category} onChange={e=>setCategory(e.target.value)}>
                  <option value="">All categories</option>
                  <option>Clothing</option>
                  <option>Shoes</option>
                  <option>Accessories</option>
                  <option>Bags</option>
                </select>
              </div>

              <div style={{display:"flex", gap:8}}>
                <div style={{flex:1}}>
                  <label className="small text-muted">Min</label>
                  <input className="form-control" placeholder="0" value={minPrice} onChange={e=>setMin(e.target.value)} />
                </div>
                <div style={{flex:1}}>
                  <label className="small text-muted">Max</label>
                  <input className="form-control" placeholder="9999" value={maxPrice} onChange={e=>setMax(e.target.value)} />
                </div>
              </div>

              <div style={{marginTop:10}}>
                <button className="btn btn-primary w-100" onClick={fetchItems}>Apply filters</button>
              </div>
            </div>
          )}
        </aside>

        <section>
          {loading && <div className="alert alert-info">Loading items…</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="products-grid">
            {items.map((it, idx)=>(
              <div key={it.id} className="stagger-child" style={{animationDelay:`${idx*40}ms`}}>
                <ProductCard item={it} onAdd={addToCart} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={`back-to-top ${showTop ? "show" : ""}`} onClick={onBackToTop} aria-hidden={!showTop}>
        ↑
      </div>

      <div className="app-footer">© {new Date().getFullYear()} E-Shop — crafted with care.</div>
    </div>
  );
}
