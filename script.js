// ==========================================
// PRODUCT DATA
// ==========================================

let products = JSON.parse(localStorage.getItem("products")) || [];


// ==========================================
// NOTIFICATION PERMISSION
// ==========================================

function requestNotificationPermission() {

    if ("Notification" in window) {

        if (Notification.permission === "default") {

            Notification.requestPermission().then(function(permission) {

                if (permission === "granted") {

                    console.log(
                        "Notification permission granted"
                    );

                }

            });

        }

    }

}


// ==========================================
// SEND PHONE / SYSTEM NOTIFICATION
// ==========================================

function sendNotification(title, message) {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }


    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.ready.then(function(registration) {

            registration.showNotification(
                title,
                {
                    body: message,
                    vibrate: [200, 100, 200]
                }
            );

        });

    }

}


// ==========================================
// GET DAYS LEFT
// ==========================================

function getDaysLeft(expiryDate) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const expiry = new Date(expiryDate);

    expiry.setHours(0, 0, 0, 0);


    const difference = expiry - today;


    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

}


// ==========================================
// SHOW PRODUCT NOTIFICATION
// ==========================================

function showExpiryNotification(product) {

    const daysLeft =
        getDaysLeft(product.expiryDate);


    if (daysLeft < 0) {

        sendNotification(
            "Product Expiry Alert 🔔",
            product.productName +
            " is expired!"
        );

    }

    else if (daysLeft === 0) {

        sendNotification(
            "Product Expiry Alert 🔔",
            product.productName +
            " expires today!"
        );

    }

    else if (daysLeft <= 10) {

        sendNotification(
            "Product Expiry Alert 🔔",
            product.productName +
            " will expire in " +
            daysLeft +
            " days!"
        );

    }

}


// ==========================================
// CHECK ALL PRODUCTS
// ==========================================

function checkAllExpiryNotifications() {

    let notifications = [];


    products.forEach(function(product) {

        const daysLeft =
            getDaysLeft(product.expiryDate);


        // Expired
        if (daysLeft < 0) {

            notifications.push(
                "❌ " +
                product.productName +
                " is expired!"
            );

        }


        // Expires today
        else if (daysLeft === 0) {

            notifications.push(
                "🔔 " +
                product.productName +
                " expires today!"
            );

        }


        // Expiring soon
        else if (daysLeft <= 10) {

            notifications.push(
                "⚠️ " +
                product.productName +
                " will expire in " +
                daysLeft +
                " days!"
            );

        }

    });


    // ======================================
    // SHOW ALL NOTIFICATIONS IN BOX
    // ======================================

    const notificationList =
        document.getElementById(
            "notificationList"
        );


    if (notifications.length > 0) {

        notificationList.innerHTML =
            notifications.join("<br><br>");

    }

    else {

        notificationList.textContent =
            "No notifications";

    }

}


// ==========================================
// SAVE PRODUCT
// ==========================================

function addProduct() {

    const productId =
        document.getElementById(
            "productId"
        ).value.trim();


    const productName =
        document.getElementById(
            "productName"
        ).value.trim();


    const batchNo =
        document.getElementById(
            "batchNo"
        ).value.trim();


    const quantity =
        document.getElementById(
            "quantity"
        ).value.trim();


    const expiryDate =
        document.getElementById(
            "expiryDate"
        ).value;


    // Check empty fields
    if (
        productId === "" ||
        productName === "" ||
        batchNo === "" ||
        quantity === "" ||
        expiryDate === ""
    ) {

        alert(
            "Please enter all product details!"
        );

        return;

    }


    // Calculate expiry days
    const daysLeft =
        getDaysLeft(expiryDate);


    // Find status
    let status;


    if (daysLeft < 0) {

        status = "❌ Expired";

    }

    else if (daysLeft <= 10) {

        status = "⚠️ Expiring Soon";

    }

    else {

        status = "✅ Safe";

    }


    // Create product object
    const product = {

        productId: productId,

        productName: productName,

        batchNo: batchNo,

        quantity: quantity,

        expiryDate: expiryDate

    };


    // Add product
    products.push(product);


    // Save product
    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


    // Display products
    displayProducts();


    // ======================================
    // OLD ALERT MESSAGE
    // ======================================

    if (daysLeft < 0) {

        document.getElementById(
            "alertBox"
        ).textContent =
            "❌ ALERT: " +
            productName +
            " is expired!";

    }

    else if (daysLeft === 0) {

        document.getElementById(
            "alertBox"
        ).textContent =
            "🔔 ALERT: " +
            productName +
            " expires today!";

    }

    else if (daysLeft <= 10) {

        document.getElementById(
            "alertBox"
        ).textContent =
            "⚠️ ALERT: " +
            productName +
            " will expire in " +
            daysLeft +
            " days!";

    }

    else {

        document.getElementById(
            "alertBox"
        ).textContent =
            "✅ Product added successfully!";

    }


    // ======================================
    // PHONE NOTIFICATION
    // ======================================

    showExpiryNotification(product);


    // ======================================
    // CLEAR INPUTS
    // ======================================

    document.getElementById(
        "productId"
    ).value = "";

    document.getElementById(
        "productName"
    ).value = "";

    document.getElementById(
        "batchNo"
    ).value = "";

    document.getElementById(
        "quantity"
    ).value = "";

    document.getElementById(
        "expiryDate"
    ).value = "";


    // ======================================
    // UPDATE NOTIFICATION BOX
    // ======================================

    checkAllExpiryNotifications();

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts() {

    const table =
        document.getElementById(
            "productTable"
        );


    table.innerHTML = "";


    products.forEach(function(product) {

        const row =
            table.insertRow();


        row.insertCell(0).textContent =
            product.productId;


        row.insertCell(1).textContent =
            product.productName;


        row.insertCell(2).textContent =
            product.batchNo;


        row.insertCell(3).textContent =
            product.quantity;


        row.insertCell(4).textContent =
            product.expiryDate;


        const daysLeft =
            getDaysLeft(
                product.expiryDate
            );


        let status;


        if (daysLeft < 0) {

            status = "❌ Expired";

        }

        else if (daysLeft <= 10) {

            status = "⚠️ Expiring Soon";

        }

        else {

            status = "✅ Safe";

        }


        row.insertCell(5).textContent =
            status;

    });

}


// ==========================================
// QR CODE SCANNER
// ==========================================

function onScanSuccess(decodedText) {

    /*
       QR Code format:

       P001,Milk,B101,10,2026-09-10
    */


    const data =
        decodedText.split(",");


    if (data.length === 5) {

        document.getElementById(
            "productId"
        ).value = data[0];


        document.getElementById(
            "productName"
        ).value = data[1];


        document.getElementById(
            "batchNo"
        ).value = data[2];


        document.getElementById(
            "quantity"
        ).value = data[3];


        document.getElementById(
            "expiryDate"
        ).value = data[4];


        document.getElementById(
            "scanMessage"
        ).textContent =
            "✅ QR scanned successfully!";

    }

    else {

        document.getElementById(
            "scanMessage"
        ).textContent =
            "❌ Invalid QR Code!";

    }

}


// ==========================================
// QR SCAN ERROR
// ==========================================

function onScanError(error) {

    // Scanner continuously checks for QR code

}


// ==========================================
// START QR SCANNER
// ==========================================

const scanner =
    new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,
            qrbox: 250
        }
    );


scanner.render(
    onScanSuccess,
    onScanError
);


// ==========================================
// LOAD OLD PRODUCTS
// ==========================================

window.addEventListener(
    "load",
    function() {

        // Request notification permission
        requestNotificationPermission();


        // Display old products
        displayProducts();


        // Check all old products
        setTimeout(
            function() {

                checkAllExpiryNotifications();

            },
            1000
        );

    }
);