// LocalVibe - simple JavaScript for a first year project

var starterProducts = [
 {id:1,name:"Fresh seasonal vegetables",vendor:"Green Basket",price:60,category:"Groceries",stock:20,emoji:"🥬",description:"Fresh vegetables from nearby farms."},
 {id:2,name:"Homemade mango pickle",vendor:"Asha Home Foods",price:140,category:"Food",stock:12,emoji:"🥭",description:"A homemade traditional favourite."},
 {id:3,name:"Handmade cotton tote bag",vendor:"Thread & Craft",price:220,category:"Handmade",stock:8,emoji:"👜",description:"Reusable handmade everyday bag."},
 {id:4,name:"Fresh bakery bread",vendor:"Corner Oven",price:45,category:"Food",stock:15,emoji:"🍞",description:"Soft bread baked fresh every morning."},
 {id:5,name:"Clay flower pot",vendor:"Mitti Studio",price:110,category:"Home",stock:10,emoji:"🪴",description:"A handmade clay pot for your home."},
 {id:6,name:"Printed cotton kurta",vendor:"Local Loom",price:499,category:"Clothing",stock:6,emoji:"👕",description:"Comfortable cotton wear from a local shop."}
];

var products = JSON.parse(localStorage.getItem("products")) || starterProducts;
var vendors = JSON.parse(localStorage.getItem("vendors")) || [];
var cart = JSON.parse(localStorage.getItem("cart")) || [];
var orders = JSON.parse(localStorage.getItem("orders")) || [];
var currentVendor = JSON.parse(localStorage.getItem("currentVendor")) || null;

function saveData() {
 localStorage.setItem("products", JSON.stringify(products));
 localStorage.setItem("vendors", JSON.stringify(vendors));
 localStorage.setItem("cart", JSON.stringify(cart));
 localStorage.setItem("orders", JSON.stringify(orders));
 localStorage.setItem("currentVendor", JSON.stringify(currentVendor));
 updateCartCount();
}

function money(price) {
 return "₹" + price;
}

function updateCartCount() {
 var count = 0;
 for (var i = 0; i < cart.length; i++) count = count + cart[i].qty;
 document.getElementById("cartCount").innerHTML = count;
}

function updateLoginButtons() {
 var login = document.querySelector(".nav-login");
 var signup = document.querySelector(".nav-signup");
 var become = document.querySelector(".hero-vendor");
 if (currentVendor) {
  if (login) login.classList.add("hidden");
  if (signup) signup.classList.add("hidden");
  if (become) become.classList.add("hidden");
 } else {
  if (login) login.classList.remove("hidden");
  if (signup) signup.classList.remove("hidden");
  if (become) become.classList.remove("hidden");
 }
}

function showPage(page) {
 var sections = document.querySelectorAll("main > section");
 for (var i = 0; i < sections.length; i++) sections[i].classList.add("hidden");
 document.getElementById("page-" + page).classList.remove("hidden");
 document.getElementById("hero").classList.toggle("hidden", page !== "home");
 var buttons = document.querySelectorAll(".navlinks button");
 for (var j = 0; j < buttons.length; j++) {
  buttons[j].classList.remove("active");
  if (buttons[j].getAttribute("data-page") === page) buttons[j].classList.add("active");
 }
 updateLoginButtons();
 if (page === "vendor") renderVendorPortal();
 if (page === "cart") renderCart();
 if (page === "orders") renderOrders();
 if (page === "admin") renderAdmin();
 window.scrollTo(0, 0);
}

function setVendorAuthMode(mode) {
 var login = mode === "login";
 document.getElementById("vendorLoginForm").classList.toggle("hidden", !login);
 document.getElementById("vendorRegisterForm").classList.toggle("hidden", login);
 document.getElementById("showVendorLogin").classList.toggle("active", login);
 document.getElementById("showVendorRegister").classList.toggle("active", !login);
 document.getElementById("vendorAuthMessage").innerHTML = "";
}

function renderVendorPortal() {
 if (currentVendor) {
  document.getElementById("vendorAuth").classList.add("hidden");
  document.getElementById("vendorDashboard").classList.remove("hidden");
  document.getElementById("vendorWelcomeTitle").innerHTML = "Welcome, " + currentVendor.name;
  renderVendorProducts();
 } else {
  document.getElementById("vendorAuth").classList.remove("hidden");
  document.getElementById("vendorDashboard").classList.add("hidden");
 }
 updateLoginButtons();
}

function renderProducts() {
 var search = document.getElementById("search").value.toLowerCase();
 var category = document.getElementById("category").value;
 var sort = document.getElementById("sort").value;
 var list = [];
 for (var i = 0; i < products.length; i++) {
  var p = products[i];
  var words = (p.name + " " + p.vendor + " " + p.category).toLowerCase();
  if ((category === "All" || category === p.category) && words.indexOf(search) !== -1) list.push(p);
 }
 if (sort === "low") list.sort(function(a,b){return a.price-b.price;});
 if (sort === "high") list.sort(function(a,b){return b.price-a.price;});
 document.getElementById("resultCount").innerHTML = list.length + " products";
 var output = "";
 for (var j = 0; j < list.length; j++) {
  var item = list[j];
  output += '<div class="product"><div class="product-art">' + item.emoji + '</div><div class="product-body"><h3>' + item.name + '</h3><div class="vendor">By ' + item.vendor + ' · ' + item.category + '</div><p class="muted">' + item.description + '</p><div class="muted">' + item.stock + ' in stock</div><div class="price-row"><span class="price">' + money(item.price) + '</span><button class="small-btn" onclick="addToCart(' + item.id + ')">Add to cart</button></div></div></div>';
 }
 if (output === "") output = '<p class="muted">No products found.</p>';
 document.getElementById("productGrid").innerHTML = output;
}

function addToCart(id) {
 var found = false;
 for (var i = 0; i < products.length; i++) {
  if (products[i].id === id && products[i].stock > 0) {
   var inCart = false;
   for (var j = 0; j < cart.length; j++) {
    if (cart[j].id === id) {
     if (cart[j].qty < products[i].stock) cart[j].qty++;
     else return alert("No more stock available.");
     inCart = true;
    }
   }
   if (!inCart) cart.push({id:id,qty:1});
   found = true;
  }
 }
 if (!found) return alert("Product is out of stock.");
 saveData();
 alert("Added to cart!");
}

function renderCart() {
 var area = document.getElementById("cartContents");
 var output = "";
 var total = 0;
 for (var i = 0; i < cart.length; i++) {
  var product = null;
  for (var j = 0; j < products.length; j++) if (products[j].id === cart[i].id) product = products[j];
  if (product) {
   total += product.price * cart[i].qty;
   output += '<div class="cart-row"><div><b>' + product.name + '</b><div class="muted">' + money(product.price) + ' each</div></div><div class="qty"><button onclick="changeQty(' + product.id + ',-1)">-</button>' + cart[i].qty + '<button onclick="changeQty(' + product.id + ',1)">+</button><b>' + money(product.price * cart[i].qty) + '</b><button onclick="removeCart(' + product.id + ')">X</button></div></div>';
  }
 }
 if (output === "") {
  area.innerHTML = '<p class="muted">Your cart is empty.</p>';
 } else {
  area.innerHTML = output + '<div class="total">Total: ' + money(total) + '</div><div class="notice">Demo checkout only. No real payment will be collected.</div><p style="text-align:right"><button class="btn primary" onclick="checkout()">Place demo order</button></p>';
 }
}

function changeQty(id, change) {
 for (var i = 0; i < cart.length; i++) {
  if (cart[i].id === id) {
   cart[i].qty += change;
   if (cart[i].qty < 1) cart.splice(i,1);
   break;
  }
 }
 saveData();
 renderCart();
}

function removeCart(id) {
 for (var i = 0; i < cart.length; i++) {
  if (cart[i].id === id) cart.splice(i,1);
 }
 saveData();
 renderCart();
}

function checkout() {
 if (cart.length === 0) return;
 var bought = [];
 var total = 0;
 for (var i = 0; i < cart.length; i++) {
  for (var j = 0; j < products.length; j++) {
   if (products[j].id === cart[i].id) {
    products[j].stock -= cart[i].qty;
    bought.push({name:products[j].name,qty:cart[i].qty,price:products[j].price});
    total += products[j].price * cart[i].qty;
   }
  }
 }
 var order = {id:"LV" + new Date().getTime(),date:new Date().toLocaleString(),items:bought,total:total};
 orders.push(order);
 cart = [];
 saveData();
 alert("Your demo order has been placed!");
 showPage("orders");
}

function renderVendorProducts() {
 var output = "";
 for (var i = 0; i < products.length; i++) {
  if (products[i].owner === currentVendor.email) {
   output += '<div class="order-row"><div><b>' + products[i].name + '</b><div class="muted">Stock: ' + products[i].stock + ' · ' + money(products[i].price) + '</div></div><button class="small-btn" onclick="deleteProduct(' + products[i].id + ')">Delete</button></div>';
  }
 }
 if (output === "") output = '<p class="muted">You have not listed any products yet.</p>';
 document.getElementById("vendorProducts").innerHTML = output;
}

document.getElementById("vendorRegisterForm").addEventListener("submit", function(event) {
 event.preventDefault();
 var name = document.getElementById("registerName").value;
 var phone = document.getElementById("registerPhone").value;
 var email = document.getElementById("registerEmail").value.toLowerCase();
 var password = document.getElementById("registerPassword").value;
 for (var i = 0; i < vendors.length; i++) {
  if (vendors[i].email === email) {
   document.getElementById("vendorAuthMessage").innerHTML = "This email is already registered. Please sign in.";
   return;
  }
 }
 vendors.push({name:name,phone:phone,email:email,password:password});
 currentVendor = {name:name,phone:phone,email:email};
 saveData();
 event.target.reset();
 renderVendorPortal();
 alert("Account created successfully!");
});

document.getElementById("vendorLoginForm").addEventListener("submit", function(event) {
 event.preventDefault();
 var email = document.getElementById("loginEmail").value.toLowerCase();
 var password = document.getElementById("loginPassword").value;
 var found = false;
 for (var i = 0; i < vendors.length; i++) {
  if (vendors[i].email === email && vendors[i].password === password) {
   currentVendor = {name:vendors[i].name,phone:vendors[i].phone,email:vendors[i].email};
   found = true;
  }
 }
 if (found) {
  saveData();
  event.target.reset();
  renderVendorPortal();
 } else {
  document.getElementById("vendorAuthMessage").innerHTML = "Email or password is incorrect.";
 }
});

function vendorLogout() {
 currentVendor = null;
 saveData();
 renderVendorPortal();
}

document.getElementById("productForm").addEventListener("submit", function(event) {
 event.preventDefault();
 if (!currentVendor) return alert("Please sign in first.");
 var product = {
  id:new Date().getTime(),
  name:document.getElementById("pName").value,
  vendor:currentVendor.name,
  owner:currentVendor.email,
  price:Number(document.getElementById("pPrice").value),
  category:document.getElementById("pCategory").value,
  stock:Number(document.getElementById("pStock").value),
  emoji:document.getElementById("pEmoji").value || "🛍️",
  description:document.getElementById("pDescription").value
 };
 if (product.price <= 0 || product.stock < 0) return alert("Enter a valid price and stock.");
 products.unshift(product);
 saveData();
 event.target.reset();
 document.getElementById("pStock").value = 10;
 document.getElementById("search").value = "";
 document.getElementById("category").value = "All";
 document.getElementById("sort").value = "default";
 renderProducts();
 showPage("home");
 alert("Product added! It is now on the homepage in this browser.");
});

function deleteProduct(id) {
 for (var i = 0; i < products.length; i++) {
  if (products[i].id === id && products[i].owner === currentVendor.email) {
   products.splice(i,1);
   break;
  }
 }
 saveData();
 renderVendorProducts();
 renderProducts();
}

function renderOrders() {
 var output = "";
 for (var i = 0; i < orders.length; i++) {
  var order = orders[i];
  var names = "";
  for (var j = 0; j < order.items.length; j++) names += order.items[j].name + " x " + order.items[j].qty + " ";
  output += '<div class="order-row"><div><b>Order ' + order.id + '</b><div class="muted">' + order.date + '</div><div class="muted">' + names + '</div></div><b>' + money(order.total) + '</b></div>';
 }
 if (output === "") output = '<p class="muted">No orders yet.</p>';
 document.getElementById("orderContents").innerHTML = output;
}

function renderAdmin() {
 var sales = 0;
 for (var i = 0; i < orders.length; i++) sales += orders[i].total;
 document.getElementById("adminStats").innerHTML =
  '<div class="stat">Products<strong>' + products.length + '</strong></div>' +
  '<div class="stat">Vendors<strong>' + vendors.length + '</strong></div>' +
  '<div class="stat">Orders<strong>' + orders.length + '</strong></div>' +
  '<div class="stat">Demo sales<strong>' + money(sales) + '</strong></div>';
 var output = "";
 for (var j = 0; j < orders.length && j < 8; j++) output += '<div class="order-row">Order ' + orders[j].id + '<b>' + money(orders[j].total) + '</b></div>';
 document.getElementById("adminOrders").innerHTML = output || '<p class="muted">No orders yet.</p>';
}

document.querySelectorAll("[data-page]").forEach(function(button) {
 button.addEventListener("click", function() {
  showPage(button.getAttribute("data-page"));
 });
});
document.getElementById("search").addEventListener("input", renderProducts);
document.getElementById("category").addEventListener("change", renderProducts);
document.getElementById("sort").addEventListener("change", renderProducts);

renderProducts();
updateCartCount();
renderVendorPortal();
