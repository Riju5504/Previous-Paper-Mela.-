document.addEventListener("DOMContentLoaded", () => {

    const userData =
        localStorage.getItem("ppmUser");


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
     * User name
     */

    const userChip =
        document.getElementById("userChip");

    if (userChip) {

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
     * Read semester from URL.
     *
     * Example:
     * semester.html?sem=1
     */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const semester =
        params.get("sem") || "1";


    const semesterNames = {

        "1": "Semester 1",
        "2": "Semester 2",
        "3": "Semester 3",
        "4": "Semester 4"

    };


    const semesterTitle =
        document.getElementById(
            "semesterTitle"
        );


    if (semesterTitle) {

        semesterTitle.textContent =
            semesterNames[semester] ||
            "Semester";

    }


    /*
     * Papers
     *
     * Later we can replace this static
     * list with database/API data.
     */

    const papers = {

        "1": [

            {
                name: "Mathematics",
                year: "2024-25",
                file: "papers/semester-1/mathematics-2024-25.pdf"
            },

            {
                name: "Computer Fundamentals",
                year: "2024-25",
                file: "papers/semester-1/computer-fundamentals-2024-25.pdf"
            }

        ],


        "2": [

            {
                name: "Database Management System",
                year: "2024-25",
                file: "papers/semester-2/dbms-2024-25.pdf"
            }

        ],


        "3": [

            {
                name: "Computer Networks",
                year: "2024-25",
                file: "papers/semester-3/computer-networks-2024-25.pdf"
            }

        ],


        "4": [

            {
                name: "Software Engineering",
                year: "2024-25",
                file: "papers/semester-4/software-engineering-2024-25.pdf"
            }

        ]

    };


    const currentPapers =
        papers[semester] || [];


    const papersList =
        document.getElementById(
            "papersList"
        );


    const paperCount =
        document.getElementById(
            "paperCount"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    paperCount.textContent =
        `${currentPapers.length} ${
            currentPapers.length === 1
                ? "Paper"
                : "Papers"
        }`;


    /*
     * No papers
     */

    if (currentPapers.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }


    /*
     * Generate paper cards
     */

    currentPapers.forEach(
        (paper, index) => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "paper-card";


            article.innerHTML = `

                <div class="paper-index">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="paper-icon">
                    PDF
                </div>

                <div class="paper-details">

                    <div class="paper-label">
                        QUESTION PAPER
                    </div>

                    <h3>
                        ${paper.name}
                    </h3>

                    <p>
                        Academic Year:
                        <strong>${paper.year}</strong>
                    </p>

                </div>

                <a
                    href="${paper.file}"
                    class="download-button"
                    download
                >
                    Download
                    <span>↓</span>
                </a>

            `;


            papersList.appendChild(
                article
            );

        }
    );

});