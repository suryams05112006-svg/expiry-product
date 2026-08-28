/* =====================================================
   WHOLESALE PRODUCT EXPIRY ALERT SYSTEM
   FULL JAVASCRIPT
===================================================== */

const LOW_STOCK_LIMIT = 10;
const EXPIRY_ALERT_DAYS = 7;

let products = [];
let currentFilter = "all";
let scanner = null;
let scannerRunning = false;
let sellingProductId = null;
let toastTimer = null;


/* =====================================================
   LOAD PRODUCTS
===================================================== */

function loadProducts() {

    try {

        const saved =
            localStorage.getItem("expiryProducts");

        products =
            saved
                ? JSON.parse(saved)
                : [];

        if (!Array.isArray(products)) {
            products = [];
        }

    }
    catch (error) {

        console.error(
            "Product load error:",
            error
        );

        products = [];

    }

}


/* =====================================================
   SAVE PRODUCTS
===================================================== */

function saveProducts() {

    try {

        localStorage.setItem(
            "expiryProducts",
            JSON.stringify(products)
        );

        return true;

    }
    catch (error) {

        console.error(
            "Product save error:",
            error
        );

        showToast(
            "Unable to save product",
            "❌"
        );

        return false;

    }

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

        setupLogin();
        setupNavigation();
        setupProductForm();
        setupSearch();
        setupFilters();
        setupScannerButtons();
        setupLogout();
        setupNotificationButton();
        setupPasswordToggle();

        updateAll();

        registerServiceWorker();

        checkExpiryAlerts();

        setInterval(
            checkExpiryAlerts,
            60000
        );

    }
);


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

function setupPasswordToggle() {

    const button =
        document.getElementById(
            "togglePassword"
        );

    const password =
        document.getElementById(
            "password"
        );

    if (!button || !password) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";

                button.textContent =
                    "🙈";

            }
            else {

                password.type =
                    "password";

                button.textContent =
                    "👁️";

            }

        }
    );

}


/* =====================================================
   LOGIN
===================================================== */

function setupLogin() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    if (!loginForm) return;

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const usernameElement =
                document.getElementById(
                    "username"
                );

            const passwordElement =
                document.getElementById(
                    "password"
                );

            const username =
                usernameElement
                    ? usernameElement.value.trim()
                    : "";

            const password =
                passwordElement
                    ? passwordElement.value.trim()
                    : "";

            if (!username || !password) {

                showToast(
                    "Enter username and password",
                    "⚠️"
                );

                return;
            }

            sessionStorage.setItem(
                "loggedIn",
                "true"
            );

            sessionStorage.setItem(
                "loggedUsername",
                username
            );

            openApplication(
                username
            );

        }
    );


    const loggedIn =
        sessionStorage.getItem(
            "loggedIn"
        );

    if (loggedIn === "true") {

        const username =
            sessionStorage.getItem(
                "loggedUsername"
            ) || "User";

        openApplication(
            username
        );

    }

}


/* =====================================================
   OPEN APPLICATION
===================================================== */

function openApplication(
    username
) {

    const loginPage =
        document.getElementById(
            "loginPage"
        );

    const appPage =
        document.getElementById(
            "appPage"
        );

    if (loginPage) {

        loginPage.classList.add(
            "hidden"
        );

    }

    if (appPage) {

        appPage.classList.remove(
            "hidden"
        );

    }

    const welcomeUser =
        document.getElementById(
            "welcomeUser"
        );

    if (welcomeUser) {

        welcomeUser.textContent =
            username;

    }

    updateAll();

}


/* =====================================================
   LOGOUT
===================================================== */

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );

    if (!logoutBtn) return;

    logoutBtn.addEventListener(
        "click",
        async function () {

            sessionStorage.removeItem(
                "loggedIn"
            );

            sessionStorage.removeItem(
                "loggedUsername"
            );

            await stopScanner();

            location.reload();

        }
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    document
        .querySelectorAll(".nav-btn")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const page =
                            button.dataset.page;

                        openPage(page);

                    }
                );

            }
        );

}


/* =====================================================
   OPEN PAGE
===================================================== */

function openPage(
    pageName
) {

    const sections = {

        dashboard:
            "dashboardSection",

        scanner:
            "scannerSection",

        products:
            "productsSection",

        alerts:
            "alertsSection",

        history:
            "historySection"

    };


    Object.values(sections)
        .forEach(
            function (id) {

                const section =
                    document.getElementById(
                        id
                    );

                if (section) {

                    section.classList.add(
                        "hidden"
                    );

                }

            }
        );


    if (sections[pageName]) {

        const section =
            document.getElementById(
                sections[pageName]
            );

        if (section) {

            section.classList.remove(
                "hidden"
            );

        }

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

                if (
                    button.dataset.page ===
                    pageName
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    if (pageName !== "scanner") {

        stopScanner();

    }

}


/* =====================================================
   ADD PRODUCT
===================================================== */

function openAddProduct() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );


    const title =
        document.getElementById(
            "modalTitle"
        );

    if (title) {

        title.textContent =
            "Add Product";

    }


    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {

        form.reset();

    }


    const editId =
        document.getElementById(
            "editProductId"
        );

    if (editId) {

        editId.value = "";

    }


    const sold =
        document.getElementById(
            "soldQuantity"
        );

    if (sold) {

        sold.value = 0;

    }

}


/* =====================================================
   CLOSE PRODUCT MODAL
===================================================== */

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =====================================================
   PRODUCT FORM
===================================================== */

function setupProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (!form) {

        console.error(
            "productForm not found"
        );

        return;

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();
            event.stopPropagation();


            const editIdElement =
                document.getElementById(
                    "editProductId"
                );

            const nameElement =
                document.getElementById(
                    "productName"
                );

            const codeElement =
                document.getElementById(
                    "productCode"
                );

            const totalElement =
                document.getElementById(
                    "totalQuantity"
                );

            const soldElement =
                document.getElementById(
                    "soldQuantity"
                );

            const expiryElement =
                document.getElementById(
                    "expiryDate"
                );


            const editId =
                editIdElement
                    ? editIdElement.value.trim()
                    : "";

            const name =
                nameElement
                    ? nameElement.value.trim()
                    : "";

            const code =
                codeElement
                    ? codeElement.value.trim()
                    : "";

            const total =
                totalElement
                    ? Number(
                        totalElement.value
                    )
                    : NaN;

            const sold =
                soldElement
                    ? Number(
                        soldElement.value
                    )
                    : NaN;

            const expiry =
                expiryElement
                    ? expiryElement.value
                    : "";


            if (!name) {

                showToast(
                    "Enter product name",
                    "⚠️"
                );

                return;

            }


            if (!code) {

                showToast(
                    "Enter Product ID / QR Code",
                    "⚠️"
                );

                return;

            }


            if (!expiry) {

                showToast(
                    "Select expiry date",
                    "⚠️"
                );

                return;

            }


            if (
                !Number.isFinite(total) ||
                total < 0
            ) {

                showToast(
                    "Enter valid total quantity",
                    "⚠️"
                );

                return;

            }


            if (
                !Number.isFinite(sold) ||
                sold < 0
            ) {

                showToast(
                    "Enter valid sold quantity",
                    "⚠️"
                );

                return;

            }


            if (sold > total) {

                showToast(
                    "Sold quantity cannot be greater than total quantity",
                    "⚠️"
                );

                return;

            }


            /* EDIT */

            if (editId) {

                const index =
                    products.findIndex(
                        function (product) {

                            return String(
                                product.id
                            ) === String(
                                editId
                            );

                        }
                    );


                if (index === -1) {

                    showToast(
                        "Product not found",
                        "❌"
                    );

                    return;

                }


                products[index].name =
                    name;

                products[index].code =
                    code;

                products[index].total =
                    total;

                products[index].sold =
                    sold;

                products[index].expiry =
                    expiry;


                if (saveProducts()) {

                    closeProductModal();

                    updateAll();

                    showToast(
                        "Product updated successfully",
                        "✓"
                    );

                }

                return;

            }


            /* DUPLICATE */

            const duplicate =
                products.some(
                    function (product) {

                        return String(
                            product.code
                        ).toLowerCase() ===
                        code.toLowerCase();

                    }
                );


            if (duplicate) {

                showToast(
                    "Product ID / QR Code already exists",
                    "⚠️"
                );

                return;

            }


            /* NEW PRODUCT */

            const newProduct = {

                id:
                    Date.now().toString(),

                name:
                    name,

                code:
                    code,

                total:
                    total,

                sold:
                    sold,

                expiry:
                    expiry,

                createdAt:
                    new Date().toISOString()

            };


            products.unshift(
                newProduct
            );


            if (saveProducts()) {

                closeProductModal();

                updateAll();

                showToast(
                    "Product added successfully",
                    "✓"
                );

            }

        }
    );

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

    const product =
        products.find(
            function (item) {

                return String(
                    item.id
                ) === String(id);

            }
        );


    if (!product) {

        showToast(
            "Product not found",
            "❌"
        );

        return;

    }


    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }


    const title =
        document.getElementById(
            "modalTitle"
        );

    if (title) {

        title.textContent =
            "Edit Product";

    }


    setInputValue(
        "editProductId",
        product.id
    );

    setInputValue(
        "productName",
        product.name
    );

    setInputValue(
        "productCode",
        product.code
    );

    setInputValue(
        "totalQuantity",
        product.total
    );

    setInputValue(
        "soldQuantity",
        product.sold
    );

    setInputValue(
        "expiryDate",
        product.expiry
    );

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

function deleteProduct(id) {

    const product =
        products.find(
            function (item) {

                return String(
                    item.id
                ) === String(id);

            }
        );


    if (!product) {

        showToast(
            "Product not found",
            "❌"
        );

        return;

    }


    const answer =
        confirm(
            "Delete " +
            product.name +
            "?"
        );


    if (!answer) return;


    products =
        products.filter(
            function (item) {

                return String(
                    item.id
                ) !== String(id);

            }
        );


    if (saveProducts()) {

        updateAll();

        showToast(
            "Product deleted",
            "🗑️"
        );

    }

}


/* =====================================================
   SELL PRODUCT
===================================================== */

function openSellModal(id) {

    const product =
        products.find(
            function (item) {

                return String(
                    item.id
                ) === String(id);

            }
        );


    if (!product) {

        showToast(
            "Product not found",
            "❌"
        );

        return;

    }


    const remaining =
        getRemaining(product);


    if (remaining <= 0) {

        showToast(
            "No stock available",
            "⚠️"
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
        remaining
    );


    const sellQuantity =
        document.getElementById(
            "sellQuantity"
        );


    if (sellQuantity) {

        sellQuantity.value = 1;

        sellQuantity.max =
            remaining;

    }


    const modal =
        document.getElementById(
            "sellModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   CONFIRM SELL
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                "#confirmSellBtn"
            )
        ) {

            return;

        }


        if (!sellingProductId) {

            return;

        }


        const product =
            products.find(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        sellingProductId
                    );

                }
            );


        if (!product) {

            showToast(
                "Product not found",
                "❌"
            );

            return;

        }


        const quantityElement =
            document.getElementById(
                "sellQuantity"
            );


        const quantity =
            quantityElement
                ? Number(
                    quantityElement.value
                )
                : NaN;


        const remaining =
            getRemaining(product);


        if (
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {

            showToast(
                "Enter valid quantity",
                "⚠️"
            );

            return;

        }


        if (quantity > remaining) {

            showToast(
                "Not enough stock",
                "⚠️"
            );

            return;

        }


        /* SAVE OLD STOCK */

        const oldRemaining =
            remaining;


        product.sold =
            Number(product.sold) +
            quantity;


        /* SAVE PRODUCT */

        if (saveProducts()) {

            /* SAVE HISTORY */

            saveSaleHistory(
                product,
                quantity,
                oldRemaining
            );


            closeSellModal();

            updateAll();


            showToast(
                quantity +
                " item(s) sold. Stock updated.",
                "✓"
            );

        }

    }
);


/* =====================================================
   CLOSE SELL MODAL
===================================================== */

function closeSellModal() {

    const modal =
        document.getElementById(
            "sellModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }


    sellingProductId = null;

}


/* =====================================================
   REMAINING STOCK
===================================================== */

function getRemaining(product) {

    const total =
        Number(product.total) || 0;

    const sold =
        Number(product.sold) || 0;


    return Math.max(
        0,
        total - sold
    );

}


/* =====================================================
   DAYS UNTIL EXPIRY
===================================================== */

function getDaysUntilExpiry(
    dateString
) {

    if (!dateString) {

        return 99999;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const expiry =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            expiry.getTime()
        )
    ) {

        return 99999;

    }


    return Math.ceil(
        (
            expiry.getTime() -
            today.getTime()
        ) /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


/* =====================================================
   STATUS
===================================================== */

function getStatus(product) {

    const remaining =
        getRemaining(product);

    const days =
        getDaysUntilExpiry(
            product.expiry
        );


    if (remaining <= 0) {

        return {
            type: "out",
            text: "Out of Stock"
        };

    }


    if (days < 0) {

        return {
            type: "expired",
            text: "Expired"
        };

    }


    if (
        days >= 0 &&
        days <= EXPIRY_ALERT_DAYS
    ) {

        return {
            type: "soon",
            text: "Expiring Soon"
        };

    }


    if (
        remaining <=
        LOW_STOCK_LIMIT
    ) {

        return {
            type: "low",
            text: "Low Stock"
        };

    }


    return {
        type: "good",
        text: "Good"
    };

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   UPDATE ALL
===================================================== */

function updateAll() {

    updateDashboard();

    renderProducts();

    renderRecentProducts();

    renderAlerts();

    renderHistory();

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            function (
                sum,
                product
            ) {

                return sum +
                    getRemaining(
                        product
                    );

            },
            0
        );


    const lowStock =
        products.filter(
            function (product) {

                const remaining =
                    getRemaining(
                        product
                    );

                return (
                    remaining > 0 &&
                    remaining <=
                    LOW_STOCK_LIMIT
                );

            }
        ).length;


    const expiringSoon =
        products.filter(
            function (product) {

                const days =
                    getDaysUntilExpiry(
                        product.expiry
                    );

                return (
                    days >= 0 &&
                    days <=
                    EXPIRY_ALERT_DAYS &&
                    getRemaining(
                        product
                    ) > 0
                );

            }
        ).length;


    setText(
        "totalProducts",
        totalProducts
    );

    setText(
        "totalStock",
        totalStock
    );

    setText(
        "lowStock",
        lowStock
    );

    setText(
        "expiringSoon",
        expiringSoon
    );

}


/* =====================================================
   CREATE PRODUCT CARD
===================================================== */

function createProductCard(
    product
) {

    const remaining =
        getRemaining(product);


    const status =
        getStatus(product);


    const days =
        getDaysUntilExpiry(
            product.expiry
        );


    let expiryText =
        formatDate(
            product.expiry
        );


    if (days < 0) {

        expiryText +=
            " • Expired";

    }

    else if (days === 0) {

        expiryText +=
            " • Today";

    }

    else if (
        days <=
        EXPIRY_ALERT_DAYS
    ) {

        expiryText +=
            " • " +
            days +
            " day(s) left";

    }


    return `

        <div class="product-card">

            <div class="product-top">

                <div class="product-info">

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>

                    <div class="product-code">

                        ID:
                        ${escapeHTML(
                            product.code
                        )}

                    </div>

                </div>


                <span class="status ${status.type}">

                    ${status.text}

                </span>

            </div>


            <div class="product-details">

                <div class="detail-box">

                    <span>Total</span>

                    <strong>
                        ${product.total}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>Sold</span>

                    <strong>
                        ${product.sold}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>Remaining</span>

                    <strong>
                        ${remaining}
                    </strong>

                </div>

            </div>


            <div style="
                margin-top:12px;
                font-size:13px;
                color:#737b91;
            ">

                Expiry:

                <strong>
                    ${expiryText}
                </strong>

            </div>


            <div class="card-actions">

                <button
                    type="button"
                    class="sell-btn"
                    onclick="openSellModal('${escapeAttribute(product.id)}')">

                    💰 Sell

                </button>


                <button
                    type="button"
                    class="edit-btn"
                    onclick="editProduct('${escapeAttribute(product.id)}')">

                    ✏️ Edit

                </button>


                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteProduct('${escapeAttribute(product.id)}')">

                    🗑️ Delete

                </button>

            </div>

        </div>

    `;

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (!container) return;


    const searchElement =
        document.getElementById(
            "searchInput"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        products.filter(
            function (product) {

                const name =
                    String(
                        product.name
                    ).toLowerCase();


                const code =
                    String(
                        product.code
                    ).toLowerCase();


                if (
                    !name.includes(search) &&
                    !code.includes(search)
                ) {

                    return false;

                }


                const status =
                    getStatus(product);


                if (
                    currentFilter ===
                    "all"
                ) {

                    return true;

                }


                if (
                    currentFilter ===
                    "good"
                ) {

                    return (
                        status.type ===
                        "good"
                    );

                }


                if (
                    currentFilter ===
                    "soon"
                ) {

                    return (
                        status.type ===
                        "soon"
                    );

                }


                if (
                    currentFilter ===
                    "expired"
                ) {

                    return (
                        status.type ===
                        "expired"
                    );

                }


                if (
                    currentFilter ===
                    "low"
                ) {

                    const remaining =
                        getRemaining(
                            product
                        );

                    return (
                        remaining > 0 &&
                        remaining <=
                        LOW_STOCK_LIMIT
                    );

                }


                return true;

            }
        );


    if (filtered.length === 0) {

        container.innerHTML =
            emptyState(
                "📦",
                "No Products Found",
                "Add your first product."
            );

        return;

    }


    container.innerHTML =
        filtered
            .map(
                createProductCard
            )
            .join("");

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


    const recent =
        products.slice(
            0,
            4
        );


    if (recent.length === 0) {

        container.innerHTML =
            emptyState(
                "📦",
                "No Products Yet",
                "Click Add Product to get started."
            );

        return;

    }


    container.innerHTML =
        recent
            .map(
                createProductCard
            )
            .join("");

}


/* =====================================================
   EMPTY STATE
===================================================== */

function emptyState(
    icon,
    title,
    message
) {

    return `

        <div class="empty-state">

            <div class="empty-icon">
                ${icon}
            </div>

            <h3>
                ${title}
            </h3>

            <p>
                ${message}
            </p>

        </div>

    `;

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
   FILTERS
===================================================== */

function setupFilters() {

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".filter-btn"
                            )
                            .forEach(
                                function (btn) {

                                    btn.classList
                                        .remove(
                                            "active"
                                        );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        currentFilter =
                            button.dataset.filter;


                        renderProducts();

                    }
                );

            }
        );

}


/* =====================================================
   QR SCANNER BUTTONS
===================================================== */

function setupScannerButtons() {

    const startBtn =
        document.getElementById(
            "startScannerBtn"
        );


    const stopBtn =
        document.getElementById(
            "stopScannerBtn"
        );


    if (startBtn) {

        startBtn.addEventListener(
            "click",
            startScanner
        );

    }


    if (stopBtn) {

        stopBtn.addEventListener(
            "click",
            stopScanner
        );

    }

}


/* =====================================================
   START QR SCANNER
===================================================== */

async function startScanner() {

    const message =
        document.getElementById(
            "scannerMessage"
        );


    if (scannerRunning) {

        if (message) {

            message.textContent =
                "Camera is already running.";

        }

        return;

    }


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        if (message) {

            message.textContent =
                "QR scanner library not loaded. Check internet connection.";

        }

        return;

    }


    const config = {

        fps: 10,

        qrbox: {
            width: 250,
            height: 250
        }

    };


    try {

        if (message) {

            message.textContent =
                "Opening camera...";

        }


        if (scanner) {

            try {

                await scanner.clear();

            }
            catch (e) {

                console.log(e);

            }

            scanner = null;

        }


        scanner =
            new Html5Qrcode(
                "reader"
            );


        await scanner.start(

            {
                facingMode:
                    "environment"
            },

            config,

            onQRCodeSuccess,

            onQRCodeError

        );


        scannerRunning = true;


        if (message) {

            message.textContent =
                "Camera is ON. Scan your QR code.";

        }

    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        scannerRunning = false;


        try {

            if (scanner) {

                try {

                    await scanner.clear();

                }
                catch (e) {

                    console.log(e);

                }

            }


            scanner = null;


            const cameras =
                await Html5Qrcode
                    .getCameras();


            if (
                cameras &&
                cameras.length > 0
            ) {

                scanner =
                    new Html5Qrcode(
                        "reader"
                    );


                await scanner.start(

                    cameras[0].id,

                    config,

                    onQRCodeSuccess,

                    onQRCodeError

                );


                scannerRunning = true;


                if (message) {

                    message.textContent =
                        "Camera is ON. Scan your QR code.";

                }

                return;

            }

        }

        catch (secondError) {

            console.error(
                "Camera fallback error:",
                secondError
            );

        }


        if (message) {

            message.innerHTML =
                "❌ Camera could not open.<br><br>" +
                "Allow camera permission in your browser.<br><br>" +
                "Use VS Code Live Server or localhost.";

        }

    }

}


/* =====================================================
   QR SUCCESS
===================================================== */

function onQRCodeSuccess(
    decodedText
) {

    const text =
        String(
            decodedText
        )
        .trim();


    const result =
        document.getElementById(
            "scanResult"
        );


    const scanText =
        document.getElementById(
            "scanText"
        );


    if (result) {

        result.classList.remove(
            "hidden"
        );

    }


    const product =
        products.find(
            function (item) {

                return String(
                    item.code
                ).toLowerCase() ===
                text.toLowerCase();

            }
        );


    if (product) {

        if (scanText) {

            scanText.innerHTML = `

                <strong>
                    ${escapeHTML(
                        product.name
                    )}
                </strong>

                <br><br>

                Product ID:
                ${escapeHTML(
                    product.code
                )}

                <br>

                Total:
                ${product.total}

                <br>

                Sold:
                ${product.sold}

                <br>

                Remaining:
                ${getRemaining(
                    product
                )}

                <br>

                Expiry:
                ${formatDate(
                    product.expiry
                )}

                <br>

                Status:
                ${getStatus(
                    product
                ).text}

            `;

        }


        showToast(
            product.name +
            " found!",
            "📦"
        );

    }

    else {

        if (scanText) {

            scanText.innerHTML =
                "Scanned Code: " +
                escapeHTML(text) +
                "<br><br>" +
                "⚠️ Product not found.";

        }


        showToast(
            "Product not found",
            "⚠️"
        );

    }


    stopScanner();

}


/* =====================================================
   QR ERROR
===================================================== */

function onQRCodeError(
    errorMessage
) {

    /* Continuous scanning errors
       are ignored */

}


/* =====================================================
   STOP SCANNER
===================================================== */

async function stopScanner() {

    if (!scanner) {

        scannerRunning = false;

        return;

    }


    try {

        if (scannerRunning) {

            await scanner.stop();

        }

    }
    catch (error) {

        console.log(
            "Scanner stop:",
            error
        );

    }


    try {

        await scanner.clear();

    }
    catch (error) {

        console.log(
            "Scanner clear:",
            error
        );

    }


    scanner = null;

    scannerRunning = false;

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

async function enableNotifications() {

    if (
        !("Notification" in window)
    ) {

        showToast(
            "Browser does not support notifications",
            "⚠️"
        );

        return;

    }


    try {

        const permission =
            await Notification
                .requestPermission();


        if (
            permission !==
            "granted"
        ) {

            showToast(
                "Notification permission denied",
                "⚠️"
            );

            return;

        }


        showToast(
            "Notifications enabled",
            "🔔"
        );


        if (
            "serviceWorker" in
            navigator
        ) {

            const registration =
                await navigator
                    .serviceWorker
                    .ready;


            await registration
                .showNotification(
                    "Expiry Alert System",
                    {

                        body:
                            "Notifications are enabled successfully.",

                        tag:
                            "notification-test",

                        icon:
                            "./icon-192.png"

                    }
                );

        }

    }

    catch (error) {

        console.error(
            "Notification error:",
            error
        );

        showToast(
            "Notification error",
            "❌"
        );

    }

}


/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

function setupNotificationButton() {

    const button =
        document.getElementById(
            "notificationBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        enableNotifications
    );

}


/* =====================================================
   EXPIRY ALERT CHECK
===================================================== */

function checkExpiryAlerts() {

    if (!products.length) {

        return;

    }


    products.forEach(
        function (product) {

            if (
                getRemaining(product) <= 0
            ) {

                return;

            }


            const days =
                getDaysUntilExpiry(
                    product.expiry
                );


            if (
                days >= 0 &&
                days <=
                EXPIRY_ALERT_DAYS
            ) {

                sendExpiryNotification(
                    product,
                    days
                );

            }

        }
    );

}


/* =====================================================
   SEND EXPIRY NOTIFICATION
===================================================== */

async function sendExpiryNotification(
    product,
    days
) {

    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    const notificationKey =
        "expiryNotified_" +
        product.id +
        "_" +
        today;


    if (
        localStorage.getItem(
            notificationKey
        )
    ) {

        return;

    }


    let message;


    if (days === 0) {

        message =
            product.name +
            " expires today. " +
            getRemaining(product) +
            " pieces remaining.";

    }

    else {

        message =
            product.name +
            " expires in " +
            days +
            " day(s). " +
            getRemaining(product) +
            " pieces remaining.";

    }


    localStorage.setItem(
        notificationKey,
        "true"
    );


    showToast(
        message,
        "🔔"
    );


    if (
        "Notification" in window &&
        Notification.permission ===
        "granted" &&
        "serviceWorker" in
        navigator
    ) {

        try {

            const registration =
                await navigator
                    .serviceWorker
                    .ready;


            await registration
                .showNotification(
                    "⚠️ Expiry Product Alert",
                    {

                        body:
                            message,

                        tag:
                            "expiry-" +
                            product.id,

                        requireInteraction:
                            true,

                        icon:
                            "./icon-192.png"

                    }
                );

        }

        catch (error) {

            console.error(
                "Notification error:",
                error
            );

        }

    }

}


/* =====================================================
   ALERT LIST
===================================================== */

function renderAlerts() {

    const container =
        document.getElementById(
            "alertList"
        );


    if (!container) return;


    const alerts =
        products.filter(
            function (product) {

                const days =
                    getDaysUntilExpiry(
                        product.expiry
                    );


                return (
                    getRemaining(
                        product
                    ) > 0 &&
                    days <=
                    EXPIRY_ALERT_DAYS
                );

            }
        );


    if (alerts.length === 0) {

        container.innerHTML =
            emptyState(
                "🔔",
                "No Alerts",
                "There are no products needing attention."
            );

        return;

    }


    container.innerHTML =
        alerts
            .map(
                function (product) {

                    const days =
                        getDaysUntilExpiry(
                            product.expiry
                        );


                    return `

                        <div class="alert-card">

                            <h3>

                                ⚠️

                                ${escapeHTML(
                                    product.name
                                )}

                            </h3>


                            <p>

                                Remaining:

                                <strong>
                                    ${getRemaining(
                                        product
                                    )}
                                </strong>

                            </p>


                            <p>

                                Expiry:

                                ${formatDate(
                                    product.expiry
                                )}

                            </p>


                            <p>

                                ${
                                    days < 0
                                    ? "Expired"

                                    : days === 0
                                    ? "Expires Today"

                                    : "Expires in " +
                                      days +
                                      " day(s)"

                                }

                            </p>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   SALES HISTORY
===================================================== */

function saveSaleHistory(
    product,
    quantity,
    oldRemaining
) {

    try {

        let history =
            getSaleHistory();


        history.unshift({

            id:
                Date.now().toString(),

            productId:
                product.id,

            productName:
                product.name,

            productCode:
                product.code,

            quantity:
                quantity,

            oldRemaining:
                oldRemaining,

            remaining:
                getRemaining(product),

            date:
                new Date().toISOString()

        });


        /* Keep latest 100 records */

        history =
            history.slice(
                0,
                100
            );


        localStorage.setItem(
            "salesHistory",
            JSON.stringify(
                history
            )
        );


        console.log(
            "Sale history saved"
        );

    }

    catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


/* =====================================================
   GET SALES HISTORY
===================================================== */

function getSaleHistory() {

    try {

        const saved =
            localStorage.getItem(
                "salesHistory"
            );


        const history =
            saved
                ? JSON.parse(saved)
                : [];


        return Array.isArray(
            history
        )
            ? history
            : [];

    }

    catch (error) {

        console.error(
            "History load error:",
            error
        );

        return [];

    }

}


/* =====================================================
   RENDER HISTORY
===================================================== */

function renderHistory() {

    const container =
        document.getElementById(
            "historyList"
        );


    if (!container) return;


    const history =
        getSaleHistory();


    if (history.length === 0) {

        container.innerHTML =
            emptyState(
                "📜",
                "No Sales History",
                "Sold products will appear here."
            );

        return;

    }


    container.innerHTML =
        history
            .map(
                function (item) {

                    const date =
                        new Date(
                            item.date
                        );


                    const formattedDate =
                        date.toLocaleDateString(
                            "en-IN",
                            {

                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"

                            }
                        );


                    const formattedTime =
                        date.toLocaleTimeString(
                            "en-IN",
                            {

                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"

                            }
                        );


                    return `

                        <div class="history-card">

                            <div class="history-icon">
                                💰
                            </div>


                            <div class="history-info">

                                <h3>
                                    ${escapeHTML(
                                        item.productName
                                    )}
                                </h3>


                                <p>
                                    ID:
                                    ${escapeHTML(
                                        item.productCode
                                    )}
                                </p>


                                <small>

                                    ${formattedDate}

                                    •

                                    ${formattedTime}

                                </small>

                            </div>


                            <div class="history-quantity">

                                <strong>
                                    -${item.quantity}
                                </strong>

                                <span>
                                    Sold
                                </span>

                                <small>
                                    Stock:
                                    ${item.remaining}
                                </small>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   SERVICE WORKER
===================================================== */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }


    navigator.serviceWorker
        .register(
            "./service-worker.js"
        )
        .then(
            function (registration) {

                console.log(
                    "Service Worker registered:",
                    registration.scope
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Service Worker error:",
                    error
                );

            }
        );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastText =
        document.getElementById(
            "toastText"
        );


    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    if (
        !toast ||
        !toastText ||
        !toastIcon
    ) {

        alert(message);

        return;

    }


    toastText.textContent =
        message;


    toastIcon.textContent =
        icon;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =====================================================
   HELPER - SET TEXT
===================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =====================================================
   HELPER - SET INPUT VALUE
===================================================== */

function setInputValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

    }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   ESCAPE ATTRIBUTE
===================================================== */

function escapeAttribute(
    value
) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );

}