// ==========================================
// PRODUCT DATA INITIALIZATION
// ==========================================
let products = JSON.parse(localStorage.getItem("products")) || [];
let editIndex = -1;

const LOW_STOCK_LIMIT = 50;
const EXPIRY_ALERT_DAYS = 7;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function getDaysLeft(expiryDate) {
    if (!expiryDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function getRemaining(product) {
    return Number(product.totalQuantity || 0) - Number(product.soldQuantity || 0);
}

function getStatus(product) {
    const days = getDaysLeft(product.expiryDate);
    const remaining = getRemaining(product);

    if (days < 0) return "expired";
    if (days <= EXPIRY_ALERT_DAYS) return "warning";
    if (remaining <= LOW_STOCK_LIMIT) return "lowstock";
    return "safe";
}

function statusText(product) {
    const status = getStatus(product);
    if (status === "expired") return "❌ Expired";
    if (status === "warning") return "⚠️ Expiring Soon";
    if (status === "lowstock") return "🟠 Low Stock";
    return "✅ Safe";
}

function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ==========================================
// SAVE / ADD PRODUCT FUNCTION
// ==========================================
function saveProduct(e) {
    if (e) e.preventDefault();

    const productId = document.getElementById("productId")?.value.trim() || "";
    const productName = document.getElementById("productName")?.value.trim() || "";
    const batchNo = document.getElementById("batchNo")?.value.trim() || "";
    const totalQuantity = Number(document.getElementById("totalQuantity")?.value);
    const soldQuantity = Number(document.getElementById("soldQuantity")?.value);
    const price = Number(document.getElementById("price")?.value);
    const expiryDate = document.getElementById("expiryDate")?.value || "";

    // BASIC VALIDATION
    if (!productId || !productName || !batchNo || !expiryDate || isNaN(totalQuantity) || isNaN(soldQuantity) || isNaN(price)) {
        alert("Please fill in all product details!");
        return;
    }

    if (soldQuantity > totalQuantity) {
        alert("Sold quantity cannot exceed total quantity!");
        return;
    }

    const product = {
        productId,
        productName,
        batchNo,
        totalQuantity,
        soldQuantity,
        price,
        expiryDate
    };

    if (editIndex === -1) {
        products.push(product);
        alert("✅ Product Added Successfully!");
    } else {
        products[editIndex] = product;
        alert("✅ Product Updated Successfully!");
        editIndex = -1;
        const formTitle = document.getElementById("formTitle");
        const saveButton = document.getElementById("saveButton");
        if (formTitle) formTitle.textContent = "Add Product";
        if (saveButton) saveButton.textContent = "Save Product";
    }

    saveData();
    clearForm();
    updateAll();
}

// ==========================================
// EDIT & DELETE
// ==========================================
function editProduct(index) {
    const product = products[index];
    if (!product) return;
    
    editIndex = index;

    document.getElementById("productId").value = product.productId;
    document.getElementById("productName").value = product.productName;
    document.getElementById("batchNo").value = product.batchNo;
    document.getElementById("totalQuantity").value = product.totalQuantity;
    document.getElementById("soldQuantity").value = product.soldQuantity;
    document.getElementById("price").value = product.price;
    document.getElementById("expiryDate").value = product.expiryDate;

    document.getElementById("formTitle").textContent = "Edit Product";
    document.getElementById("saveButton").textContent = "Update Product";
}

function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        products.splice(index, 1);
        saveData();
        updateAll();
    }
}

function clearForm() {
    const form = document.getElementById("productForm");
    if (form) form.reset();
    editIndex = -1;
    const formTitle = document.getElementById("formTitle");
    const saveButton = document.getElementById("saveButton");
    if (formTitle) formTitle.textContent = "Add Product";
    if (saveButton) saveButton.textContent = "Save Product";
}

// ==========================================
// DISPLAY DATA IN TABLE & DASHBOARD
// ==========================================
function renderProducts() {
    const table = document.getElementById("productTable");
    if (!table) return;
    
    const search = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
    const filter = document.getElementById("statusFilter")?.value || "all";

    table.innerHTML = "";

    products.forEach(function (product, index) {
        const matchesSearch =
            product.productId.toLowerCase().includes(search) ||
            product.productName.toLowerCase().includes(search) ||
            product.batchNo.toLowerCase().includes(search);

        const status = getStatus(product);
        const matchesFilter = filter === "all" || filter === status;

        if (!matchesSearch || !matchesFilter) return;

        const row = table.insertRow();
        const remaining = getRemaining(product);
        const salesAmount = Number(product.soldQuantity) * Number(product.price);

        row.insertCell(0).textContent = product.productId;
        row.insertCell(1).textContent = product.productName;
        row.insertCell(2).textContent = product.batchNo;
        row.insertCell(3).textContent = product.totalQuantity;
        row.insertCell(4).textContent = product.soldQuantity;
        row.insertCell(5).textContent = remaining;
        row.insertCell(6).textContent = "₹" + Number(product.price).toFixed(2);
        row.insertCell(7).textContent = "₹" + salesAmount.toFixed(2);
        row.insertCell(8).textContent = product.expiryDate;
        
        const statusCell = row.insertCell(9);
        statusCell.textContent = statusText(product);

        const actionCell = row.insertCell(10);
        actionCell.innerHTML = `
            <button onclick="editProduct(${index})">✏️ Edit</button>
            <button onclick="deleteProduct(${index})">🗑️ Delete</button>
        `;
    });
}

function updateDashboard() {
    let totalStock = 0, totalSold = 0, remainingStock = 0, expiringSoon = 0, expired = 0;

    products.forEach(function (product) {
        totalStock += Number(product.totalQuantity || 0);
        totalSold += Number(product.soldQuantity || 0);
        remainingStock += getRemaining(product);

        const days = getDaysLeft(product.expiryDate);
        if (days < 0) expired++;
        else if (days <= EXPIRY_ALERT_DAYS) expiringSoon++;
    });

    if(document.getElementById("totalProducts")) document.getElementById("totalProducts").textContent = products.length;
    if(document.getElementById("totalStock")) document.getElementById("totalStock").textContent = totalStock;
    if(document.getElementById("totalSold")) document.getElementById("totalSold").textContent = totalSold;
    if(document.getElementById("remainingStock")) document.getElementById("remainingStock").textContent = remainingStock;
    if(document.getElementById("expiringSoon")) document.getElementById("expiringSoon").textContent = expiringSoon;
    if(document.getElementById("expiredProducts")) document.getElementById("expiredProducts").textContent = expired;
}

function updateAll() {
    renderProducts();
    updateDashboard();
}

// ==========================================
// INITIALIZE EVENT LISTENERS SAFELY
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    updateAll();

    // Attach Event Handler to Button Direct-ah
    const saveBtn = document.getElementById("saveButton");
    if (saveBtn) {
        saveBtn.onclick = saveProduct;
    }
});