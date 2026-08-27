self.addEventListener(
    "install",
    function () {

        console.log(
            "Service Worker Installed"
        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    function () {

        console.log(
            "Service Worker Activated"
        );

        self.clients.claim();

    }
);


// ==========================================
// PUSH NOTIFICATION
// ==========================================

self.addEventListener(
    "push",
    function (event) {

        const data =
            event.data
                ? event.data.json()
                : {
                    title:
                        "Product Expiry Alert 🔔",

                    body:
                        "A product is going to expire!"
                };


        event.waitUntil(

            self.registration.showNotification(

                data.title,

                {
                    body:
                        data.body,

                    icon:
                        "./icon-192.png",

                    badge:
                        "./icon-192.png",

                    vibrate:
                        [200, 100, 200]
                }

            )

        );

    }
);