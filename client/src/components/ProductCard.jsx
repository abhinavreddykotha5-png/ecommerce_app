import React from "react";
export default function ProductCard({ item, onAdd }){
  return (
    <div className="product-card">
      <img src={item.image || "https://via.placeholder.com/800x480?text=No+Image"} alt={item.title} />
      <div className="body">
        <div className="title">{item.title}</div>
        <div className="meta">{item.category} • ₹{item.price}</div>
        <div className="desc">{item.description}</div>
        <div className="footer">
          <div style={{fontWeight:700}}>₹{item.price}</div>
          <button className="btn btn-sm btn-success" onClick={()=>onAdd(item.id)}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}
