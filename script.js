/* =========================================================
   EXPIRY ALERT SYSTEM
   Corrected JavaScript
   ========================================================= */

"use strict";

/* -----------------------------
   GLOBAL DATA
----------------------------- */

let products = [];
let salesHistory = [];
let sellingProductId = null;
let currentFilter = "all";

const LOW_STOCK_LIMIT = 10;
const EXPIRY_ALERT_DAYS = 7;

/* -----------------------------
   STORAGE
----------------------------- */

function loadData() {
    try {
        products = JSON.parse(localStorage.getItem("expiryProducts")) || [];
        salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];

        if (!Array.isArray(products)) products = [];
        if (!Array.isArray(salesHistory)) salesHistory = [];
    } catch (error) {
        console.error("Storage error:", error);
        products = [];
        salesHistory = [];
    }
}

function saveProducts() {
    localStorage.setItem("expiryProducts", JSON.stringify(products));
}

function saveSales() {
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
}

/* -----------------------------
   HELPERS
----------------------------- */

function $(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
}

function getValue(id) {
    const el = $(id);
    return el ? el.value.trim() : "";
}

function setValue(id, value) {
    const el = $(id);
    if (el) el.value = value ?? "";
}

function generateId() {
    return Date.now().toString(36) + "-" +
           Math.random().toString(36).substring(2, 8);
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function availableStock(product) {
    return Math.max(
        0,
        Number(product.totalQuantity || 0) -
        Number(product.soldQuantity || 0)
    );
}

function expiryDays(date) {
    if (!date) return 9999;

    const today = new Date();
    const expiry = new Date(date);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
    );
}

function productPrice(product) {
    return Number(
        product.price ??
        product.mrp ??
        product.sellingPrice ??
        0
    ) || 0;
}

/* -----------------------------
   TOAST
----------------------------- */

function showToast(message, type = "success") {
    const toast = $("toast");
    const text = $("toastText");
    const icon = $("toastIcon");

    if (!toast || !text) {
        alert(message);
        return;
    }

    text.textContent = message;

    if (icon) {
        icon.textContent =
            type === "error" ? "❌" :
            type === "warning" ? "⚠️" :
            "✓";
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    const form = $("loginForm");

    if (!form) return;

    /* Create first user automatically */
    if (!localStorage.getItem("expiryUsers")) {

        localStorage.setItem(
            "expiryUsers",
            JSON.stringify([
                {
                    username: "admin",
                    password: "admin123",
                    name: "Administrator"
                }
            ])
        );
    }

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const username = getValue("username");
        const password = getValue("password");

        if (!username || !password) {
            showToast(
                "Enter username and password",
                "error"
            );
            return;
        }

        let users = [];

        try {
            users =
                JSON.parse(
                    localStorage.getItem("expiryUsers")
                ) || [];
        } catch {
            users = [];
        }

        const user = users.find(u =>
            String(u.username).toLowerCase() ===
            username.toLowerCase() &&
            String(u.password) === password
        );

        if (!user) {

            showToast(
                "Invalid username or password",
                "error"
            );

            $("password").value = "";

            return;
        }

        sessionStorage.setItem(
            "loggedInUser",
            user.username
        );

        sessionStorage.setItem(
            "loggedInName",
            user.name || user.username
        );

        showApplication(
            user.name || user.username
        );
    });

    const eye = $("togglePassword");

    if (eye) {

        eye.addEventListener("click", function() {

            const password = $("password");

            if (!password) return;

            if (password.type === "password") {

                password.type = "text";
                eye.textContent = "🙈";

            } else {

                password.type = "password";
                eye.textContent = "👁️";
            }
        });
    }
}

function showApplication(name) {

    const login = $("loginPage");
    const app = $("appPage");

    if (login) {
        login.classList.add("hidden");
        login.style.display = "none";
    }

    if (app) {
        app.classList.remove("hidden");
        app.style.display = "block";
    }

    setText("welcomeUser", name);

    loadData();
    refreshDashboard();
}

function showLoginPage() {

    const login = $("loginPage");
    const app = $("appPage");

    if (app) {
        app.classList.add("hidden");
        app.style.display = "none";
    }

    if (login) {
        login.classList.remove("hidden");
        login.style.display = "flex";
    }
}

function setupLogout() {

    const button = $("logoutBtn");

    if (!button) return;

    button.addEventListener("click", function() {

        sessionStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("loggedInName");

        showLoginPage();
    });
}

/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".nav-btn[data-page]")
        .forEach(button => {

            button.addEventListener("click", function() {

                openPage(
                    this.dataset.page
                );

            });

        });
}

function openPage(page) {

    const sections = document.querySelectorAll(
        ".page-section"
    );

    sections.forEach(section => {
        section.classList.add("hidden");
        section.style.display = "none";
    });

    const target = $(page + "Section");

    if (!target) {
        console.warn(
            "Section not found:",
            page + "Section"
        );
        return;
    }

    target.classList.remove("hidden");
    target.style.display = "block";

    document
        .querySelectorAll(".nav-btn[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

    if (page === "dashboard") {
        refreshDashboard();
    }

    if (page === "products") {
        renderProducts();
    }

    if (page === "alerts") {
        renderAlerts();
    }

    if (page === "history") {
        renderHistory();
    }
}

/* =========================================================
   ADD PRODUCT - MANUAL
   DO NOT CHANGE THIS FLOW
========================================================= */

function openAddProduct() {

    const modal = $("productModal");

    if (!modal) return;

    const form = $("productForm");

    if (form) form.reset();

    setValue("editProductId", "");

    setText(
        "modalTitle",
        "Add Product"
    );

    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

function closeProductModal() {

    const modal = $("productModal");

    if (!modal) return;

    modal.classList.add("hidden");
    modal.style.display = "none";
}

function setupProductForm() {

    const form = $("productForm");

    if (!form) return;

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const editId =
            getValue("editProductId");

        const name =
            getValue("productName");

        const code =
            getValue("productCode");

        const quantity =
            Number(getValue("totalQuantity"));

        const sold =
            Number(getValue("soldQuantity"));

        const expiry =
            getValue("expiryDate");

        if (!name) {
            showToast(
                "Enter product name",
                "error"
            );
            return;
        }

        if (!code) {
            showToast(
                "Enter Product ID",
                "error"
            );
            return;
        }

        if (
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            showToast(
                "Enter valid quantity",
                "error"
            );
            return;
        }

        if (
            !Number.isInteger(sold) ||
            sold < 0 ||
            sold > quantity
        ) {
            showToast(
                "Invalid sold quantity",
                "error"
            );
            return;
        }

        if (!expiry) {
            showToast(
                "Select expiry date",
                "error"
            );
            return;
        }

        loadData();

        if (editId) {

            const product =
                products.find(
                    p => String(p.id) ===
                    String(editId)
                );

            if (!product) {
                showToast(
                    "Product not found",
                    "error"
                );
                return;
            }

            product.name = name;
            product.code = code;
            product.totalQuantity = quantity;
            product.soldQuantity = sold;
            product.expiryDate = expiry;

            saveProducts();

            showToast(
                "Product updated successfully"
            );

        } else {

            const duplicate =
                products.some(
                    p =>
                    String(p.code).toLowerCase() ===
                    code.toLowerCase()
                );

            if (duplicate) {
                showToast(
                    "Product ID already exists",
                    "error"
                );
                return;
            }

            products.push({

                id: generateId(),

                name: name,

                code: code,

                totalQuantity: quantity,

                soldQuantity: sold,

                expiryDate: expiry,

                mrp: 0,

                createdAt:
                    new Date().toISOString()

            });

            saveProducts();

            showToast(
                "Product added successfully"
            );
        }

        closeProductModal();

        refreshAll();
    });
}

/* =========================================================
   PRODUCTS
========================================================= */

function renderProducts() {

    const list = $("productList");

    if (!list) return;

    loadData();

    const search =
        getValue("searchInput").toLowerCase();

    const filtered =
        products.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const code =
                String(product.code || "")
                    .toLowerCase();

            const matchesSearch =
                !search ||
                name.includes(search) ||
                code.includes(search);

            let matchesFilter = true;

            const stock =
                availableStock(product);

            const days =
                expiryDays(product.expiryDate);

            if (currentFilter === "good") {
                matchesFilter =
                    stock > LOW_STOCK_LIMIT &&
                    days > EXPIRY_ALERT_DAYS;
            }

            if (currentFilter === "soon") {
                matchesFilter =
                    days >= 0 &&
                    days <= EXPIRY_ALERT_DAYS;
            }

            if (currentFilter === "expired") {
                matchesFilter = days < 0;
            }

            if (currentFilter === "low") {
                matchesFilter =
                    stock > 0 &&
                    stock <= LOW_STOCK_LIMIT;
            }

            return (
                matchesSearch &&
                matchesFilter
            );
        });

    list.innerHTML = "";

    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No products found.</p>";

        return;
    }

    filtered.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";

        card.innerHTML = `

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    Product ID:
                    <strong>
                        ${escapeHTML(product.code)}
                    </strong>
                </p>

                <p>
                    Available Stock:
                    <strong>
                        ${availableStock(product)}
                    </strong>
                </p>

                <p>
                    Sold:
                    ${Number(product.soldQuantity || 0)}
                </p>

                <p>
                    Expiry:
                    ${escapeHTML(product.expiryDate)}
                </p>

            </div>

            <div class="product-actions">

                <button
                    type="button"
                    onclick="openSellModal('${product.id}')">
                    Sell
                </button>

                <button
                    type="button"
                    onclick="deleteProduct('${product.id}')">
                    Delete
                </button>

            </div>
        `;

        list.appendChild(card);
    });
}

function setupProductSearch() {

    const input = $("searchInput");

    if (input) {
        input.addEventListener(
            "input",
            renderProducts
        );
    }

    document
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    currentFilter =
                        this.dataset.filter ||
                        "all";

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(b =>
                            b.classList.remove(
                                "active"
                            )
                        );

                    this.classList.add("active");

                    renderProducts();
                }
            );
        });
}

/* =========================================================
   SELL
========================================================= */

function openSellModal(productId) {

    loadData();

    const product =
        products.find(
            p => String(p.id) ===
            String(productId)
        );

    if (!product) {
        showToast(
            "Product not found",
            "error"
        );
        return;
    }

    const stock =
        availableStock(product);

    if (stock <= 0) {
        showToast(
            "No stock available",
            "error"
        );
        return;
    }

    sellingProductId =
        product.id;

    setText(
        "sellProductName",
        product.name
    );

    setText(
        "availableStock",
        stock
    );

    const quantity =
        $("sellQuantity");

    if (quantity) {
        quantity.value = 1;
        quantity.max = stock;
    }

    const modal =
        $("sellModal");

    if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    }
}

function closeSellModal() {

    const modal =
        $("sellModal");

    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
    }

    sellingProductId = null;
}

function setupSelling() {

    const button =
        $("confirmSellBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        function() {

            if (!sellingProductId) return;

            loadData();

            const product =
                products.find(
                    p => String(p.id) ===
                    String(sellingProductId)
                );

            if (!product) return;

            const quantity =
                Number(
                    getValue("sellQuantity")
                );

            const stock =
                availableStock(product);

            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                showToast(
                    "Enter valid quantity",
                    "error"
                );
                return;
            }

            if (quantity > stock) {
                showToast(
                    "Not enough stock",
                    "error"
                );
                return;
            }

            product.soldQuantity =
                Number(product.soldQuantity || 0)
                + quantity;

            salesHistory.push({

                id: generateId(),

                productId: product.id,

                productName:
                    product.name,

                code:
                    product.code,

                quantity:
                    quantity,

                amount:
                    productPrice(product) *
                    quantity,

                date:
                    new Date().toLocaleDateString(),

                time:
                    new Date().toLocaleTimeString()

            });

            saveProducts();
            saveSales();

            closeSellModal();

            showToast(
                "Sale completed successfully"
            );

            refreshAll();
        }
    );
}

/* =========================================================
   DASHBOARD
========================================================= */

function refreshDashboard() {

    loadData();

    let stock = 0;
    let low = 0;
    let expiring = 0;

    products.forEach(product => {

        const available =
            availableStock(product);

        stock += available;

        if (
            available > 0 &&
            available <= LOW_STOCK_LIMIT
        ) {
            low++;
        }

        const days =
            expiryDays(
                product.expiryDate
            );

        if (
            days >= 0 &&
            days <= EXPIRY_ALERT_DAYS
        ) {
            expiring++;
        }
    });

    setText(
        "totalProducts",
        products.length
    );

    setText(
        "totalStock",
        stock
    );

    setText(
        "lowStock",
        low
    );

    setText(
        "expiringSoon",
        expiring
    );

    renderRecentProducts();
}

function renderRecentProducts() {

    const container =
        $("recentProducts");

    if (!container) return;

    const recent =
        [...products]
            .reverse()
            .slice(0, 5);

    container.innerHTML = "";

    if (recent.length === 0) {

        container.innerHTML =
            "<p>No products added yet.</p>";

        return;
    }

    recent.forEach(product => {

        const item =
            document.createElement("div");

        item.innerHTML = `

            <strong>
                ${escapeHTML(product.name)}
            </strong>

            <span>
                Stock:
                ${availableStock(product)}
            </span>

            <span>
                Expiry:
                ${escapeHTML(product.expiryDate)}
            </span>
        `;

        container.appendChild(item);
    });
}

/* =========================================================
   ALERTS
========================================================= */

function renderAlerts() {

    const list =
        $("alertList");

    if (!list) return;

    loadData();

    list.innerHTML = "";

    let count = 0;

    products.forEach(product => {

        const stock =
            availableStock(product);

        const days =
            expiryDays(
                product.expiryDate
            );

        if (days < 0) {

            addAlert(
                list,
                "❌ " +
                product.name +
                " is expired."
            );

            count++;
        }

        else if (
            days >= 0 &&
            days <= EXPIRY_ALERT_DAYS
        ) {

            addAlert(
                list,
                "⏰ " +
                product.name +
                " expires in " +
                days +
                " day(s)."
            );

            count++;
        }

        if (
            stock > 0 &&
            stock <= LOW_STOCK_LIMIT
        ) {

            addAlert(
                list,
                "⚠️ " +
                product.name +
                " has low stock. " +
                stock +
                " remaining."
            );

            count++;
        }
    });

    if (count === 0) {

        list.innerHTML =
            "<p>No alerts 🎉</p>";
    }
}

function addAlert(list, message) {

    const item =
        document.createElement("div");

    item.className =
        "alert-item";

    item.textContent =
        message;

    list.appendChild(item);
}

/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    const list =
        $("historyList");

    if (!list) return;

    loadData();

    list.innerHTML = "";

    if (salesHistory.length === 0) {

        list.innerHTML =
            "<p>No sales history yet.</p>";

        return;
    }

    [...salesHistory]
        .reverse()
        .forEach(sale => {

            const item =
                document.createElement("div");

            item.className =
                "history-item";

            item.innerHTML = `

                <strong>
                    ${escapeHTML(
                        sale.productName
                    )}
                </strong>

                <p>
                    Product ID:
                    ${escapeHTML(
                        sale.code
                    )}
                </p>

                <p>
                    Quantity:
                    ${sale.quantity}
                </p>

                <p>
                    Amount:
                    ₹${Number(
                        sale.amount || 0
                    ).toFixed(2)}
                </p>

                <p>
                    Date:
                    ${escapeHTML(
                        sale.date
                    )}
                </p>

                <p>
                    Time:
                    ${escapeHTML(
                        sale.time
                    )}
                </p>
            `;

            list.appendChild(item);
        });
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(productId) {

    loadData();

    const product =
        products.find(
            p => String(p.id) ===
            String(productId)
        );

    if (!product) return;

    if (
        !confirm(
            "Delete " +
            product.name +
            "?"
        )
    ) return;

    products =
        products.filter(
            p =>
            String(p.id) !==
            String(productId)
        );

    saveProducts();

    showToast(
        "Product deleted"
    );

    refreshAll();
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function enableNotifications() {

    if (!("Notification" in window)) {

        showToast(
            "Notifications are not supported",
            "warning"
        );

        return;
    }

    Notification.requestPermission()
        .then(permission => {

            if (permission === "granted") {

                showToast(
                    "Notifications enabled"
                );

            } else {

                showToast(
                    "Notification permission denied",
                    "warning"
                );
            }
        });
}

/* =========================================================
   REFRESH EVERYTHING
========================================================= */

function refreshAll() {

    loadData();

    refreshDashboard();
    renderProducts();
    renderAlerts();
    renderHistory();
}

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupLogin();

        setupLogout();

        setupNavigation();

        setupProductForm();

        setupSelling();

        setupProductSearch();

        loadData();

        /*
          IMPORTANT:
          Login is session based.
          After closing browser/tab and starting
          a new session, login is required again.
        */

        const loggedInUser =
            sessionStorage.getItem(
                "loggedInUser"
            );

        const loggedInName =
            sessionStorage.getItem(
                "loggedInName"
            );

        if (loggedInUser) {

            showApplication(
                loggedInName ||
                loggedInUser
            );

        } else {

            showLoginPage();
        }
    }
);