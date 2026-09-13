const express=require('express');const path=require('path');const fs=require('fs');const cors=require('cors');
const app=express();const PORT=process.env.PORT||3000;const ADMIN_KEY=process.env.ADMIN_KEY||'change-this-key';
const DB=path.join(__dirname,'db.json');
app.use(cors());app.use(express.json({limit:'2mb'}));
function db(){return JSON.parse(fs.readFileSync(DB,'utf8'))} function save(x){fs.writeFileSync(DB,JSON.stringify(x,null,2))}
function admin(req,res,next){if(req.get('X-Admin-Key')!==ADMIN_KEY)return res.status(401).json({error:'Unauthorized'});next()}
app.get('/api/health',(q,s)=>s.json({ok:true}));
app.get('/api/products',(q,s)=>s.json(db().products));
app.post('/api/products',admin,(q,s)=>{let d=db(),x={id:Date.now().toString(),...q.body};d.products.push(x);save(d);s.status(201).json(x)});
app.put('/api/products/:id',admin,(q,s)=>{let d=db(),i=d.products.findIndex(x=>x.id===q.params.id);if(i<0)return s.sendStatus(404);d.products[i]={...d.products[i],...q.body};save(d);s.json(d.products[i])});
app.delete('/api/products/:id',admin,(q,s)=>{let d=db();d.products=d.products.filter(x=>x.id!==q.params.id);save(d);s.json({ok:true})});
app.post('/api/orders',(q,s)=>{let d=db(),x={id:Date.now().toString(),status:'new',createdAt:new Date().toISOString(),...q.body};d.orders.unshift(x);save(d);s.status(201).json(x)});
app.get('/api/orders',admin,(q,s)=>s.json(db().orders));
app.patch('/api/orders/:id',admin,(q,s)=>{let d=db(),i=d.orders.findIndex(x=>x.id===q.params.id);if(i<0)return s.sendStatus(404);d.orders[i]={...d.orders[i],...q.body};save(d);s.json(d.orders[i])});
app.post('/api/users',(q,s)=>{let d=db(),i=d.users.findIndex(x=>x.telegramId&&x.telegramId===q.body.telegramId);if(i>=0){d.users[i]={...d.users[i],...q.body};save(d);return s.json(d.users[i])}let x={id:Date.now().toString(),createdAt:new Date().toISOString(),...q.body};d.users.push(x);save(d);s.status(201).json(x)});
app.get('/api/users',admin,(q,s)=>s.json(db().users));
app.post('/api/broadcasts',admin,(q,s)=>{let d=db(),x={id:Date.now().toString(),createdAt:new Date().toISOString(),status:'draft',...q.body};d.broadcasts.unshift(x);save(d);s.status(201).json(x)});
app.get('/api/nasiya',admin,(q,s)=>s.json(db().nasiya));
app.use('/admin',express.static(__dirname));app.use(express.static(__dirname));
app.listen(PORT,()=>console.log('Shop server running on '+PORT));
