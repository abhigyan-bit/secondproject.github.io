// LocalVibe - frontend demo JavaScript
// Demo data is temporary and resets when the page is refreshed.

var products = [
 {id:1,name:"Fresh vegetables",vendor:"Green Basket",price:60,category:"Groceries",stock:20,emoji:"🥬"},
 {id:2,name:"Mango pickle",vendor:"Asha Home Foods",price:140,category:"Food",stock:12,emoji:"🥭"},
 {id:3,name:"Cotton tote bag",vendor:"Thread & Craft",price:220,category:"Handmade",stock:8,emoji:"👜"},
 {id:4,name:"Fresh bread",vendor:"Corner Oven",price:45,category:"Food",stock:15,emoji:"🍞"},
 {id:5,name:"Clay flower pot",vendor:"Mitti Studio",price:110,category:"Home",stock:10,emoji:"🪴"},
 {id:6,name:"Cotton kurta",vendor:"Local Loom",price:499,category:"Clothing",stock:6,emoji:"👕"}
];
var vendors = [];
var cart = [];
var orders = [];
var currentVendor = null;

function updateMenu() {
 document.querySelector(".nav-login").classList.toggle("hidden",!!currentVendor);
 document.querySelector(".nav-signup").classList.toggle("hidden",!!currentVendor);
 document.querySelector(".hero-vendor").classList.toggle("hidden",!!currentVendor);
 document.getElementById("cartCount").innerText=cart.reduce((n,item)=>n+item.qty,0);
}
function showPage(name) {
 document.querySelectorAll("main section").forEach(s=>s.classList.add("hidden"));
 document.getElementById("page-"+name).classList.remove("hidden");
 document.getElementById("hero").classList.toggle("hidden",name!=="home");
 document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
 updateMenu();
 if(name==="vendor") renderVendor();
 if(name==="cart") renderCart();
 if(name==="orders") renderOrders();
 if(name==="admin") renderAdmin();
 window.scrollTo(0,0);
}
function setVendorAuthMode(mode) {
 var login=mode==="login";
 document.getElementById("vendorLoginForm").classList.toggle("hidden",!login);
 document.getElementById("vendorRegisterForm").classList.toggle("hidden",login);
 document.getElementById("showVendorLogin").classList.toggle("active",login);
 document.getElementById("showVendorRegister").classList.toggle("active",!login);
}
function renderVendor() {
 document.getElementById("vendorAuth").classList.toggle("hidden",!!currentVendor);
 document.getElementById("vendorDashboard").classList.toggle("hidden",!currentVendor);
 if(currentVendor) {
  document.getElementById("vendorWelcomeTitle").innerText="Welcome, "+currentVendor.name;
  var out="";
  products.forEach(p=>{if(p.owner===currentVendor.email) out+='<p>'+p.name+' - ₹'+p.price+' <button onclick="deleteProduct('+p.id+')">Delete</button></p>';});
  document.getElementById("vendorProducts").innerHTML=out||"No products added yet.";
 }
 updateMenu();
}
function renderProducts() {
 var search=document.getElementById("search").value.toLowerCase();
 var category=document.getElementById("category").value;
 var sort=document.getElementById("sort").value;
 var list=products.filter(p=>(category==="All"||p.category===category)&&(p.name+" "+p.vendor).toLowerCase().includes(search));
 if(sort==="low") list.sort((a,b)=>a.price-b.price);
 if(sort==="high") list.sort((a,b)=>b.price-a.price);
 document.getElementById("resultCount").innerText=list.length+" products";
 document.getElementById("productGrid").innerHTML=list.map(p=>
  '<div class="product"><div class="product-art">'+p.emoji+'</div><div class="product-body"><h3>'+p.name+'</h3><p class="vendor">By '+p.vendor+' · '+p.category+'</p><p class="muted">'+p.stock+' in stock</p><div class="price-row"><b class="price">₹'+p.price+'</b><button class="small-btn" onclick="addToCart('+p.id+')">Add to cart</button></div></div></div>'
 ).join("")||"<p>No products found.</p>";
}
function addToCart(id) {
 var p=products.find(p=>p.id===id);
 if(!p||p.stock<1) return alert("Out of stock!");
 var item=cart.find(c=>c.id===id);
 if(item) item.qty++; else cart.push({id:id,qty:1});
 updateMenu();alert("Added to cart!");
}
function renderCart() {
 var total=0;
 var out=cart.map(item=>{
  var p=products.find(p=>p.id===item.id);
  if(!p) return "";
  total+=p.price*item.qty;
  return '<p>'+p.name+' | ₹'+p.price+' <button onclick="changeQty('+p.id+',-1)">-</button> '+item.qty+' <button onclick="changeQty('+p.id+',1)">+</button> <button onclick="removeItem('+p.id+')">Remove</button></p>';
 }).join("");
 document.getElementById("cartContents").innerHTML=out?out+'<h3>Total: ₹'+total+'</h3><p class="notice">Demo checkout only. No real payment.</p><button class="btn primary" onclick="checkout()">Place order</button>':"Your cart is empty.";
}
function changeQty(id,n) {
 var item=cart.find(c=>c.id===id);
 if(item) item.qty+=n;
 cart=cart.filter(c=>c.qty>0);
 updateMenu();renderCart();
}
function removeItem(id) {cart=cart.filter(c=>c.id!==id);updateMenu();renderCart();}
function checkout() {
 if(!cart.length) return;
 var items=[],total=0;
 cart.forEach(c=>{
  var p=products.find(p=>p.id===c.id);
  if(p) {items.push({name:p.name,qty:c.qty});total+=p.price*c.qty;p.stock-=c.qty;}
 });
 orders.push({id:orders.length+1,date:new Date().toLocaleDateString(),items:items,total:total});
 cart=[];updateMenu();alert("Demo order placed!");showPage("orders");
}
document.getElementById("vendorRegisterForm").addEventListener("submit",function(e) {
 e.preventDefault();
 var email=document.getElementById("registerEmail").value.toLowerCase();
 if(vendors.some(v=>v.email===email)) return alert("Email already registered.");
 currentVendor={name:document.getElementById("registerName").value,email:email};
 vendors.push({name:currentVendor.name,email:email,password:document.getElementById("registerPassword").value});
 this.reset();renderVendor();alert("Demo account created!");
});
document.getElementById("vendorLoginForm").addEventListener("submit",function(e) {
 e.preventDefault();
 var email=document.getElementById("loginEmail").value.toLowerCase();
 var pass=document.getElementById("loginPassword").value;
 var v=vendors.find(v=>v.email===email&&v.password===pass);
 if(!v) return alert("Demo account not found. Please register first.");
 currentVendor={name:v.name,email:v.email};this.reset();renderVendor();
});
function vendorLogout() {currentVendor=null;renderVendor();}
document.getElementById("productForm").addEventListener("submit",function(e) {
 e.preventDefault();
 if(!currentVendor) return alert("Please register or sign in first.");
 var p={id:Date.now(),name:document.getElementById("pName").value,vendor:currentVendor.name,owner:currentVendor.email,price:Number(document.getElementById("pPrice").value),category:document.getElementById("pCategory").value,stock:Number(document.getElementById("pStock").value),emoji:document.getElementById("pEmoji").value||"🛍️"};
 if(p.price<=0) return alert("Enter a valid price.");
 products.unshift(p);this.reset();document.getElementById("pStock").value=10;
 renderProducts();showPage("home");alert("Demo product added to homepage!");
});
function deleteProduct(id) {products=products.filter(p=>p.id!==id);renderVendor();renderProducts();}
function renderOrders() {
 document.getElementById("orderContents").innerHTML=orders.map(o=>'<p>Order '+o.id+' · '+o.date+' · '+o.items.map(i=>i.name+" x "+i.qty).join(", ")+' · ₹'+o.total+'</p>').join("")||"No demo orders yet.";
}
function renderAdmin() {
 var sales=orders.reduce((sum,o)=>sum+o.total,0);
 document.getElementById("adminStats").innerHTML='<div class="stat">Products<strong>'+products.length+'</strong></div><div class="stat">Vendors<strong>'+vendors.length+'</strong></div><div class="stat">Orders<strong>'+orders.length+'</strong></div><div class="stat">Demo sales<strong>₹'+sales+'</strong></div>';
 document.getElementById("adminOrders").innerHTML=orders.map(o=>'<p>Order '+o.id+' - ₹'+o.total+'</p>').join("")||"No demo orders yet.";
}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
["search","category","sort"].forEach(id=>document.getElementById(id).addEventListener("input",renderProducts));
renderProducts();updateMenu();renderVendor();
