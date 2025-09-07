const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { join } = require("path");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { nanoid } = require("nanoid");
const fs = require("fs");

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const file = join(__dirname, "db.json");
const defaultData = { users: [], items: [], cart: [] };

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
}

const adapter = new JSONFile(file);
const db = new Low(adapter, defaultData);

function normalizeText(s){
  return (s || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function initDB() {
  await db.read();
  db.data = db.data || defaultData;
}
initDB();

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: "7d" });
}
function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({error:"Missing token"});
  const parts = auth.split(" ");
  if (parts.length !==2) return res.status(401).json({error:"Invalid token"});
  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch(e){
    return res.status(401).json({error:"Invalid token"});
  }
}

app.post("/api/auth/signup", async (req,res)=>{
  const {name,email,password} = req.body;
  if(!name||!email||!password) return res.status(400).json({error:"Missing fields"});
  await db.read();
  db.data = db.data || defaultData;
  const exists = (db.data.users || []).find(u=>u.email===email);
  if (exists) return res.status(400).json({error:"Email already exists"});
  const hashed = bcrypt.hashSync(password, 8);
  const id = nanoid();
  db.data.users = db.data.users || [];
  db.data.users.push({ id, name, email, password: hashed });
  await db.write();
  const token = generateToken({id,name,email});
  return res.json({ token, name });
});

app.post("/api/auth/login", async (req,res)=>{
  const {email,password} = req.body;
  if(!email||!password) return res.status(400).json({error:"Missing fields"});
  await db.read();
  db.data = db.data || defaultData;
  const user = (db.data.users || []).find(u=>u.email===email);
  if(!user) return res.status(400).json({error:"Invalid credentials"});
  if(!bcrypt.compareSync(password, user.password)) return res.status(400).json({error:"Invalid credentials"});
  const token = generateToken(user);
  res.json({ token, name: user.name });
});

app.get("/api/items", async (req,res)=>{
  const {category, minPrice, maxPrice, q} = req.query;
  await db.read();
  db.data = db.data || defaultData;
  let items = db.data.items || [];
  if(category) items = items.filter(it => it.category === category);
  if(minPrice) items = items.filter(it => it.price >= parseFloat(minPrice));
  if(maxPrice) items = items.filter(it => it.price <= parseFloat(maxPrice));
  if(q) {
    const nq = normalizeText(q);
    items = items.filter(it => {
      const title = normalizeText(it.title);
      const desc = normalizeText(it.description);
      return title.includes(nq) || desc.includes(nq);
    });
  }
  res.json(items);
});

app.post("/api/items", authMiddleware, async (req,res)=>{
  const {title,description,price,category,image} = req.body;
  await db.read();
  db.data = db.data || defaultData;
  const id = nanoid();
  db.data.items = db.data.items || [];
  db.data.items.push({ id, title, description, price: parseFloat(price)||0, category, image: image||"" });
  await db.write();
  res.json({id});
});
app.put("/api/items/:id", authMiddleware, async (req,res)=>{
  const id = req.params.id;
  const {title,description,price,category,image} = req.body;
  await db.read();
  db.data = db.data || defaultData;
  const idx = (db.data.items || []).findIndex(it => it.id === id);
  if(idx === -1) return res.status(404).json({error:"Not found"});
  db.data.items[idx] = { id, title, description, price: parseFloat(price)||0, category, image: image||"" };
  await db.write();
  res.json({ok:true});
});
app.delete("/api/items/:id", authMiddleware, async (req,res)=>{
  const id = req.params.id;
  await db.read();
  db.data = db.data || defaultData;
  db.data.items = (db.data.items || []).filter(it => it.id !== id);
  await db.write();
  res.json({ok:true});
});

app.get("/api/cart", authMiddleware, async (req,res)=>{
  await db.read();
  db.data = db.data || defaultData;
  const rows = (db.data.cart || []).filter(c => c.userId === req.user.id).map(c => {
    const item = (db.data.items || []).find(i => i.id === c.itemId) || {};
    return { itemId: c.itemId, qty: c.qty, title: item.title, price: item.price, category: item.category, image: item.image };
  });
  res.json(rows);
});
app.post("/api/cart", authMiddleware, async (req,res)=>{
  const {itemId, qty} = req.body;
  const q = parseInt(qty) || 1;
  await db.read();
  db.data = db.data || defaultData;
  db.data.cart = db.data.cart || [];
  const exIdx = db.data.cart.findIndex(c => c.userId === req.user.id && c.itemId === itemId);
  if(exIdx !== -1){
    db.data.cart[exIdx].qty += q;
  } else {
    db.data.cart.push({ userId: req.user.id, itemId, qty: q });
  }
  await db.write();
  res.json({ok:true});
});
app.delete("/api/cart/:itemId", authMiddleware, async (req,res)=>{
  const itemId = req.params.itemId;
  await db.read();
  db.data = db.data || defaultData;
  db.data.cart = (db.data.cart || []).filter(c => !(c.userId === req.user.id && c.itemId === itemId));
  await db.write();
  res.json({ok:true});
});
app.delete("/api/cart", authMiddleware, async (req,res)=>{
  await db.read();
  db.data = db.data || defaultData;
  db.data.cart = (db.data.cart || []).filter(c => c.userId !== req.user.id);
  await db.write();
  res.json({ok:true});
});

app.use("/img", express.static(join(__dirname, "img")));

app.listen(PORT, ()=> console.log("✅ Server running on http://localhost:" + PORT));
