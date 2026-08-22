document.addEventListener("DOMContentLoaded", () => {

    const userData =
        localStorage.getItem("ppmUser");


    /*
     * User has not accepted the declaration.
     */

    if (!userData) {

        window.location.href =
            "index.html";

        return;
    }


    let user;

    try {

        user =
            JSON.parse(userData);

    } catch (error) {

        localStorage.removeItem("ppmUser");

        window.location.href =
            "index.html";

        return;
    }


    /*
     * Display the actual visitor's name.
     */

    const userChip =
        document.getElementById("userChip");

    if (userChip && user.name) {

        userChip.textContent =
            `Welcome, ${user.name}`;

    }


    /*
     * Logout
     */

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "ppmUser"
                );

                window.location.href =
                    "index.html";

            }
        );

    }


    /*
     * Theme
     */

    const themeToggle =
        document.getElementById("themeToggle");


    const savedTheme =
        localStorage.getItem("ppmTheme");


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

    }


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "dark-theme"
                );


                const isDark =
                    document.body.classList.contains(
                        "dark-theme"
                    );


                localStorage.setItem(
                    "ppmTheme",
                    isDark ? "dark" : "light"
                );

            }
        );

    }

});