document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // LIVE DATE & TIME
    // =========================================================

    const liveDate = document.getElementById("liveDate");
    const liveTime = document.getElementById("liveTime");

    function updateDateTime() {

        const now = new Date();

        // Live date
        if (liveDate) {

            liveDate.textContent = now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        }

        // Live time with seconds
        if (liveTime) {

            liveTime.textContent = now.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                }
            );

        }

    }


    // Show date/time immediately
    updateDateTime();


    // Update every second
    setInterval(updateDateTime, 1000);


    // =========================================================
    // WELCOME PAGE
    // =========================================================

    const overlay =
        document.getElementById("welcomeOverlay");


    // If this is not the welcome page,
    // stop here.
    if (!overlay) {
        return;
    }


    // =========================================================
    // GET FORM ELEMENTS
    // =========================================================

    const nameInput =
        document.getElementById("userName");

    const agreeCheckbox =
        document.getElementById("agreeCheckbox");

    const continueBtn =
        document.getElementById("continueBtn");

    const nameError =
        document.getElementById("nameError");

    const agreementError =
        document.getElementById("agreementError");


    // =========================================================
    // CHECK EXISTING USER
    // =========================================================

    const savedUser =
        localStorage.getItem("ppmUser");


    if (savedUser) {

        window.location.href = "dashboard.html";

        return;
    }


    // =========================================================
    // CONTINUE BUTTON
    // =========================================================

    continueBtn.addEventListener("click", () => {

        const name =
            nameInput.value.trim();


        // Clear previous errors
        nameError.textContent = "";
        agreementError.textContent = "";


        // =====================================================
        // NAME VALIDATION
        // =====================================================

        if (name.length < 2) {

            nameError.textContent =
                "Please enter your name.";

            nameInput.focus();

            return;
        }


        // =====================================================
        // AGREEMENT VALIDATION
        // =====================================================

        if (!agreeCheckbox.checked) {

            agreementError.textContent =
                "Please accept the declaration before continuing.";

            return;
        }


        // =====================================================
        // SAVE USER DATA
        // =====================================================

        const userData = {

            name: name,

            agreementAccepted: true,

            acceptedAt:
                new Date().toISOString()

        };


        localStorage.setItem(
            "ppmUser",
            JSON.stringify(userData)
        );


        // =====================================================
        // DISABLE BUTTON
        // =====================================================

        continueBtn.disabled = true;

        continueBtn.innerHTML =
            "Opening Dashboard...";


        // =====================================================
        // DASHBOARD ANIMATION
        // =====================================================

        document.body.classList.add("page-exit");


        // Wait for animation
        // then open dashboard

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 520);

    });


    // =========================================================
    // ENTER KEY SUPPORT
    // =========================================================

    nameInput.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            continueBtn.click();

        }

    });

});