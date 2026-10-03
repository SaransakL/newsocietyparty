document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // SLIDER
    // =====================================================

    const slides = document.querySelector(".slides");
    const slide = document.querySelectorAll(".slide");

    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");
    const dotsContainer = document.querySelector(".dots");

    let index = 0;

    // สร้าง Dots
    if (dotsContainer && slide.length > 0) {

        slide.forEach((_, i) => {

            const dot = document.createElement("button");

            dot.classList.add("dot");
            dot.setAttribute("aria-label", `Slide ${i + 1}`);

            dot.addEventListener("click", () => {
                index = i;
                updateSlide();
            });

            dotsContainer.appendChild(dot);

        });

    }

    const dots = document.querySelectorAll(".dot");


    function updateSlide() {

        if (!slides) return;

        slides.style.transform =
            `translateX(-${index * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });

    }


    // Next
    if (nextBtn && slide.length > 0) {

        nextBtn.addEventListener("click", () => {

            index = (index + 1) % slide.length;

            updateSlide();

        });

    }


    // Previous
    if (prevBtn && slide.length > 0) {

        prevBtn.addEventListener("click", () => {

            index =
                (index - 1 + slide.length) %
                slide.length;

            updateSlide();

        });

    }


    updateSlide();


    // =====================================================
    // NEWS
    // =====================================================

    const NEWS_PER_PAGE = 6;

    let allNewsData = [];
    let currentPage = 1;


    // =====================================================
    // โหลดข่าว
    // =====================================================

    async function loadNews(type = "latest", page = 1) {

        const container = document.getElementById(
            type === "latest"
                ? "latestNews"
                : "allNews"
        );

        if (!container) return;


        try {

            const response =
                await fetch("/news/news.json");


            if (!response.ok) {
                throw new Error("ไม่สามารถโหลดข่าวได้");
            }


            const news =
                await response.json();


            // เรียงข่าวใหม่ → เก่า
            news.sort((a, b) => {

                return (
                    parseThaiDate(b.date) -
                    parseThaiDate(a.date)
                );

            });


            // =================================================
            // LATEST
            // =================================================

            if (type === "latest") {

                const latestNews =
                    news.slice(0, 3);

                container.innerHTML =
                    latestNews
                        .map(createNewsCard)
                        .join("");

                return;
            }


            // =================================================
            // ALL
            // =================================================

            allNewsData = news;

            renderNewsPage(page);

        }

        catch (error) {

            console.error(
                "โหลดข่าวไม่ได้:",
                error
            );

            container.innerHTML = `
                <p>ไม่สามารถโหลดข่าวได้</p>
            `;

        }

    }


    // =====================================================
    // สร้าง News Card
    // =====================================================

    function createNewsCard(item) {

        return `
            <a
                href="${item.url || "#"}"
                target="_blank"
                rel="noopener noreferrer"
                class="news-card"
            >

                <img
                    src="${item.image || "https://placehold.co/1920x1080"}"
                    alt="${item.title || ""}"
                    loading="lazy"
                >

                <div class="news-content">

                    <div class="news-meta">

                        ${
                            item.tag
                                ? `
                                    <span class="news-tag">
                                        ${item.tag}
                                    </span>
                                  `
                                : ""
                        }

                        <p>${item.date || ""}</p>

                    </div>


                    <h3>
                        ${item.title || ""}
                    </h3>


                    <span>
                        อ่านต่อ
                        <i class="bi bi-arrow-right"></i>
                    </span>

                </div>

            </a>
        `;

    }


    // =====================================================
    // แสดงข่าวตามหน้า
    // =====================================================

    function renderNewsPage(page) {

        const container =
            document.getElementById("allNews");

        if (!container) return;


        const totalPages =
            Math.ceil(
                allNewsData.length /
                NEWS_PER_PAGE
            );


        // ป้องกันเลขหน้าเกิน
        if (page < 1) {
            page = 1;
        }

        if (page > totalPages) {
            page = totalPages;
        }


        currentPage = page;


        const start =
            (currentPage - 1) *
            NEWS_PER_PAGE;


        const end =
            start +
            NEWS_PER_PAGE;


        const newsToShow =
            allNewsData.slice(
                start,
                end
            );


        container.innerHTML =
            newsToShow
                .map(createNewsCard)
                .join("");


        renderPagination(totalPages);

    }


    // =====================================================
    // Pagination
    // =====================================================

    function renderPagination(totalPages) {

        const pagination =
            document.getElementById("newsPagination");

        if (!pagination) return;

        if (totalPages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        let html = "";

        // ==========================
        // Previous
        // ==========================

        html += `
            <button
                type="button"
                class="page-btn"
                ${currentPage === 1 ? "disabled" : ""}
                data-page="${currentPage - 1}"
                aria-label="หน้าก่อนหน้า"
            >
                <i class="bi bi-chevron-left"></i>
            </button>
        `;


        // ==========================
        // สร้างเลขหน้า
        // ==========================

        const pages = [];

        // หน้าแรก
        pages.push(1);


        // หน้าที่อยู่รอบหน้าปัจจุบัน
        for (
            let i = currentPage - 1;
            i <= currentPage + 1;
            i++
        ) {

            if (
                i > 1 &&
                i < totalPages
            ) {
                pages.push(i);
            }

        }


        // หน้าสุดท้าย
        if (totalPages > 1) {
            pages.push(totalPages);
        }


        // ลบเลขซ้ำ
        const uniquePages =
            [...new Set(pages)];


        let previousPage = null;


        uniquePages.forEach(page => {

            // ==========================
            // Ellipsis (...)
            // ==========================

            if (
                previousPage !== null &&
                page - previousPage > 1
            ) {

                html += `
                    <span class="pagination-dots">
                        ...
                    </span>
                `;

            }


            // ==========================
            // Page Button
            // ==========================

            html += `
                <button
                    type="button"
                    class="page-btn ${
                        page === currentPage
                            ? "active"
                            : ""
                    }"
                    data-page="${page}"
                    ${
                        page === currentPage
                            ? 'aria-current="page"'
                            : ""
                    }
                >
                    ${page}
                </button>
            `;


            previousPage = page;

        });


        // ==========================
        // Next
        // ==========================

        html += `
            <button
                type="button"
                class="page-btn"
                ${
                    currentPage === totalPages
                        ? "disabled"
                        : ""
                }
                data-page="${currentPage + 1}"
                aria-label="หน้าถัดไป"
            >
                <i class="bi bi-chevron-right"></i>
            </button>
        `;


        pagination.innerHTML = html;


        // ==========================
        // Event
        // ==========================

        pagination
            .querySelectorAll(".page-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (button.disabled) {
                            return;
                        }

                        const page =
                            Number(
                                button.dataset.page
                            );

                        renderNewsPage(page);

                        const newsSection =
                            document.getElementById(
                                "allNews"
                            );

                        if (newsSection) {

                            newsSection.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }

                    }
                );

            });

    }

    // =====================================================
    // แปลงวันที่ไทย
    // =====================================================

    function parseThaiDate(dateString) {

        if (!dateString) {
            return new Date(0);
        }


        const months = {

            "มกราคม": 0,
            "กุมภาพันธ์": 1,
            "มีนาคม": 2,
            "เมษายน": 3,
            "พฤษภาคม": 4,
            "มิถุนายน": 5,
            "กรกฎาคม": 6,
            "สิงหาคม": 7,
            "กันยายน": 8,
            "ตุลาคม": 9,
            "พฤศจิกายน": 10,
            "ธันวาคม": 11

        };


        const parts =
            dateString.trim().split(/\s+/);


        const day =
            parseInt(parts[0]);


        const month =
            months[parts[1]];


        const year =
            parseInt(parts[2]) - 543;


        return new Date(
            year,
            month,
            day
        );

    }


    // =====================================================
    // โหลดข่าว
    // =====================================================

    loadNews("latest");
    loadNews("all");


    // =====================================================
    // POLICY
    // =====================================================

    async function loadPolicies() {

        try {

            const res =
                await fetch("/policy.json");


            if (!res.ok) {
                throw new Error(
                    "ไม่สามารถโหลด policy.json ได้"
                );
            }


            const data =
                await res.json();


            const grid =
                document.getElementById(
                    "policyGrid"
                );


            if (!grid) return;


            data.forEach(policy => {

                const item =
                    document.createElement("div");


                item.className =
                    "accordion-item";


                item.innerHTML = `
                    <div class="accordion-header">

                        <h3>
                            ${policy.title}
                        </h3>

                        <span class="icon">
                            <i class="bi bi-plus"></i>
                        </span>

                    </div>

                    <div class="accordion-content">

                        <p>
                            ${policy.description}
                        </p>

                    </div>
                `;


                const header =
                    item.querySelector(
                        ".accordion-header"
                    );


                header.addEventListener(
                    "click",
                    () => {

                        item.classList.toggle(
                            "active"
                        );

                    }
                );


                grid.appendChild(item);

            });

        }

        catch (err) {

            console.error(
                "โหลด policy ไม่ได้:",
                err
            );

        }

    }


    loadPolicies();


    // =====================================================
    // HEADER / FOOTER
    // =====================================================

    const components = {

        header: "/header.html",
        footer: "/footer.html"

    };


    function loadHTML(divId, file) {

        const element =
            document.getElementById(divId);


        if (!element) return;


        fetch(file)

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        `ไม่สามารถโหลด ${file} ได้`
                    );

                }

                return response.text();

            })

            .then(html => {

                element.innerHTML =
                    html;

            })

            .catch(err => {

                console.error(err);

            });

    }


    for (
        const [divId, file]
        of Object.entries(components)
    ) {

        loadHTML(
            divId,
            file
        );

    }


    // =====================================================
    // MENU
    // =====================================================

    window.toggleMenu = function () {

        const offcanvas =
            document.getElementById(
                "offcanvas"
            );


        if (!offcanvas) return;


        offcanvas.classList.toggle(
            "active"
        );


        if (
            !offcanvas.classList.contains(
                "active"
            )
        ) {

            offcanvas.classList.remove(
                "submenu-open"
            );


            offcanvas
                .querySelectorAll(
                    ".submenu-page"
                )
                .forEach(page => {

                    page.classList.remove(
                        "show"
                    );

                });

        }

    };


    // ปิดเมื่อคลิกข้างนอก
    document.addEventListener(
        "click",
        function (e) {

            const offcanvas =
                document.getElementById(
                    "offcanvas"
                );


            const menuBtn =
                document.querySelector(
                    ".menu-btn"
                );


            if (
                offcanvas &&
                menuBtn &&
                offcanvas.classList.contains(
                    "active"
                ) &&
                !offcanvas.contains(
                    e.target
                ) &&
                !menuBtn.contains(
                    e.target
                )
            ) {

                offcanvas.classList.remove(
                    "active"
                );


                offcanvas.classList.remove(
                    "submenu-open"
                );


                offcanvas
                    .querySelectorAll(
                        ".submenu-page"
                    )
                    .forEach(page => {

                        page.classList.remove(
                            "show"
                        );

                    });

            }

        }
    );


    // =====================================================
    // SUBMENU
    // =====================================================

    window.openSubmenu =
        function (e, id) {

            e.preventDefault();


            const offcanvas =
                document.getElementById(
                    "offcanvas"
                );


            const submenu =
                document.getElementById(id);


            if (
                !offcanvas ||
                !submenu
            ) {
                return;
            }


            offcanvas
                .querySelectorAll(
                    ".submenu-page"
                )
                .forEach(page => {

                    page.classList.remove(
                        "show"
                    );

                });


            submenu.classList.add(
                "show"
            );


            offcanvas.classList.add(
                "submenu-open"
            );

        };


    // =====================================================
    // CLOSE SUBMENU
    // =====================================================

    window.closeSubmenu =
        function () {

            const offcanvas =
                document.getElementById(
                    "offcanvas"
                );


            if (!offcanvas) return;


            offcanvas.classList.remove(
                "submenu-open"
            );


            offcanvas
                .querySelectorAll(
                    ".submenu-page"
                )
                .forEach(page => {

                    page.classList.remove(
                        "show"
                    );

                });

        };


    // =====================================================
    // COPY LINK
    // =====================================================

    const copyBtn =
        document.getElementById(
            "copy-link"
        );


    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );


                    const status =
                        document.getElementById(
                            "copy-status"
                        );


                    if (status) {

                        status.classList.add(
                            "show"
                        );


                        setTimeout(() => {

                            status.classList.remove(
                                "show"
                            );

                        }, 2000);

                    }

                }

                catch (err) {

                    console.error(
                        "Copy failed:",
                        err
                    );

                }

            }
        );

    }


    // =====================================================
    // CONTACT
    // =====================================================

    const contactForm =
        document.getElementById(
            "contactForm"
        );


    if (contactForm) {

        /*
         * ใส่ Discord Webhook URL ตรงนี้
         */
        const webhookURL =
            "https://discord.com/api/webhooks/1548392579014459544/f_WBYJaAv237Jj1coV0Xx2X569KgdhMMrzjuuyynwJT19nueJrFiW985NMET-PERothq";


        contactForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    document
                        .getElementById("name")
                        ?.value
                        .trim() || "";


                const discord =
                    document
                        .getElementById("discord")
                        ?.value
                        .trim() || "";


                const subject =
                    document
                        .getElementById("subject")
                        ?.value
                        .trim() || "";


                const message =
                    document
                        .getElementById("message")
                        ?.value
                        .trim() || "";


                const button =
                    document.getElementById(
                        "submitButton"
                    );


                const success =
                    document.getElementById(
                        "successMessage"
                    );


                const error =
                    document.getElementById(
                        "errorMessage"
                    );


                if (success) {
                    success.style.display =
                        "none";
                }


                if (error) {
                    error.style.display =
                        "none";
                }


                if (button) {

                    button.disabled = true;

                    button.innerHTML = `
                        <i class="bi bi-hourglass-split"></i>
                        กำลังส่ง...
                    `;

                }


                const data = {

                    allowed_mentions: {
                        parse: []
                    },

                    embeds: [

                        {

                            title:
                                "มีข้อความใหม่จากเว็บไซต์",

                            color: 16412436,

                            fields: [

                                {
                                    name: "ชื่อ",
                                    value: name || "-",
                                    inline: true
                                },

                                {
                                    name: "Discord",
                                    value: discord || "-",
                                    inline: true
                                },

                                {
                                    name: "หัวข้อ",
                                    value: subject || "-",
                                    inline: false
                                },

                                {
                                    name: "ข้อความ",
                                    value: message || "-",
                                    inline: false
                                }

                            ],

                            timestamp:
                                new Date().toISOString()

                        }

                    ]

                };


                try {

                    const response =
                        await fetch(
                            webhookURL,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(data)

                            }
                        );


                    if (response.ok) {

                        if (success) {

                            success.style.display =
                                "block";

                        }


                        contactForm.reset();

                    }

                    else {

                        if (error) {

                            error.style.display =
                                "block";

                        }

                    }

                }

                catch (err) {

                    console.error(
                        "Discord Webhook Error:",
                        err
                    );


                    if (error) {

                        error.style.display =
                            "block";

                    }

                }


                if (button) {

                    button.disabled = false;

                    button.innerHTML = `
                        <i class="bi bi-send-fill"></i>
                        ส่งข้อความ
                    `;

                }

            }
        );

    }


    // =====================================================
    // POLICY MODAL
    // =====================================================

    const policyCards =
        document.querySelectorAll(
            ".policy-card"
        );


    const policyModal =
        document.getElementById(
            "policyModal"
        );


    const policyModalClose =
        document.getElementById(
            "policyModalClose"
        );


    const policyModalBackdrop =
        document.querySelector(
            ".policy-modal-backdrop"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalDescription =
        document.getElementById(
            "modalDescription"
        );


    function openPolicyModal(card) {

        if (
            !policyModal ||
            !modalTitle ||
            !modalDescription
        ) {
            return;
        }


        const title =
            card.dataset.title || "";


        const description =
            card.dataset.description || "";


        modalTitle.textContent =
            title;


        modalDescription.textContent =
            description;


        policyModal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closePolicyModal() {

        if (!policyModal) return;


        policyModal.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";

    }


    policyCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                openPolicyModal(card);

            }
        );

    });


    if (policyModalClose) {

        policyModalClose.addEventListener(
            "click",
            closePolicyModal
        );

    }


    if (policyModalBackdrop) {

        policyModalBackdrop.addEventListener(
            "click",
            closePolicyModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closePolicyModal();

            }

        }
    );

});