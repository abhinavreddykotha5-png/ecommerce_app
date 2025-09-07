import React, {useState, useEffect} from "react";

export default function CartPage({api, token, onRequireLogin}){
  const [items,setItems]=useState([]);
  useEffect(()=> {
    if(!token) return;
    fetchCart();
  },[token]);
  async function fetchCart(){
    const res = await fetch(api+"/api/cart", {headers: {"Authorization":"Bearer "+token}});
    if(res.status===401){ onRequireLogin(); return; }
    const data = await res.json();
    setItems(data);
  }
  async function remove(itemId){
    await fetch(api+"/api/cart/"+itemId, {method:"DELETE", headers: {"Authorization":"Bearer "+token}});
    fetchCart();
  }
  if(!token) return <div className="card p-3">You need to login to view saved cart.</div>
  return (
    <div className="card p-3">
      <h4>Your Cart</h4>
      {items.length===0 && <div className="text-muted">Cart is empty</div>}
      <ul className="list-group">
        {items.map(it=>(
          <li className="list-group-item d-flex justify-content-between align-items-center" key={it.itemId}>
            <div>
              <strong>{it.title}</strong><div className="small text-muted">{it.category} • ₹{it.price} × {it.qty}</div>
            </div>
            <div>
              <button className="btn btn-sm btn-danger" onClick={()=>remove(it.itemId)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <button className="btn btn-outline-danger" onClick={async ()=>{ await fetch(api+"/api/cart", {method:"DELETE", headers: {"Authorization":"Bearer "+token}}); fetchCart(); }}>Clear cart</button>
      </div>
    </div>
  );
}