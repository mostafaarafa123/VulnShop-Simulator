

const signUpToggle = document.getElementById('js_signUpToggle');
const signInToggle = document.getElementById('js_signInToggle');
const container = document.getElementById('js_container');

signUpToggle.addEventListener('click', () => container.classList.add('right-panel-active'));
signInToggle.addEventListener('click', () => container.classList.remove('right-panel-active'));


const productsDB = [
    { id: 1, name: "CyberBook Pro", desc: "High performance laptop for pentesting.", price: 1200, image: "phots/CyberBook Pro.png" },
    { id: 2, name: "StealthPhone X", desc: "Secure smartphone with hardware switches.", price: 899, image: "phots/StealthPhone X.png" },
    { id: 3, name: "HackerBuds", desc: "Noise cancelling earbuds for deep focus.", price: 150, image: "phots/HackerBuds.png" },
    { id: 4, name: "Wi-Fi Pineapple", desc: "Network auditing device.", price: 120, image: "phots/Wi-Fi Pineapple.png" }
];

let cart = [];// Array to store current user's cart items 

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const role = localStorage.getItem('role');

    if (user) {
        document.getElementById('js_authView').style.display = 'none';
        document.getElementById('js_storeView').style.display = 'block'
        document.getElementById('js_userNameDisplay').textContent = user;

        if (role === 'admin') {
            document.getElementById('js_adminBtn').style.display = 'block';
        } else {
            document.getElementById('js_adminBtn').style.display = 'none';
        }

        loadProducts(); // Load store products
        loadCart(); // Load specific user's cart

    } else { // User is not logged in
        document.getElementById('js_authView').style.display = 'flex'
        document.getElementById('js_storeView').style.display = 'none'
        document.getElementById('js_profileView').style.display = 'none'
        document.getElementById('js_productDetailView').style.display = 'none'

        // Reset cart visual counters to zero on logout
        document.getElementById('js_navCartCount').textContent = '0';
        document.getElementById('js_navCartTotal').textContent = '0.00';
        if (document.getElementById('js_detailNavCartCount')) document.getElementById('js_detailNavCartCount').textContent = '0';
        if (document.getElementById('js_detailNavCartTotal')) document.getElementById('js_detailNavCartTotal').textContent = '0.00';
        cart = [];
    }
}

// Run auth check immediately on page load
checkAuth();

// ---Sign In Button ---
document.getElementById('js_loginBtnAction').addEventListener('click', () => {
    const user = document.getElementById('js_loginUser').value.trim();
    const pass = document.getElementById('js_loginPass').value.trim();
    const error = document.getElementById('js_loginError');

    if (user === '' || pass === '') {
        error.textContent = 'Please enter both username and password.';
        return;
    }

    // Search for user in the database
    let users = JSON.parse(localStorage.getItem('Users') || '[]')
    const validUser = users.find(u => u.username === user && u.password === pass)
    
    if (!validUser) {
        error.textContent = 'Invalid username or password. Please sign up first.';
        return;
    }
    // Save session in LocalStorage 
    localStorage.setItem('currentUser', user);
    localStorage.setItem('role', validUser.role || 'user');
    // Clear fields and login
    document.getElementById('js_loginUser').value = '';
    document.getElementById('js_loginPass').value = '';
    error.textContent = '';
    checkAuth();
});

// ---Sign UP Button ---
document.getElementById('js_signupBtnAction').addEventListener('click', () => {
    const user = document.getElementById('js_signupUser').value.trim();
    const pass = document.getElementById('js_signupPass').value.trim();
    const error = document.getElementById('js_signupError');
    const success = document.getElementById('js_signupSuccess');

    if (user === '' || pass === '') {
        error.textContent = 'Please fill in all fields.';
        success.textContent = '';
        return;
    }
    // Check if username already exists
    let users = JSON.parse(localStorage.getItem('Users') || '[]')
    if (users.find(u => u.username === user)) {
        error.textContent = 'Username already exists.';
        success.textContent = '';
        return;
    }
    // Save new user in database
    users.push({ username: user, password: pass });
    localStorage.setItem('Users', JSON.stringify(users));
    error.textContent = '';
    success.textContent = 'Account created successfully! Switching to login...';
    // Auto switch to login screen after 2 seconds
    setTimeout(() => {
        container.classList.remove('right-panel-active');
        success.textContent = '';
        document.getElementById('js_signupUser').value = '';
        document.getElementById('js_signupPass').value = '';
    },2000);
});

// --- Navbar Buttons ---
// Logout button
document.getElementById('js_logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser'); // Clear session
    localStorage.removeItem('role'); // Clear role
    checkAuth(); // Go back to login screen
});

// Admin button (Proof of Privilege Escalation exploit)
document.getElementById('js_adminBtn').addEventListener('click', () => {
    alert('"Welcome to the Admin Panel! You have successfully exploited Privilege Escalation!"')
});

// --- Search ---
document.getElementById('js_searchInput').addEventListener('input', (e) => {
    loadProducts(e.target.value);
});

// --- Load and display products ---
function loadProducts(searchTerm = '') {
    const grid = document.getElementById('js_productsGrid');
    grid.innerHTML = '';

    const filtered = productsDB.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(product => {
        // product card
        grid.innerHTML += `
            <div class="css_product-card" onclick="openProductDetail(${product.id})">
                <div class="css_product-img"><img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain;"></div>
                <div class="css_product-info">
                    <h3>${product.name}</h3>
                    <div class="css_stars">${getStarsHtml(getProductAverageRating(product.id))}</div>
                    <p class="css_product-price">$${product.price.toFixed(2)}</p>
                    <div class="css_qty-row" onclick="event.stopPropagation()">
                        <span class="css_qty-label">Qty:</span>
                        <div class="css_qty-wrapper">
                            <button class="css_qty-btn" onclick="decreaseQty('js_storeQty_${product.id}')">-</button>
                            <input type="number" id="js_storeQty_${product.id}" class="css_qty-input" value="1" min="1">
                            <button class="css_qty-btn" onclick="increaseQty('js_storeQty_${product.id}')">+</button>
                        </div>
                    </div>
                    <button class="css_add-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" onclick="event.stopPropagation(); window.addFromStore(event, this)">Add to Cart</button>
                </div>
            </div>
        `;
    });
}
// --- Add to cart from Store ---
window.addFromStore = function (e, btn) {
    const id = btn.dataset.id;
    const name = btn.dataset.name;

    const price = parseFloat(btn.dataset.price);
    const qtyInput = document.getElementById(`js_storeQty_${id}`);
    const quantity = parseInt(qtyInput.value) || 1;

    addToCart(id, name, price, quantity);
    qtyInput.value = 1;
};

// --- Quantity selector helpers ---

window.increaseQty = function (inputId) {
    const el = document.getElementById(inputId);
    el.value = parseInt(el.value) + 1;
};
window.decreaseQty = function (inputId) {
    const el = document.getElementById(inputId);
    if (parseInt(el.value)>1) {
        el.value = parseInt(el.value) - 1;
    }
};

const cartOverlay = document.getElementById('js_cartOverlay');
const cartPanel = document.getElementById('js_cartPanel');

document.getElementById('js_cartIcon').addEventListener('click', () => {
    cartOverlay.classList.add('active');
    cartPanel.classList.add('active');
});

document.getElementById('js_closeCartBtn').addEventListener('click', () => {
    cartOverlay.classList.remove('active');
    cartPanel.classList.remove('active');
})

// --- Add items to cart ---
function addToCart(id, name, price, quantity) {
    const existing = cart.find(item => item.id == id && item.price == price);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id, name, price, quantity });
    }

    saveCart();
    loadCart();

    showToast(`Added ${quantity}x ${name} to Cart! 🛒`);

    // animation for cart icon
    const cartIcon = document.getElementById('js_cartIcon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3)';
        setTimeout(() =>
            cartIcon.style.transform = "scale(1)"
            , 200)
    }

    const detailCartIcon = document.getElementById('js_detailCartIcon');
    if (detailCartIcon) {
        detailCartIcon.style.transform = "scale(1.3)";
        setTimeout(() => detailCartIcon.style.transform = "scale(1)", 200);
    }
}

// --- Remove item from cart ---
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    loadCart();
}

// --- Save cart for each user separately ---
function saveCart(){
    const user = localStorage.getItem('currentUser');
    if (!user) { return; }
    localStorage.setItem('Cart_' + user, JSON.stringify(cart));
}

// --- Load and display cart content ---
function loadCart() {
    const user = localStorage.getItem('currentUser');
    if (!user) return;

    const saved = localStorage.getItem('Cart_' + user);
    if (saved) {
        cart = JSON.parse(saved);
    } else {
        cart = [];
    }

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Update numbers in all top navbars
    if (document.getElementById('js_navCartCount')) document.getElementById('js_navCartCount').textContent = totalItems;
    if (document.getElementById('js_profileCartCount')) document.getElementById('js_profileCartCount').textContent = totalItems;
    if (document.getElementById('js_detailNavCartCount')) document.getElementById('js_detailNavCartCount').textContent = totalItems;

    const cartItemsDiv =document.getElementById('js_cartItems')
    cartItemsDiv.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        total += (item.price * item.quantity);
        cartItemsDiv.innerHTML += `
            <div class="css_cart-item">
                <div class="css_cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price} / each</p>
                </div>
                <div class="css_qty-wrapper">
                    <button class="css_qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
                    <input type="number" class="css_qty-input" value="${item.quantity}" onchange="setCartQty(${index}, this.value)">
                    <button class="css_qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
                </div>
                <button class="css_remove-item" onclick="removeFromCart(${index})">X</button>
            </div>
        `;
    });

    // Update total price in all navbars
    if (document.getElementById('js_navCartTotal')) document.getElementById('js_navCartTotal').textContent = total.toFixed(2);
    if (document.getElementById('js_detailNavCartTotal')) document.getElementById('js_detailNavCartTotal').textContent = total.toFixed(2);
    document.getElementById('js_cartTotal').textContent = total.toFixed(2);
}
// --- Update cart quantity from buttons ---
window.updateCartQty = function (index,change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    loadCart();
};
// --- Set cart quantity directly from input field ---
window.setCartQty = function (index, value) {
    const qty = parseInt(value);
    if (isNaN(qty) || qty <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = qty;
    }
    saveCart();
    loadCart();
}

// --- Checkout and save order ---
document.getElementById('js_checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) return;
    const total = document.getElementById('js_cartTotal').textContent;

    // Create receipt and save it in user's history
    const user = localStorage.getItem('currentUser');
    let orders = JSON.parse(localStorage.getItem('Orders_' + user) || '[]');
    const date = new Date().toLocaleString();
    const itemsList = cart.map(item => `${item.quantity}x ${item.name} ($${item.price})`).join(', ');

    // Save order in database
    orders.push({ date, total, itemsList });
    localStorage.setItem('Orders_' + user, JSON.stringify(orders));

    document.getElementById('js_checkoutMsg').textContent = `Payment processed for $${total}. Items will be shipped!`;

    // Empty the cart
    cart = [];
    saveCart();

    setTimeout(() => {
        loadCart();
        document.getElementById('js_checkoutMsg').textContent = '';
        document.getElementById('js_cartOverlay').classList.remove('active');
        document.getElementById('js_cartPanel').classList.remove('active');
    },2000);
});


// --- Open profile page ---
document.getElementById('js_userNameDisplay').addEventListener('click', () => {
    document.getElementById('js_storeView').style.display = 'none';  
    document.getElementById('js_profileView').style.display = 'block';

    // get current user and display their info
    const user = localStorage.getItem('currentUser');
    document.getElementById('js_profileUsername').textContent = user;
    document.getElementById('js_profileRole').textContent = localStorage.getItem('role') || 'user';
    document.getElementById('js_profileCartCount').textContent = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Load transaction history for this specific user
    const orders = JSON.parse(localStorage.getItem('Orders_' + user) || '[]');
    const historyList = document.getElementById('js_orderHistoryList');

    //check if there are any orders
    if (orders.length === 0) {
        historyList.innerHTML = '<p class="css_muted-text">No transactions found.</p>';
    } else {
        historyList.innerHTML = '';
        // Reverse array to show newest first
        orders.slice().reverse().forEach(order => {
            historyList.innerHTML += `
                <div class="css_history-item">
                    <div class="css_history-date">${order.date}</div>
                    <div class="css_history-total">Total: $${order.total}</div>
                    <div class="css_history-details">${order.itemsList}</div>
                </div>
            `;
        });
    }
});



// --- Link Detail page Navbar ---
if (document.getElementById('js_detailUserNameDisplay')) {
    document.getElementById('js_detailUserNameDisplay').addEventListener('click', () => {
        document.getElementById('js_productDetailView').style.display = 'none';
        document.getElementById('js_userNameDisplay').click(); // Reuse profile logic
    });
}

if (document.getElementById('js_detailCartIcon')) {
    document.getElementById('js_detailCartIcon').addEventListener('click', () => {
        cartOverlay.classList.add('active');
        cartPanel.classList.add('active');
    });
}

// --- Open product detail page ---
window.openProductDetail = function (id) {
    currentDetailProductId = id;
    const product = productsDB.find(p => p.id == id);
    if (!product) return;

    // Hide store and show detail page
    document.getElementById('js_storeView').style.display = 'none';
    document.getElementById('js_profileView').style.display = 'none';
    document.getElementById('js_productDetailView').style.display = 'block';

    // Fill product data
    document.getElementById('js_detailImage').innerHTML = `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">`;
    document.getElementById('js_detailTitle').textContent = product.name;
    document.getElementById('js_detailStars').innerHTML = getStarsHtml(getProductAverageRating(product.id));

    // Sync username in top navbar
    const user = localStorage.getItem('currentUser');
    if (user && document.getElementById('js_detailUserNameDisplay')) {
        document.getElementById('js_detailUserNameDisplay').textContent = user;
    }

    // Show product description as bullet points
    document.getElementById('js_detailDesc').innerHTML = `<ul><li>${product.desc}</li></ul>`;

    document.getElementById('js_detailPrice').textContent = `$${product.price.toFixed(2)}`;

    // Setup Price and quantity
    document.getElementById('js_detailPrice').dataset.price = product.price;
    document.getElementById('js_detailQty').value = 1;

    // Load reviews for this specific product
    loadProductReviews(id);
}

// --- Back button from details to store ---
document.getElementById('js_backFromDetailBtn').addEventListener('click', () => {
    document.getElementById('js_productDetailView').style.display = 'none';
    document.getElementById('js_storeView').style.display = 'block';
    loadProducts(document.getElementById('js_searchInput').value); // Refresh stars in store
});

// --- Back button from details to store ---
document.getElementById('js_backFromDetailBtn').addEventListener('click', () => {
    document.getElementById('js_productDetailView').style.display = 'none';
    document.getElementById('js_storeView').style.display = 'block';
    loadProducts(document.getElementById('js_searchInput').value); // Refresh stars in store
});

// ---  Add to cart from detail page ---
document.getElementById('js_detailAddToCart').addEventListener('click', () => {
    if (!currentDetailProductId) return;
    const product = productsDB.find(p => p.id == currentDetailProductId);

    const price = parseFloat(document.getElementById('js_detailPrice').dataset.price);
    const quantity = parseInt(document.getElementById('js_detailQty').value) || 1;

    addToCart(product.id, product.name, price, quantity);
    document.getElementById('js_detailQty').value = 1;
});

// --- Submit new review ---
document.getElementById('js_submitReviewBtn').addEventListener('click', () => {
    if (!currentDetailProductId) return;
    const text = document.getElementById('js_reviewText').value;
    if (text.trim() === '') return;

    const user = localStorage.getItem('currentUser') || 'Anonymous';
    const rating = document.getElementById('js_reviewRatingSelect').value;

    // Get all reviews
    let reviews = JSON.parse(localStorage.getItem('cyberReviews') || '[]');

    // Add new review and link it to product ID
    reviews.push({
        productId: currentDetailProductId,
        user,
        rating,
        text,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('cyberReviews', JSON.stringify(reviews));

    // Clear form and reload reviews
    document.getElementById('js_reviewText').value = '';
    loadProductReviews(currentDetailProductId);
    document.getElementById('js_detailStars').innerHTML = getStarsHtml(getProductAverageRating(currentDetailProductId));

    showToast("Review submitted successfully! ⭐");
});

// --- Show reviews for a specific product ---
function loadProductReviews(productId) {
    const allReviews = JSON.parse(localStorage.getItem('cyberReviews') || '[]');

    // Filter reviews to show only ones for this product
    const productReviews = allReviews.filter(r => r.productId == productId);
    const list = document.getElementById('js_productReviewsList');
    list.innerHTML = ''; // Clear container

    if (productReviews.length === 0) {
        list.innerHTML = '<p class="css_muted-text">No reviews yet. Be the first to review!</p>';
        return;
    }

    // Render each review
    productReviews.forEach(review => {
        list.innerHTML += `
            <div class="css_review-item">
                <div class="css_review-header">
                    <strong class="css_review-username">${review.user}</strong>
                    <span class="css_review-date">${review.date || ''}</span>
                </div>
                <div class="css_stars css_review-stars">${getStarsHtml(review.rating)}</div>
                <p class="css_review-text">${review.text}</p>
            </div>
        `;
    });
}

// --- Toast Notification (Popup message) ---
window.showToast = function (message) {
    const toast = document.getElementById('js_toastMessage');
    if (!toast) return; // Prevent crash if element is missing
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // Hides after 3 seconds
};

// --- Generate HTML for stars based on rating ---
function getStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) html += '⭐';
        else html += '<span style="opacity: 0.3">⭐</span>'; // Faded star
    }
    return html;
}

// --- Calculate average rating for a product ---
function getProductAverageRating(productId) {
    const reviews = JSON.parse(localStorage.getItem('cyberReviews') || '[]');
    const productReviews = reviews.filter(r => r.productId == productId);
    if (productReviews.length === 0) return 5; // Default is 5 if no reviews

    const sum = productReviews.reduce((acc, r) => acc + parseInt(r.rating || 5), 0);
    return Math.round(sum / productReviews.length);
}







