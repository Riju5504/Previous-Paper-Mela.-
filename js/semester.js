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
     * Papers are now loaded from
     * the Render backend / MongoDB API.
     */

    const API_BASE_URL =
        "https://previous-paper-mela.onrender.com";


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


    /*
     * Show loading state
     */

    if (paperCount) {

        paperCount.textContent =
            "Loading...";

    }


    /*
     * Load papers from backend
     */

    fetch(
        `${API_BASE_URL}/api/papers/semester/${semester}`
    )
        .then(response => {

            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }

            return response.json();

        })
        .then(data => {

            const currentPapers =
                data.papers || [];


            /*
             * Update paper count
             */

            if (paperCount) {

                paperCount.textContent =
                    `${currentPapers.length} ${
                        currentPapers.length === 1
                            ? "Paper"
                            : "Papers"
                    }`;

            }


            /*
             * Clear existing papers
             */

            if (papersList) {

                papersList.innerHTML = "";

            }


            /*
             * No papers
             */

            if (currentPapers.length === 0) {

                if (emptyState) {

                    emptyState.classList.remove(
                        "hidden"
                    );

                }

                return;
            }


            /*
             * Hide empty state
             */

            if (emptyState) {

                emptyState.classList.add(
                    "hidden"
                );

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


                    /*
                     * Backend returns:
                     *
                     * filePath:
                     * /api/papers/file/:fileId
                     */

                    const fileUrl =
                        `${API_BASE_URL}${paper.filePath}`;


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
                                ${paper.subject || paper.fileName}
                            </h3>

                            <p>
                                Academic Year:
                                <strong>${paper.year}</strong>
                            </p>

                        </div>

                        <a
                            href="${fileUrl}"
                            class="download-button"
                            target="_blank"
                        >
                            Download
                            <span>↓</span>
                        </a>

                    `;


                    if (papersList) {

                        papersList.appendChild(
                            article
                        );

                    }

                }
            );

        })
        .catch(error => {

            console.error(
                "Error loading papers:",
                error
            );


            if (paperCount) {

                paperCount.textContent =
                    "Unable to load papers";

            }

            if (emptyState) {

                emptyState.classList.remove(
                    "hidden"
                );

            }

        });

});