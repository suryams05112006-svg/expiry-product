/* =========================================================
   EXPIRY ALERT - COMPLETE SCRIPT.JS
   =========================================================

   FEATURES
   ---------------------------------------------------------
   1. Login
   2. Dashboard
   3. Products
   4. Add / Edit / Delete Product
   5. Sell Product
   6. Billing
   7. Sales History
   8. Expiry Alerts
   9. FRONT CAMERA using getUserMedia()
   10. BACK CAMERA using getUserMedia()
   11. Photos are NOT permanently saved
   12. Only product details are saved
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let products = [];
let salesHistory = [];

let selectedSellProductId = null;


/* =========================================================
   STORAGE KEYS
========================================================= */

const PRODUCTS_KEY = "expiryAlertProducts";
const HISTORY_KEY = "expiryAlertSalesHistory";
const USER_KEY = "expiryAlertUser";


/* =========================================================
   CAMERA VARIABLES
========================================================= */

let cameraStream = null;

let currentCameraSide = null;

let frontPhotoData = null;
let backPhotoData = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadData();

    setupLogin();

    setupPasswordToggle();

    setupNavigation();

    setupProductForm();

    setupSearch();

    setupFilters();

    setupSell();

    setupBilling();

    setupCamera();

    setupLogout();

    setupNotificationButton();

    updateDashboard();

    renderProducts();

    renderRecentProducts();

    renderAlerts();

    renderHistory();

    updateWelcomeUser();

    checkExistingLogin();

});


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        const savedProducts =
            localStorage.getItem(PRODUCTS_KEY);

        const savedHistory =
            localStorage.getItem(HISTORY_KEY);


        if (savedProducts) {

            products = JSON.parse(savedProducts);

            if (!Array.isArray(products)) {

                products = [];

            }

        }


        if (savedHistory) {

            salesHistory = JSON.parse(savedHistory);

            if (!Array.isArray(salesHistory)) {

                salesHistory = [];

            }

        }

    } catch (error) {

        console.error(
            "Storage loading error:",
            error
        );

        products = [];

        salesHistory = [];

    }

}


/* =========================================================
   SAVE PRODUCTS
========================================================= */

function saveProducts() {

    try {

        localStorage.setItem(
            PRODUCTS_KEY,
            JSON.stringify(products)
        );

    } catch (error) {

        console.error(
            "Product save error:",
            error
        );

        showToast(
            "Unable to save product",
            "error"
        );

    }

}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory() {

    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(salesHistory)
        );

    } catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    const loginForm =
        document.getElementById("loginForm");


    if (!loginForm) return;


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const usernameElement =
                document.getElementById("username");

            const passwordElement =
                document.getElementById("password");


            const username =
                usernameElement
                    ? usernameElement.value.trim()
                    : "";


            const password =
                passwordElement
                    ? passwordElement.value
                    : "";


            if (!username || !password) {

                showToast(
                    "Enter username and password",
                    "error"
                );

                return;

            }


            localStorage.setItem(
                USER_KEY,
                username
            );


            showApplication();

            updateWelcomeUser();


            showToast(
                "Login successful",
                "success"
            );

        }
    );

}


/* =========================================================
   SHOW APPLICATION
========================================================= */

function showApplication() {

    const loginPage =
        document.getElementById("loginPage");

    const appPage =
        document.getElementById("appPage");


    if (loginPage) {

        loginPage.classList.add("hidden");

    }


    if (appPage) {

        appPage.classList.remove("hidden");

    }

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggle() {

    const toggle =
        document.getElementById("togglePassword");

    const password =
        document.getElementById("password");


    if (!toggle || !password) return;


    toggle.addEventListener(
        "click",
        function () {

            if (password.type === "password") {

                password.type = "text";

                toggle.textContent = "🙈";

            } else {

                password.type = "password";

                toggle.textContent = "👁️";

            }

        }
    );

}


/* =========================================================
   UPDATE USER
========================================================= */

function updateWelcomeUser() {

    const username =
        localStorage.getItem(USER_KEY)
        || "User";


    const welcomeUser =
        document.getElementById("welcomeUser");


    if (welcomeUser) {

        welcomeUser.textContent =
            username;

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navButtons =
        document.querySelectorAll(".nav-btn");


    navButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const page =
                        button.getAttribute(
                            "data-page"
                        );


                    if (page) {

                        openPage(page);

                    }

                }
            );

        }
    );

}


/* =========================================================
   OPEN PAGE
========================================================= */

function openPage(pageName) {

    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    sections.forEach(
        function (section) {

            section.classList.add(
                "hidden"
            );

        }
    );


    const selectedSection =
        document.getElementById(
            pageName + "Section"
        );


    if (selectedSection) {

        selectedSection.classList.remove(
            "hidden"
        );

    }


    const navButtons =
        document.querySelectorAll(
            ".nav-btn"
        );


    navButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );


            if (
                button.getAttribute(
                    "data-page"
                ) === pageName
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    if (pageName === "dashboard") {

        updateDashboard();

        renderRecentProducts();

    }


    if (pageName === "products") {

        renderProducts();

    }


    if (pageName === "alerts") {

        renderAlerts();

    }


    if (pageName === "history") {

        renderHistory();

    }


    if (pageName !== "scanner") {

        stopCamera();

    }

}


/* =========================================================
   ADD PRODUCT MODAL
========================================================= */

function openAddProduct() {

    const modal =
        document.getElementById(
            "productModal"
        );

    const form =
        document.getElementById(
            "productForm"
        );

    const title =
        document.getElementById(
            "modalTitle"
        );


    if (!modal) return;


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


    if (title) {

        title.textContent =
            "Add Product";

    }


    modal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CLOSE PRODUCT MODAL
========================================================= */

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


/* =========================================================
   PRODUCT FORM
========================================================= */

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
                )?.value.trim()
                || "";


            const name =
                document.getElementById(
                    "productName"
                )?.value.trim()
                || "";


            const code =
                document.getElementById(
                    "productCode"
                )?.value.trim()
                || "";


            const totalQuantity =
                Number(
                    document.getElementById(
                        "totalQuantity"
                    )?.value
                    || 0
                );


            const soldQuantity =
                Number(
                    document.getElementById(
                        "soldQuantity"
                    )?.value
                    || 0
                );


            const expiryDate =
                document.getElementById(
                    "expiryDate"
                )?.value
                || "";


            if (
                !name ||
                !code ||
                !expiryDate
            ) {

                showToast(
                    "Please fill all required fields",
                    "error"
                );

                return;

            }


            if (totalQuantity < 0) {

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
                    "Sold quantity is invalid",
                    "error"
                );

                return;

            }


            if (editId) {

                const product =
                    products.find(
                        function (p) {

                            return p.id === editId;

                        }
                    );


                if (!product) {

                    showToast(
                        "Product not found",
                        "error"
                    );

                    return;

                }


                product.name =
                    name;

                product.code =
                    code;

                product.totalQuantity =
                    totalQuantity;

                product.soldQuantity =
                    soldQuantity;

                product.expiryDate =
                    expiryDate;

                product.updatedAt =
                    new Date().toISOString();


            } else {

                const duplicate =
                    products.find(
                        function (p) {

                            return (
                                String(p.code)
                                    .toLowerCase()
                                ===
                                code.toLowerCase()
                            );

                        }
                    );


                if (duplicate) {

                    showToast(
                        "Product ID already exists",
                        "error"
                    );

                    return;

                }


                const newProduct = {

                    id:
                        "P" +
                        Date.now(),

                    name:
                        name,

                    code:
                        code,

                    brand:
                        "",

                    batch:
                        "",

                    mrp:
                        0,

                    totalQuantity:
                        totalQuantity,

                    soldQuantity:
                        soldQuantity,

                    expiryDate:
                        expiryDate,

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()

                };


                products.unshift(
                    newProduct
                );

            }


            saveProducts();


            closeProductModal();


            renderProducts();

            renderRecentProducts();

            renderAlerts();

            updateDashboard();


            showToast(
                editId
                    ? "Product updated"
                    : "Product saved successfully",
                "success"
            );

        }
    );

}


/* =========================================================
   AVAILABLE STOCK
========================================================= */

function getAvailableStock(product) {

    return Math.max(
        0,
        Number(
            product.totalQuantity || 0
        )
        -
        Number(
            product.soldQuantity || 0
        )
    );

}


/* =========================================================
   EXPIRY STATUS
========================================================= */

function getExpiryStatus(product) {

    if (!product.expiryDate) {

        return "good";

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
            product.expiryDate
        );

    expiry.setHours(
        0,
        0,
        0,
        0
    );


    if (
        Number.isNaN(
            expiry.getTime()
        )
    ) {

        return "good";

    }


    if (expiry < today) {

        return "expired";

    }


    const difference =
        expiry.getTime()
        -
        today.getTime();


    const days =
        Math.ceil(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (days <= 30) {

        return "soon";

    }


    return "good";

}


/* =========================================================
   PRODUCT STATUS
========================================================= */

function getProductStatus(product) {

    const stock =
        getAvailableStock(product);


    if (stock <= 10) {

        return "low";

    }


    return getExpiryStatus(product);

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (!container) return;


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


    let filter =
        "all";


    const activeFilter =
        document.querySelector(
            ".filter-btn.active"
        );


    if (activeFilter) {

        filter =
            activeFilter.getAttribute(
                "data-filter"
            )
            || "all";

    }


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


                const matchesSearch =
                    !search
                    ||
                    name.includes(search)
                    ||
                    code.includes(search);


                if (!matchesSearch) {

                    return false;

                }


                if (filter === "all") {

                    return true;

                }


                return (
                    getProductStatus(product)
                    === filter
                );

            }
        );


    if (filtered.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div style="font-size:45px;">
                    📦
                </div>

                <h3>
                    No Products Found
                </h3>

                <p>
                    Add a product to your inventory.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                productCardHTML
            )
            .join("");

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function productCardHTML(product) {

    const stock =
        getAvailableStock(product);


    const status =
        getProductStatus(product);


    let statusText =
        "Good";


    if (status === "expired") {

        statusText =
            "Expired";

    }


    if (status === "soon") {

        statusText =
            "Expiring Soon";

    }


    if (status === "low") {

        statusText =
            "Low Stock";

    }


    return `

        <div class="product-card">

            <div class="product-card-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>

                    <small>
                        ID:
                        ${escapeHTML(
                            product.code
                        )}
                    </small>

                </div>


                <span
                    class="status-badge ${status}">

                    ${statusText}

                </span>

            </div>


            <div class="product-info">

                <div>

                    <span>
                        Stock
                    </span>

                    <strong>
                        ${stock}
                    </strong>

                </div>


                <div>

                    <span>
                        Total
                    </span>

                    <strong>
                        ${Number(
                            product.totalQuantity || 0
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Expiry
                    </span>

                    <strong>
                        ${formatDate(
                            product.expiryDate
                        )}
                    </strong>

                </div>

            </div>


            <div class="product-actions">

                <button
                    type="button"
                    onclick="sellProduct('${escapeAttribute(product.id)}')"
                    class="primary-button">

                    💰 Sell

                </button>


                <button
                    type="button"
                    onclick="editProduct('${escapeAttribute(product.id)}')"
                    class="secondary-button">

                    ✏️ Edit

                </button>


                <button
                    type="button"
                    onclick="deleteProduct('${escapeAttribute(product.id)}')"
                    class="secondary-button">

                    🗑️ Delete

                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   RECENT PRODUCTS
========================================================= */

function renderRecentProducts() {

    const container =
        document.getElementById(
            "recentProducts"
        );


    if (!container) return;


    const recent =
        products.slice(
            0,
            5
        );


    if (recent.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div style="font-size:40px;">
                    📦
                </div>

                <h3>
                    No Products Yet
                </h3>

                <p>
                    Add your first product.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        recent
            .map(
                productCardHTML
            )
            .join("");

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            function (p) {

                return p.id === id;

            }
        );


    if (!product) {

        showToast(
            "Product not found",
            "error"
        );

        return;

    }


    const editId =
        document.getElementById(
            "editProductId"
        );


    const name =
        document.getElementById(
            "productName"
        );


    const code =
        document.getElementById(
            "productCode"
        );


    const total =
        document.getElementById(
            "totalQuantity"
        );


    const sold =
        document.getElementById(
            "soldQuantity"
        );


    const expiry =
        document.getElementById(
            "expiryDate"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    if (editId) {

        editId.value =
            product.id;

    }


    if (name) {

        name.value =
            product.name || "";

    }


    if (code) {

        code.value =
            product.code || "";

    }


    if (total) {

        total.value =
            product.totalQuantity || 0;

    }


    if (sold) {

        sold.value =
            product.soldQuantity || 0;

    }


    if (expiry) {

        expiry.value =
            product.expiryDate || "";

    }


    if (title) {

        title.textContent =
            "Edit Product";

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

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(id) {

    const product =
        products.find(
            function (p) {

                return p.id === id;

            }
        );


    if (!product) return;


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) return;


    products =
        products.filter(
            function (p) {

                return p.id !== id;

            }
        );


    saveProducts();


    renderProducts();

    renderRecentProducts();

    renderAlerts();

    updateDashboard();


    showToast(
        "Product deleted",
        "success"
    );

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    input.addEventListener(
        "input",
        function () {

            renderProducts();

        }
    );

}


/* =========================================================
   FILTER
========================================================= */

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
                        function (b) {

                            b.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    renderProducts();

                }
            );

        }
    );

}


/* =========================================================
   SELL PRODUCT
========================================================= */

function sellProduct(id) {

    const product =
        products.find(
            function (p) {

                return p.id === id;

            }
        );


    if (!product) return;


    selectedSellProductId =
        id;


    const available =
        getAvailableStock(
            product
        );


    const nameElement =
        document.getElementById(
            "sellProductName"
        );


    const stockElement =
        document.getElementById(
            "availableStock"
        );


    const quantityElement =
        document.getElementById(
            "sellQuantity"
        );


    if (nameElement) {

        nameElement.textContent =
            product.name;

    }


    if (stockElement) {

        stockElement.textContent =
            available;

    }


    if (quantityElement) {

        quantityElement.value =
            1;

        quantityElement.max =
            available;

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


/* =========================================================
   CLOSE SELL MODAL
========================================================= */

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


    selectedSellProductId =
        null;

}


/* =========================================================
   SETUP SELL
========================================================= */

function setupSell() {

    const button =
        document.getElementById(
            "confirmSellBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            if (!selectedSellProductId) {

                return;

            }


            const product =
                products.find(
                    function (p) {

                        return (
                            p.id
                            ===
                            selectedSellProductId
                        );

                    }
                );


            if (!product) return;


            const quantity =
                Number(
                    document.getElementById(
                        "sellQuantity"
                    )?.value
                    || 0
                );


            const available =
                getAvailableStock(
                    product
                );


            if (
                !Number.isInteger(quantity)
                ||
                quantity <= 0
            ) {

                showToast(
                    "Enter valid quantity",
                    "error"
                );

                return;

            }


            if (
                quantity > available
            ) {

                showToast(
                    "Not enough stock",
                    "error"
                );

                return;

            }


            product.soldQuantity =
                Number(
                    product.soldQuantity || 0
                )
                +
                quantity;


            salesHistory.unshift({

                id:
                    "S" +
                    Date.now(),

                productId:
                    product.id,

                productCode:
                    product.code,

                productName:
                    product.name,

                quantity:
                    quantity,

                total:
                    Number(
                        product.mrp || 0
                    )
                    *
                    quantity,

                paymentMethod:
                    "cash",

                date:
                    new Date().toISOString()

            });


            saveProducts();

            saveHistory();


            closeSellModal();


            renderProducts();

            renderRecentProducts();

            renderHistory();

            renderAlerts();

            updateDashboard();


            showToast(
                "Sale recorded successfully",
                "success"
            );

        }
    );

}


/* =========================================================
   BILLING
========================================================= */

function setupBilling() {

    const input =
        document.getElementById(
            "billingProductId"
        );


    if (!input) return;


    input.addEventListener(
        "input",
        function () {

            const code =
                input.value
                    .trim()
                    .toLowerCase();


            const details =
                document.getElementById(
                    "billingProductDetails"
                );


            const message =
                document.getElementById(
                    "billingMessage"
                );


            if (!code) {

                if (details) {

                    details.classList.add(
                        "hidden"
                    );

                }


                if (message) {

                    message.textContent =
                        "Enter a valid Product ID to load the product details.";

                }

                return;

            }


            const product =
                products.find(
                    function (p) {

                        return (
                            String(
                                p.code || ""
                            )
                            .toLowerCase()
                            === code
                        );

                    }
                );


            if (!product) {

                if (details) {

                    details.classList.add(
                        "hidden"
                    );

                }


                if (message) {

                    message.textContent =
                        "Product not found.";

                }

                return;

            }


            const name =
                document.getElementById(
                    "billingProductName"
                );


            const brand =
                document.getElementById(
                    "billingBrand"
                );


            const stock =
                document.getElementById(
                    "billingAvailableStock"
                );


            const price =
                document.getElementById(
                    "billingPrice"
                );


            if (name) {

                name.value =
                    product.name || "";

            }


            if (brand) {

                brand.value =
                    product.brand || "";

            }


            if (stock) {

                stock.value =
                    getAvailableStock(
                        product
                    );

            }


            if (price) {

                price.value =
                    product.mrp || 0;

            }


            const quantity =
                document.getElementById(
                    "billingQuantity"
                );


            if (quantity) {

                quantity.max =
                    getAvailableStock(
                        product
                    );

            }


            updateBillingTotal();


            if (details) {

                details.classList.remove(
                    "hidden"
                );

            }


            if (message) {

                message.textContent =
                    "Product found successfully.";

            }

        }
    );


    const quantity =
        document.getElementById(
            "billingQuantity"
        );


    if (quantity) {

        quantity.addEventListener(
            "input",
            updateBillingTotal
        );

    }


    const payButton =
        document.getElementById(
            "payBillBtn"
        );


    if (payButton) {

        payButton.addEventListener(
            "click",
            generateBill
        );

    }

}


/* =========================================================
   BILL TOTAL
========================================================= */

function updateBillingTotal() {

    const price =
        Number(
            document.getElementById(
                "billingPrice"
            )?.value
            || 0
        );


    const quantity =
        Number(
            document.getElementById(
                "billingQuantity"
            )?.value
            || 0
        );


    const total =
        price *
        quantity;


    const output =
        document.getElementById(
            "billingTotalAmount"
        );


    if (output) {

        output.textContent =
            "₹" +
            total.toFixed(2);

    }

}


/* =========================================================
   GENERATE BILL
========================================================= */

function generateBill() {

    const code =
        document.getElementById(
            "billingProductId"
        )?.value
        .trim()
        .toLowerCase()
        || "";


    const quantity =
        Number(
            document.getElementById(
                "billingQuantity"
            )?.value
            || 0
        );


    const payment =
        document.getElementById(
            "paymentMethod"
        )?.value
        || "cash";


    const product =
        products.find(
            function (p) {

                return (
                    String(
                        p.code || ""
                    )
                    .toLowerCase()
                    === code
                );

            }
        );


    if (!product) {

        showToast(
            "Product not found",
            "error"
        );

        return;

    }


    const available =
        getAvailableStock(
            product
        );


    if (
        !Number.isInteger(quantity)
        ||
        quantity <= 0
        ||
        quantity > available
    ) {

        showToast(
            "Invalid quantity",
            "error"
        );

        return;

    }


    product.soldQuantity =
        Number(
            product.soldQuantity || 0
        )
        +
        quantity;


    const total =
        Number(
            product.mrp || 0
        )
        *
        quantity;


    salesHistory.unshift({

        id:
            "B" +
            Date.now(),

        productId:
            product.id,

        productCode:
            product.code,

        productName:
            product.name,

        quantity:
            quantity,

        total:
            total,

        paymentMethod:
            payment,

        date:
            new Date().toISOString()

    });


    saveProducts();

    saveHistory();


    showToast(
        "Bill generated successfully",
        "success"
    );


    const productIdInput =
        document.getElementById(
            "billingProductId"
        );


    const details =
        document.getElementById(
            "billingProductDetails"
        );


    if (productIdInput) {

        productIdInput.value =
            "";

    }


    if (details) {

        details.classList.add(
            "hidden"
        );

    }


    renderProducts();

    renderRecentProducts();

    renderHistory();

    renderAlerts();

    updateDashboard();

}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    const container =
        document.getElementById(
            "historyList"
        );


    if (!container) return;


    if (salesHistory.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div style="font-size:40px;">
                    📜
                </div>

                <h3>
                    No Sales History
                </h3>

                <p>
                    Sales will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        salesHistory
            .slice(0, 50)
            .map(
                function (sale) {

                    return `

                        <div class="history-card">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        sale.productName
                                    )}
                                </strong>

                                <small>
                                    ID:
                                    ${escapeHTML(
                                        sale.productCode
                                    )}
                                </small>

                            </div>


                            <div>

                                <strong>
                                    ${Number(
                                        sale.quantity || 0
                                    )}
                                </strong>

                                <small>
                                    ${formatDateTime(
                                        sale.date
                                    )}
                                </small>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ALERTS
========================================================= */

function renderAlerts() {

    const container =
        document.getElementById(
            "alertList"
        );


    if (!container) return;


    const alerts =
        products.filter(
            function (product) {

                const status =
                    getProductStatus(
                        product
                    );


                return (
                    status === "expired"
                    ||
                    status === "soon"
                    ||
                    status === "low"
                );

            }
        );


    if (alerts.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div style="font-size:40px;">
                    ✅
                </div>

                <h3>
                    No Alerts
                </h3>

                <p>
                    All products are currently okay.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        alerts
            .map(
                function (product) {

                    const status =
                        getProductStatus(
                            product
                        );


                    let title =
                        "Low Stock";


                    if (
                        status === "expired"
                    ) {

                        title =
                            "Product Expired";

                    }


                    if (
                        status === "soon"
                    ) {

                        title =
                            "Expiring Soon";

                    }


                    return `

                        <div class="alert-card">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                                <p>
                                    ${title}
                                </p>

                            </div>


                            <div>

                                Stock:
                                ${getAvailableStock(
                                    product
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    const totalStock =
        document.getElementById(
            "totalStock"
        );


    const lowStock =
        document.getElementById(
            "lowStock"
        );


    const expiringSoon =
        document.getElementById(
            "expiringSoon"
        );


    const total =
        products.length;


    const stock =
        products.reduce(
            function (sum, product) {

                return (
                    sum
                    +
                    getAvailableStock(
                        product
                    )
                );

            },
            0
        );


    const low =
        products.filter(
            function (product) {

                return (
                    getAvailableStock(
                        product
                    ) <= 10
                );

            }
        ).length;


    const soon =
        products.filter(
            function (product) {

                return (
                    getExpiryStatus(
                        product
                    ) === "soon"
                );

            }
        ).length;


    if (totalProducts) {

        totalProducts.textContent =
            total;

    }


    if (totalStock) {

        totalStock.textContent =
            stock;

    }


    if (lowStock) {

        lowStock.textContent =
            low;

    }


    if (expiringSoon) {

        expiringSoon.textContent =
            soon;

    }

}


/* =========================================================
   =========================================================
   CAMERA SYSTEM
   =========================================================
========================================================= */


/*
   IMPORTANT:

   This camera system DOES NOT use:

       input.click()

   Therefore it will NOT open the normal file picker.

   It uses:

       navigator.mediaDevices.getUserMedia()

   to open the actual device camera.

   The captured image is converted temporarily
   to a data URL only in memory.

   We DO NOT put the photo into localStorage.

   We DO NOT put the photo into products[].

   We DO NOT save frontPhotoData/backPhotoData
   permanently.

*/


/* =========================================================
   SETUP CAMERA
========================================================= */

function setupCamera() {

    const frontButton =
        document.getElementById(
            "frontCameraBtn"
        );


    const backButton =
        document.getElementById(
            "backCameraBtn"
        );


    const clearButton =
        document.getElementById(
            "clearPhotosBtn"
        );


    const processButton =
        document.getElementById(
            "processPhotosBtn"
        );


    if (frontButton) {

        frontButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                openRealCamera(
                    "front"
                );

            }
        );

    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                openRealCamera(
                    "back"
                );

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                clearCameraPhotos();

            }
        );

    }


    if (processButton) {

        processButton.addEventListener(
            "click",
            function () {

                processProductPhotos();

            }
        );

    }

}


/* =========================================================
   OPEN REAL CAMERA
========================================================= */

async function openRealCamera(side) {

    currentCameraSide =
        side;


    stopCamera();


    if (
        !navigator.mediaDevices
        ||
        !navigator.mediaDevices.getUserMedia
    ) {

        setCameraMessage(
            "Camera is not supported in this browser. Please use Chrome/Edge with localhost or HTTPS."
        );


        showToast(
            "Camera is not supported",
            "error"
        );

        return;

    }


    try {

        /*
           Rear camera is preferred.
        */

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: "environment"
                    },

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }

                },

                audio: false

            });


        showCameraModal();


        const video =
            document.getElementById(
                "liveCameraVideo"
            );


        if (!video) {

            stopCamera();

            return;

        }


        video.srcObject =
            cameraStream;


        await video.play();


        const cameraTitle =
            document.getElementById(
                "liveCameraTitle"
            );


        const cameraInstruction =
            document.getElementById(
                "liveCameraInstruction"
            );


        if (cameraTitle) {

            cameraTitle.textContent =
                side === "front"
                    ? "Front Product Camera"
                    : "Back Product Camera";

        }


        if (cameraInstruction) {

            cameraInstruction.textContent =
                side === "front"
                    ? "Position the FRONT side of the product and press Capture."
                    : "Turn the product around. Position the BACK side and press Capture.";

        }


        setCameraMessage(
            side === "front"
                ? "Front camera opened."
                : "Back camera opened."
        );


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        stopCamera();


        let message =
            "Unable to open camera.";


        if (
            error.name ===
            "NotAllowedError"
        ) {

            message =
                "Camera permission denied. Please click the camera icon in the browser address bar and allow camera access.";

        }


        if (
            error.name ===
            "NotFoundError"
        ) {

            message =
                "No camera was found on this device.";

        }


        if (
            error.name ===
            "NotReadableError"
        ) {

            message =
                "Camera is already being used by another application.";

        }


        if (
            error.name ===
            "SecurityError"
        ) {

            message =
                "Camera requires HTTPS or localhost.";

        }


        setCameraMessage(
            message
        );


        showToast(
            message,
            "error"
        );

    }

}


/* =========================================================
   CAMERA MODAL
========================================================= */

function showCameraModal() {

    let modal =
        document.getElementById(
            "liveCameraModal"
        );


    /*
       If modal does not exist in index.html,
       create it automatically.
    */

    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "liveCameraModal";


        modal.innerHTML = `

            <div
                style="
                    position:fixed;
                    inset:0;
                    background:#000;
                    z-index:99999;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                "
            >

                <div
                    style="
                        width:100%;
                        max-width:700px;
                        color:white;
                        text-align:center;
                    "
                >

                    <h2
                        id="liveCameraTitle"
                        style="
                            margin:0 0 8px;
                            font-size:24px;
                        "
                    >
                        Product Camera
                    </h2>


                    <p
                        id="liveCameraInstruction"
                        style="
                            margin:0 0 15px;
                            opacity:.85;
                        "
                    >
                        Position the product.
                    </p>


                    <div
                        style="
                            width:100%;
                            background:#111;
                            border-radius:18px;
                            overflow:hidden;
                            position:relative;
                        "
                    >

                        <video
                            id="liveCameraVideo"
                            autoplay
                            playsinline
                            muted
                            style="
                                display:block;
                                width:100%;
                                max-height:70vh;
                                object-fit:cover;
                            "
                        ></video>

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:12px;
                            justify-content:center;
                            margin-top:18px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            type="button"
                            id="captureCameraBtn"
                            style="
                                border:none;
                                border-radius:14px;
                                padding:14px 24px;
                                font-size:17px;
                                font-weight:700;
                                cursor:pointer;
                            "
                        >
                            📸 Capture
                        </button>


                        <button
                            type="button"
                            id="closeCameraBtn"
                            style="
                                border:none;
                                border-radius:14px;
                                padding:14px 24px;
                                font-size:17px;
                                font-weight:700;
                                cursor:pointer;
                            "
                        >
                            ✕ Close
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const captureButton =
            document.getElementById(
                "captureCameraBtn"
            );


        const closeButton =
            document.getElementById(
                "closeCameraBtn"
            );


        if (captureButton) {

            captureButton.addEventListener(
                "click",
                captureCameraPhoto
            );

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function () {

                    closeCameraModal();

                }
            );

        }

    }


    modal.style.display =
        "flex";

}


/* =========================================================
   CAPTURE CAMERA PHOTO
========================================================= */

function captureCameraPhoto() {

    const video =
        document.getElementById(
            "liveCameraVideo"
        );


    if (
        !video
        ||
        !cameraStream
    ) {

        showToast(
            "Camera is not active",
            "error"
        );

        return;

    }


    if (
        video.readyState
        <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        showToast(
            "Camera is not ready yet",
            "error"
        );

        return;

    }


    const canvas =
        document.createElement(
            "canvas"
        );


    const width =
        video.videoWidth
        ||
        1280;


    const height =
        video.videoHeight
        ||
        720;


    canvas.width =
        width;


    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        showToast(
            "Unable to capture photo",
            "error"
        );

        return;

    }


    context.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    /*
       Temporary image only.

       It is NOT saved to localStorage.
    */

    const imageData =
        canvas.toDataURL(
            "image/jpeg",
            0.85
        );


    if (
        currentCameraSide
        ===
        "front"
    ) {

        frontPhotoData =
            imageData;


        displayCapturedPhoto(
            "front",
            imageData
        );


        setCameraMessage(
            "Front photo captured. Now capture the back photo."
        );


        showToast(
            "Front photo captured",
            "success"
        );

    } else {

        backPhotoData =
            imageData;


        displayCapturedPhoto(
            "back",
            imageData
        );


        setCameraMessage(
            "Back photo captured successfully. Click Get Product Details."
        );


        showToast(
            "Back photo captured",
            "success"
        );

    }


    closeCameraModal();

}


/* =========================================================
   DISPLAY CAPTURED PHOTO
========================================================= */

function displayCapturedPhoto(
    side,
    imageData
) {

    const previewId =
        side === "front"
            ? "frontPhotoPreview"
            : "backPhotoPreview";


    const preview =
        document.getElementById(
            previewId
        );


    if (!preview) return;


    preview.style.position =
        "relative";


    preview.innerHTML = `

        <img
            src="${imageData}"
            alt="${side} product photo"
            style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:12px;
            "
        >

        <div
            style="
                position:absolute;
                left:8px;
                right:8px;
                bottom:8px;
                background:rgba(0,0,0,.70);
                color:#fff;
                padding:7px;
                border-radius:8px;
                text-align:center;
                font-weight:700;
            "
        >
            ${
                side === "front"
                    ? "Front Photo ✓"
                    : "Back Photo ✓"
            }
        </div>

    `;

}


/* =========================================================
   CLOSE CAMERA MODAL
========================================================= */

function closeCameraModal() {

    const modal =
        document.getElementById(
            "liveCameraModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    stopCamera();

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );

        cameraStream =
            null;

    }


    const video =
        document.getElementById(
            "liveCameraVideo"
        );


    if (video) {

        video.pause();

        video.srcObject =
            null;

    }

}


/* =========================================================
   CAMERA MESSAGE
========================================================= */

function setCameraMessage(
    message
) {

    const element =
        document.getElementById(
            "cameraMessage"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   CLEAR CAMERA PHOTOS
========================================================= */

function clearCameraPhotos() {

    /*
       Remove temporary references.
    */

    frontPhotoData =
        null;

    backPhotoData =
        null;


    currentCameraSide =
        null;


    stopCamera();


    closeCameraModal();


    const frontPreview =
        document.getElementById(
            "frontPhotoPreview"
        );


    const backPreview =
        document.getElementById(
            "backPhotoPreview"
        );


    if (frontPreview) {

        frontPreview.innerHTML = `

            <span>📷</span>

            <strong>
                Front Photo
            </strong>

            <small>
                Take front side photo
            </small>

        `;

    }


    if (backPreview) {

        backPreview.innerHTML = `

            <span>📷</span>

            <strong>
                Back Photo
            </strong>

            <small>
                Take back side photo
            </small>

        `;

    }


    const result =
        document.getElementById(
            "photoProductResult"
        );


    if (result) {

        result.classList.add(
            "hidden"
        );

    }


    clearPhotoDetails();


    setCameraMessage(
        "Take both front and back photos. Product details will be prepared automatically by the system."
    );


    showToast(
        "Photos cleared",
        "success"
    );

}


/* =========================================================
   CLEAR PHOTO DETAILS
========================================================= */

function clearPhotoDetails() {

    const fields = [

        "photoProductName",

        "photoProductId",

        "photoBrand",

        "photoBatch",

        "photoMrp",

        "photoQuantity",

        "photoExpiryDate",

        "photoSoldQuantity"

    ];


    fields.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                if (
                    id ===
                    "photoSoldQuantity"
                ) {

                    element.value =
                        "0";

                } else {

                    element.value =
                        "";

                }

            }

        }
    );

}


/* =========================================================
   PROCESS PRODUCT PHOTOS
========================================================= */

function processProductPhotos() {

    if (!frontPhotoData) {

        setCameraMessage(
            "Please capture the FRONT photo first."
        );


        showToast(
            "Front photo required",
            "error"
        );

        return;

    }


    if (!backPhotoData) {

        setCameraMessage(
            "Please capture the BACK photo."
        );


        showToast(
            "Back photo required",
            "error"
        );

        return;

    }


    const result =
        document.getElementById(
            "photoProductResult"
        );


    if (result) {

        result.classList.remove(
            "hidden"
        );

    }


    const productIdInput =
        document.getElementById(
            "photoProductId"
        );


    /*
       Generate a Product ID.

       This is ONLY product data.
       Photo is not saved.
    */

    if (
        productIdInput
        &&
        !productIdInput.value.trim()
    ) {

        productIdInput.value =
            "P" +
            Date.now();

    }


    setCameraMessage(
        "Both photos captured successfully. Enter/check the product details below. Only product details will be saved."
    );


    showToast(
        "Photos processed successfully",
        "success"
    );

}


/* =========================================================
   SAVE PHOTO PRODUCT DETAILS
========================================================= */

function savePhotoProductDetails() {

    const name =
        document.getElementById(
            "photoProductName"
        )?.value.trim()
        || "";


    const productId =
        document.getElementById(
            "photoProductId"
        )?.value.trim()
        || "";


    const brand =
        document.getElementById(
            "photoBrand"
        )?.value.trim()
        || "";


    const batch =
        document.getElementById(
            "photoBatch"
        )?.value.trim()
        || "";


    const mrp =
        Number(
            document.getElementById(
                "photoMrp"
            )?.value
            || 0
        );


    const quantity =
        Number(
            document.getElementById(
                "photoQuantity"
            )?.value
            || 0
        );


    const expiryDate =
        document.getElementById(
            "photoExpiryDate"
        )?.value
        || "";


    const soldQuantity =
        Number(
            document.getElementById(
                "photoSoldQuantity"
            )?.value
            || 0
        );


    if (!name) {

        showToast(
            "Enter product name",
            "error"
        );

        return;

    }


    if (!productId) {

        showToast(
            "Product ID required",
            "error"
        );

        return;

    }


    if (quantity < 0) {

        showToast(
            "Invalid quantity",
            "error"
        );

        return;

    }


    if (!expiryDate) {

        showToast(
            "Enter expiry date",
            "error"
        );

        return;

    }


    if (
        soldQuantity < 0
        ||
        soldQuantity > quantity
    ) {

        showToast(
            "Invalid sold quantity",
            "error"
        );

        return;

    }


    const duplicate =
        products.find(
            function (p) {

                return (
                    String(
                        p.code || ""
                    )
                    .toLowerCase()
                    ===
                    productId.toLowerCase()
                );

            }
        );


    if (duplicate) {

        showToast(
            "Product ID already exists",
            "error"
        );

        return;

    }


    /*
       IMPORTANT:

       The photo is NOT included here.

       No frontPhotoData.
       No backPhotoData.

       Only product information is saved.
    */

    const product = {

        id:
            "P" +
            Date.now(),

        name:
            name,

        code:
            productId,

        brand:
            brand,

        batch:
            batch,

        mrp:
            mrp,

        totalQuantity:
            quantity,

        soldQuantity:
            soldQuantity,

        expiryDate:
            expiryDate,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    products.unshift(
        product
    );


    saveProducts();


    /*
       Immediately remove temporary
       camera image data.
    */

    frontPhotoData =
        null;

    backPhotoData =
        null;


    currentCameraSide =
        null;


    stopCamera();


    clearCameraPhotosWithoutToast();


    renderProducts();

    renderRecentProducts();

    renderAlerts();

    updateDashboard();


    showToast(
        "Product details saved successfully",
        "success"
    );


    openPage(
        "products"
    );

}


/* =========================================================
   CLEAR CAMERA WITHOUT TOAST
========================================================= */

function clearCameraPhotosWithoutToast() {

    frontPhotoData =
        null;

    backPhotoData =
        null;


    stopCamera();


    const frontPreview =
        document.getElementById(
            "frontPhotoPreview"
        );


    const backPreview =
        document.getElementById(
            "backPhotoPreview"
        );


    if (frontPreview) {

        frontPreview.innerHTML = `

            <span>📷</span>

            <strong>
                Front Photo
            </strong>

            <small>
                Take front side photo
            </small>

        `;

    }


    if (backPreview) {

        backPreview.innerHTML = `

            <span>📷</span>

            <strong>
                Back Photo
            </strong>

            <small>
                Take back side photo
            </small>

        `;

    }


    const result =
        document.getElementById(
            "photoProductResult"
        );


    if (result) {

        result.classList.add(
            "hidden"
        );

    }


    clearPhotoDetails();

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const button =
        document.getElementById(
            "logoutBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Do you want to logout?"
                );


            if (!confirmed) return;


            stopCamera();


            const appPage =
                document.getElementById(
                    "appPage"
                );


            const loginPage =
                document.getElementById(
                    "loginPage"
                );


            if (appPage) {

                appPage.classList.add(
                    "hidden"
                );

            }


            if (loginPage) {

                loginPage.classList.remove(
                    "hidden"
                );

            }


            showToast(
                "Logged out",
                "success"
            );

        }
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function enableNotifications() {

    if (
        !("Notification" in window)
    ) {

        showToast(
            "Notifications are not supported",
            "error"
        );

        return;

    }


    Notification
        .requestPermission()
        .then(
            function (permission) {

                if (
                    permission ===
                    "granted"
                ) {

                    showToast(
                        "Notifications enabled",
                        "success"
                    );

                } else {

                    showToast(
                        "Notification permission denied",
                        "error"
                    );

                }

            }
        )
        .catch(
            function () {

                showToast(
                    "Unable to enable notifications",
                    "error"
                );

            }
        );

}


/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

function setupNotificationButton() {

    const button =
        document.getElementById(
            "notificationBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            openPage(
                "alerts"
            );

        }
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN"
    );

}


/* =========================================================
   DATE + TIME
========================================================= */

function formatDateTime(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null
        ||
        value === undefined
    ) {

        return "";

    }


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


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const text =
        document.getElementById(
            "toastText"
        );


    const icon =
        document.getElementById(
            "toastIcon"
        );


    if (!toast) return;


    if (text) {

        text.textContent =
            message;

    }


    if (icon) {

        icon.textContent =
            type === "error"
                ? "!"
                : "✓";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openPage =
    openPage;


window.openAddProduct =
    openAddProduct;


window.closeProductModal =
    closeProductModal;


window.editProduct =
    editProduct;


window.deleteProduct =
    deleteProduct;


window.sellProduct =
    sellProduct;


window.closeSellModal =
    closeSellModal;


window.enableNotifications =
    enableNotifications;


window.savePhotoProductDetails =
    savePhotoProductDetails;


window.clearCameraPhotos =
    clearCameraPhotos;


window.processProductPhotos =
    processProductPhotos;


/* =========================================================
   EXISTING LOGIN CHECK
========================================================= */

function checkExistingLogin() {

    const savedUser =
        localStorage.getItem(
            USER_KEY
        );


    if (savedUser) {

        showApplication();

        updateWelcomeUser();

    }

}


/* =========================================================
   PAGE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        /*
           Camera is stopped when
           page is closed/refreshed.

           Temporary photo data is
           not stored in localStorage.
        */

        stopCamera();

        frontPhotoData =
            null;

        backPhotoData =
            null;

    }
);


/* =========================================================
   END OF SCRIPT
========================================================= */