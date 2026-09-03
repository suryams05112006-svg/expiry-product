/* =====================================================
   WHOLESALE PRODUCT EXPIRY ALERT SYSTEM
===================================================== */

const LOW_STOCK_LIMIT = 10;
const EXPIRY_ALERT_DAYS = 7;

let products = [];
let salesHistory = [];

let currentFilter = "all";

let scanner = null;
let scannerRunning = false;

let sellingProductId = null;

let toastTimer = null;

let lastScannedProduct = null;


/* =====================================================
   STORAGE
===================================================== */

function loadProducts() {

    try {
        products =
            JSON.parse(
                localStorage.getItem("expiryProducts")
            ) || [];
    } catch (error) {
        products = [];
    }

    try {
        salesHistory =
            JSON.parse(
                localStorage.getItem("salesHistory")
            ) || [];
    } catch (error) {
        salesHistory = [];
    }
}


function saveProducts() {

    localStorage.setItem(
        "expiryProducts",
        JSON.stringify(products)
    );
}


function saveSalesHistory() {

    localStorage.setItem(
        "salesHistory",
        JSON.stringify(salesHistory)
    );
}


/* =====================================================
   HELPERS
===================================================== */

function generateId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8);
}


function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];
}


function getDaysUntilExpiry(expiryDate) {

    if (!expiryDate) return 9999;

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil(
        (expiry - today) /
        (1000 * 60 * 60 * 24)
    );
}


function getAvailableStock(product) {

    const total =
        Number(product.totalQuantity || 0);

    const sold =
        Number(product.soldQuantity || 0);

    return Math.max(0, total - sold);
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null ? "" : String(value);

    return div.innerHTML;
}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById("toast");

    const text =
        document.getElementById("toastText");

    const icon =
        document.getElementById("toastIcon");

    if (!toast || !text) {

        alert(message);
        return;
    }

    text.textContent = message;

    if (icon) {

        if (type === "error") {
            icon.textContent = "❌";
        }
        else if (type === "warning") {
            icon.textContent = "⚠️";
        }
        else {
            icon.textContent = "✅";
        }
    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(
        function () {
            toast.classList.remove("show");
        },
        3000
    );
}


/* =====================================================
   REFRESH
===================================================== */

function refreshAll() {

    loadProducts();

    updateDashboard();
    renderProducts();
    renderAlerts();
    renderHistory();
}
/* =====================================================
   LOGIN
===================================================== */

function setupLogin() {

    const form =
        document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value
                    .trim();

            if (!username || !password) {

                showToast(
                    "Please enter username and password",
                    "error"
                );

                return;
            }

            sessionStorage.setItem(
                "loggedInUser",
                username
            );

            showApp(username);
        }
    );


    const toggle =
        document.getElementById(
            "togglePassword"
        );

    if (toggle) {

        toggle.addEventListener(
            "click",
            function () {

                const password =
                    document.getElementById(
                        "password"
                    );

                password.type =
                    password.type === "password"
                        ? "text"
                        : "password";
            }
        );
    }
}


/* =====================================================
   SHOW APP
===================================================== */

function showApp(username) {

    const login =
        document.getElementById("loginPage");

    const app =
        document.getElementById("appPage");

    if (login) {
        login.style.display = "none";
    }

    if (app) {
        app.style.display = "block";
    }

    const welcome =
        document.getElementById("welcomeUser");

    if (welcome) {
        welcome.textContent =
            "Welcome, " + username;
    }

    refreshAll();
}


function showLogin() {

    const login =
        document.getElementById("loginPage");

    const app =
        document.getElementById("appPage");

    if (login) {
        login.style.display = "block";
    }

    if (app) {
        app.style.display = "none";
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function setupLogout() {

    const button =
        document.getElementById("logoutBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "loggedInUser"
            );

            stopScanner();

            showLogin();
        }
    );
}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            "[data-section]"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    showSection(
                        button.dataset.section
                    );

                }
            );
        }
    );
}


function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".app-section"
        );

    sections.forEach(
        function (section) {
            section.style.display = "none";
        }
    );

    const section =
        document.getElementById(sectionId);

    if (section) {
        section.style.display = "block";
    }

    if (sectionId === "dashboardSection") {
        updateDashboard();
    }

    if (sectionId === "productsSection") {
        renderProducts();
    }

    if (sectionId === "alertsSection") {
        renderAlerts();
    }

    if (sectionId === "historySection") {
        renderHistory();
    }
}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(product = null) {

    const modal =
        document.getElementById(
            "productModal"
        );

    const form =
        document.getElementById(
            "productForm"
        );

    if (!modal || !form) return;

    form.reset();

    const editId =
        document.getElementById(
            "editProductId"
        );

    if (editId) {
        editId.value = "";
    }


    if (product) {

        document.getElementById(
            "modalTitle"
        ).textContent = "Edit Product";


        editId.value = product.id;

        document.getElementById(
            "productName"
        ).value = product.name || "";

        document.getElementById(
            "productCode"
        ).value = product.code || "";

        document.getElementById(
            "totalQuantity"
        ).value =
            product.totalQuantity || 0;

        document.getElementById(
            "soldQuantity"
        ).value =
            product.soldQuantity || 0;

        document.getElementById(
            "expiryDate"
        ).value =
            product.expiryDate || "";

    }
    else {

        document.getElementById(
            "modalTitle"
        ).textContent = "Add Product";
    }

    modal.style.display = "flex";
}


function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {
        modal.style.display = "none";
    }
}


/* =====================================================
   SAVE PRODUCT
===================================================== */

function setupProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (!form) return;

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const editId =
                document.getElementById(
                    "editProductId"
                ).value;

            const name =
                document.getElementById(
                    "productName"
                ).value.trim();

            const code =
                document.getElementById(
                    "productCode"
                ).value.trim();

            const totalQuantity =
                Number(
                    document.getElementById(
                        "totalQuantity"
                    ).value
                );

            const soldQuantity =
                Number(
                    document.getElementById(
                        "soldQuantity"
                    ).value
                );

            const expiryDate =
                document.getElementById(
                    "expiryDate"
                ).value;


            if (!name) {
                showToast(
                    "Enter product name",
                    "error"
                );
                return;
            }


            if (
                totalQuantity < 0 ||
                !Number.isFinite(totalQuantity)
            ) {
                showToast(
                    "Invalid quantity",
                    "error"
                );
                return;
            }


            if (
                soldQuantity < 0 ||
                soldQuantity > totalQuantity
            ) {
                showToast(
                    "Invalid sold quantity",
                    "error"
                );
                return;
            }


            if (!expiryDate) {
                showToast(
                    "Select expiry date",
                    "error"
                );
                return;
            }


            loadProducts();


            if (editId) {

                const product =
                    products.find(
                        function (item) {
                            return String(item.id) ===
                                String(editId);
                        }
                    );

                if (product) {

                    product.name = name;
                    product.code = code;

                    product.totalQuantity =
                        totalQuantity;

                    product.soldQuantity =
                        soldQuantity;

                    product.expiryDate =
                        expiryDate;

                    product.updatedAt =
                        new Date().toISOString();

                    saveProducts();

                    showToast(
                        "Product updated successfully"
                    );
                }

            }
            else {

                products.push({

                    id: generateId(),

                    name: name,

                    code: code,

                    totalQuantity:
                        totalQuantity,

                    soldQuantity:
                        soldQuantity,

                    expiryDate:
                        expiryDate,

                    brand: "",

                    category: "",

                    quantity: "",

                    image: "",

                    frontPhoto: "",

                    backPhoto: "",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                });

                saveProducts();

                showToast(
                    "Product added successfully"
                );
            }


            closeProductModal();

            refreshAll();
        }
    );
}


/* =====================================================
   EDIT
===================================================== */

function editProduct(productId) {

    loadProducts();

    const product =
        products.find(
            function (item) {
                return String(item.id) ===
                    String(productId);
            }
        );

    if (product) {
        openProductModal(product);
    }
}


/* =====================================================
   DELETE
===================================================== */

function deleteProduct(productId) {

    loadProducts();

    const product =
        products.find(
            function (item) {
                return String(item.id) ===
                    String(productId);
            }
        );

    if (!product) return;

    if (
        !confirm(
            "Delete " + product.name + "?"
        )
    ) {
        return;
    }

    products =
        products.filter(
            function (item) {
                return String(item.id) !==
                    String(productId);
            }
        );

    saveProducts();

    showToast(
        "Product deleted successfully"
    );

    refreshAll();
}
/* =====================================================
   PRODUCT STATUS
===================================================== */

function getProductStatus(product) {

    const stock =
        getAvailableStock(product);

    const days =
        getDaysUntilExpiry(
            product.expiryDate
        );

    if (stock <= 0) {
        return "Out of Stock";
    }

    if (days < 0) {
        return "Expired";
    }

    if (days <= EXPIRY_ALERT_DAYS) {
        return "Expiring Soon";
    }

    if (stock <= LOW_STOCK_LIMIT) {
        return "Low Stock";
    }

    return "Available";
}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

    const list =
        document.getElementById(
            "productList"
        );

    if (!list) return;

    loadProducts();

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        products.filter(
            function (product) {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const code =
                    String(
                        product.code || ""
                    ).toLowerCase();

                const searchMatch =
                    !search ||
                    name.includes(search) ||
                    code.includes(search);


                let filterMatch = true;


                if (
                    currentFilter !== "all"
                ) {

                    filterMatch =
                        getProductStatus(product)
                            .toLowerCase() ===
                        currentFilter.toLowerCase();
                }


                return (
                    searchMatch &&
                    filterMatch
                );
            }
        );


    list.innerHTML = "";


    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No products found.</p>";

        return;
    }


    filtered.forEach(
        function (product) {

            const card =
                document.createElement("div");

            card.className =
                "product-card";


            card.innerHTML = `

                <div class="product-info">

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>

                    <p>
                        Code:
                        ${escapeHTML(
                            product.code || "N/A"
                        )}
                    </p>

                    <p>
                        Stock:
                        <strong>
                            ${getAvailableStock(
                                product
                            )}
                        </strong>
                    </p>

                    <p>
                        Sold:
                        ${Number(
                            product.soldQuantity || 0
                        )}
                    </p>

                    <p>
                        Expiry:
                        ${escapeHTML(
                            product.expiryDate || "N/A"
                        )}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${getProductStatus(
                                product
                            )}
                        </strong>
                    </p>

                </div>

                <div class="product-actions">

                    <button
                        onclick="editProduct('${product.id}')"
                    >
                        Edit
                    </button>

                    <button
                        onclick="openSellModal('${product.id}')"
                    >
                        Sell
                    </button>

                    <button
                        onclick="deleteProduct('${product.id}')"
                    >
                        Delete
                    </button>

                </div>
            `;


            list.appendChild(card);
        }
    );
}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!input) return;

    input.addEventListener(
        "input",
        renderProducts
    );
}


/* =====================================================
   FILTER
===================================================== */

function setupFilters() {

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (btn) {
                            btn.classList.remove(
                                "active"
                            );
                        }
                    );

                    button.classList.add(
                        "active"
                    );

                    currentFilter =
                        button.dataset.filter ||
                        "all";

                    renderProducts();
                }
            );
        }
    );
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    loadProducts();

    let stock = 0;
    let sold = 0;
    let expiring = 0;


    products.forEach(
        function (product) {

            stock +=
                getAvailableStock(product);

            sold +=
                Number(
                    product.soldQuantity || 0
                );


            const days =
                getDaysUntilExpiry(
                    product.expiryDate
                );


            if (
                days >= 0 &&
                days <= EXPIRY_ALERT_DAYS
            ) {
                expiring++;
            }
        }
    );


    const totalProducts =
        document.getElementById(
            "totalProducts"
        );

    const totalStock =
        document.getElementById(
            "totalStock"
        );

    const totalSold =
        document.getElementById(
            "totalSold"
        );

    const expiringSoon =
        document.getElementById(
            "expiringSoon"
        );


    if (totalProducts) {
        totalProducts.textContent =
            products.length;
    }

    if (totalStock) {
        totalStock.textContent =
            stock;
    }

    if (totalSold) {
        totalSold.textContent =
            sold;
    }

    if (expiringSoon) {
        expiringSoon.textContent =
            expiring;
    }


    renderRecentProducts();
}


/* =====================================================
   RECENT PRODUCTS
===================================================== */

function renderRecentProducts() {

    const container =
        document.getElementById(
            "recentProducts"
        );

    if (!container) return;

    loadProducts();

    const recent =
        [...products]
            .sort(
                function (a, b) {

                    return new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    );
                }
            )
            .slice(0, 5);


    container.innerHTML = "";


    if (recent.length === 0) {

        container.innerHTML =
            "<p>No products added yet.</p>";

        return;
    }


    recent.forEach(
        function (product) {

            const item =
                document.createElement("div");

            item.innerHTML = `

                <strong>
                    ${escapeHTML(
                        product.name
                    )}
                </strong>

                <span>
                    Stock:
                    ${getAvailableStock(
                        product
                    )}
                </span>

                <span>
                    Expiry:
                    ${escapeHTML(
                        product.expiryDate || "N/A"
                    )}
                </span>
            `;

            container.appendChild(item);
        }
    );
}


/* =====================================================
   SELL MODAL
===================================================== */

function openSellModal(productId) {

    loadProducts();

    const product =
        products.find(
            function (item) {
                return String(item.id) ===
                    String(productId);
            }
        );

    if (!product) return;


    const stock =
        getAvailableStock(product);


    if (stock <= 0) {

        showToast(
            "No stock available",
            "error"
        );

        return;
    }


    sellingProductId =
        product.id;


    const name =
        document.getElementById(
            "sellProductName"
        );

    const available =
        document.getElementById(
            "availableStock"
        );

    const quantity =
        document.getElementById(
            "sellQuantity"
        );


    if (name) {
        name.textContent =
            product.name;
    }

    if (available) {
        available.textContent =
            stock;
    }

    if (quantity) {

        quantity.value = 1;
        quantity.max = stock;
    }


    const modal =
        document.getElementById(
            "sellModal"
        );

    if (modal) {
        modal.style.display = "flex";
    }
}


function closeSellModal() {

    const modal =
        document.getElementById(
            "sellModal"
        );

    if (modal) {
        modal.style.display = "none";
    }

    sellingProductId = null;
}


/* =====================================================
   CONFIRM SELL
===================================================== */

function setupSellButton() {

    const button =
        document.getElementById(
            "confirmSellBtn"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            if (!sellingProductId) {
                return;
            }


            loadProducts();


            const product =
                products.find(
                    function (item) {

                        return String(item.id) ===
                            String(sellingProductId);
                    }
                );


            if (!product) return;


            const quantityInput =
                document.getElementById(
                    "sellQuantity"
                );


            const quantity =
                Number(
                    quantityInput
                        ? quantityInput.value
                        : 0
                );


            const stock =
                getAvailableStock(product);


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                showToast(
                    "Enter a valid quantity",
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
                Number(
                    product.soldQuantity || 0
                ) + quantity;


            salesHistory.push({

                id: generateId(),

                productId:
                    product.id,

                productName:
                    product.name,

                code:
                    product.code || "",

                quantity:
                    quantity,

                date:
                    getToday(),

                time:
                    new Date()
                        .toLocaleTimeString()
            });


            saveProducts();
            saveSalesHistory();


            closeSellModal();


            showToast(
                quantity +
                " item(s) sold successfully"
            );


            refreshAll();
        }
    );
}
/* =====================================================
   ALERTS
===================================================== */

function renderAlerts() {

    const list =
        document.getElementById(
            "alertList"
        );

    if (!list) return;

    loadProducts();

    const alerts = [];


    products.forEach(
        function (product) {

            const stock =
                getAvailableStock(product);

            const days =
                getDaysUntilExpiry(
                    product.expiryDate
                );


            if (days < 0) {

                alerts.push(
                    "❌ " +
                    product.name +
                    " is expired."
                );

            }
            else if (
                days <= EXPIRY_ALERT_DAYS
            ) {

                alerts.push(
                    "⏰ " +
                    product.name +
                    " expires in " +
                    days +
                    " day(s)."
                );
            }


            if (
                stock > 0 &&
                stock <= LOW_STOCK_LIMIT
            ) {

                alerts.push(
                    "⚠️ " +
                    product.name +
                    " has low stock. " +
                    stock +
                    " item(s) remaining."
                );
            }


            if (stock <= 0) {

                alerts.push(
                    "🚫 " +
                    product.name +
                    " is out of stock."
                );
            }
        }
    );


    list.innerHTML = "";


    if (alerts.length === 0) {

        list.innerHTML =
            "<p>No alerts 🎉</p>";

        return;
    }


    alerts.forEach(
        function (message) {

            const item =
                document.createElement("div");

            item.className =
                "alert-item";

            item.textContent =
                message;

            list.appendChild(item);
        }
    );
}


/* =====================================================
   SALES HISTORY
===================================================== */

function renderHistory() {

    const list =
        document.getElementById(
            "historyList"
        );

    if (!list) return;

    loadProducts();

    const history =
        [...salesHistory].reverse();


    list.innerHTML = "";


    if (history.length === 0) {

        list.innerHTML =
            "<p>No sales history yet.</p>";

        return;
    }


    history.forEach(
        function (sale) {

            const item =
                document.createElement("div");

            item.className =
                "history-item";


            item.innerHTML = `

                <strong>
                    ${escapeHTML(
                        sale.productName ||
                        "Product"
                    )}
                </strong>

                <p>
                    Quantity Sold:
                    ${Number(
                        sale.quantity || 0
                    )}
                </p>

                <p>
                    Code:
                    ${escapeHTML(
                        sale.code || "N/A"
                    )}
                </p>

                <p>
                    Date:
                    ${escapeHTML(
                        sale.date || ""
                    )}
                </p>

                <p>
                    Time:
                    ${escapeHTML(
                        sale.time || ""
                    )}
                </p>
            `;


            list.appendChild(item);
        }
    );
}


/* =====================================================
   QR / BARCODE SCANNER
===================================================== */

function startScanner() {

    const reader =
        document.getElementById(
            "reader"
        );

    if (!reader) {

        showToast(
            "Scanner area not found",
            "error"
        );

        return;
    }


    if (scannerRunning) {

        showToast(
            "Scanner is already running",
            "warning"
        );

        return;
    }


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        showToast(
            "Scanner library not loaded",
            "error"
        );

        return;
    }


    scanner =
        new Html5Qrcode("reader");


    const config = {

        fps: 10,

        qrbox: {
            width: 250,
            height: 250
        },

        formatsToSupport: [

            Html5QrcodeSupportedFormats.QR_CODE,

            Html5QrcodeSupportedFormats.CODE_128,

            Html5QrcodeSupportedFormats.CODE_39,

            Html5QrcodeSupportedFormats.CODE_93,

            Html5QrcodeSupportedFormats.EAN_13,

            Html5QrcodeSupportedFormats.EAN_8,

            Html5QrcodeSupportedFormats.UPC_A,

            Html5QrcodeSupportedFormats.UPC_E,

            Html5QrcodeSupportedFormats.ITF
        ]
    };


    scanner.start(

        {
            facingMode: "environment"
        },

        config,

        function (decodedText) {

            handleScannedCode(
                decodedText
            );
        },

        function () {
            // Scanner is searching
        }

    )
    .then(
        function () {

            scannerRunning = true;

            const message =
                document.getElementById(
                    "scannerMessage"
                );

            if (message) {

                message.textContent =
                    "Scanner is running...";
            }

            showToast(
                "Scanner started"
            );
        }
    )
    .catch(
        function (error) {

            console.error(error);

            scanner = null;

            scannerRunning = false;

            showToast(
                "Camera permission or camera error",
                "error"
            );
        }
    );
}


/* =====================================================
   STOP SCANNER
===================================================== */

function stopScanner() {

    if (
        !scanner ||
        !scannerRunning
    ) {
        return;
    }


    scanner.stop()
        .then(
            function () {

                scanner.clear();

                scanner = null;

                scannerRunning = false;


                const message =
                    document.getElementById(
                        "scannerMessage"
                    );


                if (message) {

                    message.textContent =
                        "Scanner stopped.";
                }
            }
        )
        .catch(
            function (error) {

                console.error(error);

                scanner = null;

                scannerRunning = false;
            }
        );
}


/* =====================================================
   HANDLE SCANNED CODE
===================================================== */

async function handleScannedCode(
    decodedText
) {

    const code =
        String(
            decodedText || ""
        ).trim();


    if (!code) return;


    const scanText =
        document.getElementById(
            "scanText"
        );


    if (scanText) {

        scanText.textContent =
            "Scanned: " + code;
    }


    loadProducts();


    /* Check local database first */

    const localProduct =
        products.find(
            function (product) {

                return String(
                    product.code || ""
                ).trim() === code;
            }
        );


    if (localProduct) {

        showScannedProduct(
            localProduct
        );

        stopScanner();

        return;
    }


    /* Check QR data */

    const embedded =
        parseScannedProduct(code);


    if (embedded) {

        showScannedProduct(
            embedded
        );

        stopScanner();

        return;
    }


    /* Search online */

    showToast(
        "Searching product details..."
    );


    const onlineProduct =
        await lookupProductByBarcode(
            code
        );


    stopScanner();


    if (onlineProduct) {

        showScannedProduct(
            onlineProduct
        );

    }
    else {

        showUnknownScannedProduct(
            code
        );
    }
}


/* =====================================================
   PARSE QR DATA
===================================================== */

function parseScannedProduct(code) {

    try {

        const data =
            JSON.parse(code);


        if (
            data &&
            typeof data === "object" &&
            (
                data.name ||
                data.productName
            )
        ) {

            return {

                id:
                    generateId(),

                name:
                    data.name ||
                    data.productName ||
                    "Unknown Product",

                code:
                    data.code ||
                    data.barcode ||
                    "",

                totalQuantity:
                    Number(
                        data.quantity ||
                        data.totalQuantity ||
                        0
                    ),

                soldQuantity:
                    Number(
                        data.soldQuantity || 0
                    ),

                expiryDate:
                    data.expiryDate ||
                    "",

                brand:
                    data.brand ||
                    "",

                category:
                    data.category ||
                    "",

                quantity:
                    data.packageQuantity ||
                    data.quantityText ||
                    "",

                image:
                    data.image ||
                    "",

                frontPhoto:
                    data.frontPhoto ||
                    "",

                backPhoto:
                    data.backPhoto ||
                    "",

                createdAt:
                    new Date()
                        .toISOString()
            };
        }

    }
    catch (error) {

        // Not JSON
    }


    /* EXPIRY|Name|Code|Quantity|Expiry */

    if (
        code.startsWith(
            "EXPIRY|"
        )
    ) {

        const parts =
            code.split("|");


        if (parts.length >= 5) {

            return {

                id:
                    generateId(),

                name:
                    parts[1] ||
                    "Unknown Product",

                code:
                    parts[2] ||
                    "",

                totalQuantity:
                    Number(parts[3]) || 0,

                soldQuantity:
                    0,

                expiryDate:
                    parts[4] ||
                    "",

                frontPhoto:
                    "",

                backPhoto:
                    "",

                createdAt:
                    new Date()
                        .toISOString()
            };
        }
    }


    return null;
}
/* =====================================================
   ONLINE PRODUCT LOOKUP
===================================================== */

async function lookupProductByBarcode(
    barcode
) {

    try {

        const url =
            "https://world.openfoodfacts.org/api/v2/product/" +
            encodeURIComponent(barcode) +
            ".json";


        const response =
            await fetch(url);


        if (!response.ok) {
            return null;
        }


        const data =
            await response.json();


        if (
            !data ||
            data.status !== 1 ||
            !data.product
        ) {

            return null;
        }


        const product =
            data.product;


        const name =
            product.product_name ||
            product.product_name_en ||
            product.generic_name ||
            "";


        if (!name) {
            return null;
        }


        return {

            id:
                generateId(),

            name:
                name,

            code:
                barcode,

            brand:
                product.brands || "",

            category:
                product.categories || "",

            quantity:
                product.quantity || "",

            totalQuantity:
                0,

            soldQuantity:
                0,

            expiryDate:
                "",

            image:
                product.image_url ||
                product.image_front_url ||
                "",

            frontPhoto:
                product.image_front_url ||
                "",

            backPhoto:
                "",

            ingredients:
                product.ingredients_text ||
                "",

            createdAt:
                new Date()
                    .toISOString()
        };

    }
    catch (error) {

        console.error(
            "Product lookup error:",
            error
        );

        return null;
    }
}


/* =====================================================
   SHOW SCANNED PRODUCT
===================================================== */

function showScannedProduct(
    product
) {

    lastScannedProduct =
        product;


    const result =
        document.getElementById(
            "scanResult"
        );


    if (!result) return;


    result.style.display =
        "block";


    result.innerHTML = `

        <div class="scan-product-result">

            <h3>
                Product Found ✅
            </h3>

            <p>
                <strong>
                    Product Name:
                </strong>

                ${escapeHTML(
                    product.name ||
                    "Unknown"
                )}
            </p>

            <p>
                <strong>
                    Barcode:
                </strong>

                ${escapeHTML(
                    product.code ||
                    "N/A"
                )}
            </p>

            <p>
                <strong>
                    Brand:
                </strong>

                ${escapeHTML(
                    product.brand ||
                    "N/A"
                )}
            </p>

            <p>
                <strong>
                    Category:
                </strong>

                ${escapeHTML(
                    product.category ||
                    "N/A"
                )}
            </p>

            <p>
                <strong>
                    Package:
                </strong>

                ${escapeHTML(
                    product.quantity ||
                    "N/A"
                )}
            </p>

            ${
                product.image
                ? `
                    <img
                        src="${escapeHTML(
                            product.image
                        )}"
                        alt="Product"
                        style="
                            width:120px;
                            max-height:120px;
                            object-fit:contain;
                        "
                    >
                  `
                : ""
            }

            <br>

            <button
                onclick="
                    saveLastScannedProduct()
                "
            >
                Add To Inventory
            </button>

        </div>
    `;
}


/* =====================================================
   UNKNOWN PRODUCT
===================================================== */

function showUnknownScannedProduct(
    code
) {

    lastScannedProduct = {

        id:
            generateId(),

        name:
            "",

        code:
            code,

        brand:
            "",

        category:
            "",

        quantity:
            "",

        totalQuantity:
            0,

        soldQuantity:
            0,

        expiryDate:
            "",

        frontPhoto:
            "",

        backPhoto:
            "",

        createdAt:
            new Date()
                .toISOString()
    };


    const result =
        document.getElementById(
            "scanResult"
        );


    if (!result) return;


    result.style.display =
        "block";


    result.innerHTML = `

        <div class="scan-product-result">

            <h3>
                Product Not Found ⚠️
            </h3>

            <p>
                Barcode:

                <strong>
                    ${escapeHTML(code)}
                </strong>
            </p>

            <p>
                Product information
                was not found online.
            </p>

            <button
                onclick="
                    saveLastScannedProduct()
                "
            >
                Add Product Manually
            </button>

        </div>
    `;
}


/* =====================================================
   ADD SCANNED PRODUCT
===================================================== */

function saveLastScannedProduct() {

    if (!lastScannedProduct) {

        showToast(
            "No scanned product found",
            "error"
        );

        return;
    }


    openProductModal();


    setTimeout(
        function () {

            const name =
                document.getElementById(
                    "productName"
                );

            const code =
                document.getElementById(
                    "productCode"
                );

            const quantity =
                document.getElementById(
                    "totalQuantity"
                );


            if (name) {

                name.value =
                    lastScannedProduct.name ||
                    "";
            }


            if (code) {

                code.value =
                    lastScannedProduct.code ||
                    "";
            }


            if (quantity) {

                quantity.value =
                    lastScannedProduct.totalQuantity ||
                    0;
            }

        },
        100
    );
}


/* =====================================================
   SCANNER BUTTONS
===================================================== */

function setupScannerButtons() {

    const start =
        document.getElementById(
            "startScannerBtn"
        );

    const stop =
        document.getElementById(
            "stopScannerBtn"
        );


    if (start) {

        start.addEventListener(
            "click",
            startScanner
        );
    }


    if (stop) {

        stop.addEventListener(
            "click",
            stopScanner
        );
    }
}


/* =====================================================
   CLOSE MODAL OUTSIDE CLICK
===================================================== */

function setupModalClose() {

    window.addEventListener(
        "click",
        function (event) {

            const productModal =
                document.getElementById(
                    "productModal"
                );

            const sellModal =
                document.getElementById(
                    "sellModal"
                );


            if (
                productModal &&
                event.target === productModal
            ) {

                closeProductModal();
            }


            if (
                sellModal &&
                event.target === sellModal
            ) {

                closeSellModal();
            }
        }
    );
}


/* =====================================================
   FINAL INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

        setupLogin();

        setupLogout();

        setupNavigation();

        setupProductForm();

        setupSellButton();

        setupSearch();

        setupFilters();

        setupScannerButtons();

        setupModalClose();


        const loggedInUser =
            sessionStorage.getItem(
                "loggedInUser"
            );


        if (loggedInUser) {

            showApp(
                loggedInUser
            );

        }
        else {

            showLogin();
        }

    }
);
