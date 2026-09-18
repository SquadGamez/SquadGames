let loadedGamesData = [];
let currentSlideIndex = 0;
let slideInterval;
let currentSearchQuery = "";
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Squad Games Store initialized.");

    // 1. Restore scroll position instantly if it was saved before leaving
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition !== null) {
        window.scrollTo({
            top: parseInt(savedPosition),
            behavior: 'instant'
        });
        localStorage.removeItem('scrollPosition');
    }

    // 2. Save scroll position whenever any action/download/details button is clicked
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-action') || e.target.closest('.btn-details')) {
            localStorage.setItem('scrollPosition', window.scrollY);
        }
    });

    // 3. Fetch games data with an absolute/relative path check and instant fallback
    // This dynamically handles GitHub Pages subfolders safely
    const jsonPath = window.location.hostname.includes("github.io") ? "./games.json" : "games.json";

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        })
        .then(games => {
            console.log("Successfully loaded games.json from server.");
            initStore(games);
        })
        .catch(err => {
            console.warn("Fetch failed, activating instant backup catalog:", err);
            // Instant backup so your site never hangs on loading screen
            initStore([
                {
                    id: 1,
                    title: "Tanzania Euro Truck Simulator 2 + 50 TZ mods packs",
                    platform: "PC",
                    category: "Simulation / PC",
                    description: "Full Euro Truck Simulator 2 PC game bundled with 50 custom TZ mods.",
                    requirements: "OS: Windows 10/11 (64-bit) | RAM: 8 GB | Storage: 25 GB",
                    price: "TZS 20,000",
                    image: "images/ets-2-pc.jpg",
                    screenshots: ["images/4193b766a912970fac32e8b171d693df.webp"],
                    downloadUrl: "https://selar.com/8z3yp9tnyv",
                    altDownloadUrl: "https://wa.me/255692752060?text=Hello%20Squad%20Games%2C%20I%20want%20to%20buy%20ETS2%20PC."
                },
                {
                    id: "ets2-mobile",
                    title: "Tanzania Euro Truck Simulator 2 Mobile",
                    platform: "Android",
                    category: "Mobile Games",
                    description: "Experience driving heavy trucks across Tanzania directly on your Android phone.",
                    requirements: "OS: Android 8.0+ | RAM: 4 GB minimum",
                    price: "TZS 10,000",
                    image: "images/ets-2-mobile.jpg",
                    screenshots: ["images/Screenshot_20260902_131001_TikTok.jpg"],
                    downloadUrl: "https://selar.com/8002i2803s",
                    altDownloadUrl: "https://wa.me/255692752060?text=Hello%20Squad%20Games%2C%20I%20want%20to%20buy%20ETS2%20Mobile."
                },
                {
                    id: "ets2-v157",
                    title: "Euro Truck Simulator 2 v1.57.2.2s + 103 DLCs",
                    platform: "PC",
                    category: "Open World / Simulation",
                    description: "It includes 103 DLCs + Multiplayer Game",
                    requirements: "OS: Windows 10 | RAM: 8 GB",
                    price: "FREE",
                    image: "images/ets 2 1.57.png",
                    screenshots: ["images/Annotation 2026-09-02 125957.png"],
                    downloadUrl: "https://drive.google.com/file/d/1i5fqqoHh8MwYoLDL3LCuGsGt6M-B9LUk/view?usp=drive_link"
                }
            ]);
        });
});

function initStore(games) {
    loadedGamesData = games;
    renderFeaturedSlider(games.slice(0, 5)); 
    applyFilters(); 
    startAutoSlide();

    // Safely bind the search input listener dynamically
    const searchInput = document.getElementById('gameSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }
}

function renderFeaturedSlider(sliderGames) {
    const sliderContainer = document.getElementById("featured-slider");
    if (!sliderContainer) return;

    sliderContainer.innerHTML = sliderGames.map((game, index) => `
        <div class="slider-item ${index === 0 ? 'active' : ''}">
            <img src="${game.image}" alt="${game.title}" onerror="this.src='images/nfsmw-shot1.png';">
            <div class="slider-caption">
                <span class="card-badge">${game.platform || 'Game'}</span>
                <h3>${game.title}</h3>
                <p>${game.description || ''}</p>
                <div class="slider-actions">
                    <button class="btn-details" onclick="openDetailsById(${loadedGamesData.indexOf(game)})">Details</button>
                    <a href="${game.downloadUrl || '#'}" target="_blank" class="btn-action ${String(game.price).toUpperCase().includes('FREE') ? 'btn-get' : 'btn-download'}">
                        ${String(game.price).toUpperCase().includes('FREE') ? 'Get Game' : 'Buy Now'}
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function moveSlide(direction) {
    const items = document.querySelectorAll(".slider-item");
    if (items.length === 0) return;

    items[currentSlideIndex].classList.remove("active");
    currentSlideIndex = (currentSlideIndex + direction + items.length) % items.length;
    items[currentSlideIndex].classList.add("active");

    resetAutoSlide();
}

function startAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        moveSlide(1);
    }, 5000); 
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

/* --- Search and Category Filtering Logic --- */
function filterByCategory(category, buttonElement) {
    document.querySelectorAll('.cat-pill, .portal-navbar .nav-tab').forEach(btn => btn.classList.remove('active'));
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    currentCategory = category.toLowerCase();
    applyFilters();
}

function applyFilters() {
    const filteredGames = loadedGamesData.filter(game => {
        const title = (game.title || "").toLowerCase();
        const description = (game.description || "").toLowerCase();
        const category = (game.category || "").toLowerCase();
        const platform = (game.platform || "").toLowerCase();

        const matchesSearch = title.includes(currentSearchQuery) || description.includes(currentSearchQuery);

        let matchesCategory = true;
        if (currentCategory !== 'all') {
            matchesCategory = category.includes(currentCategory) || platform.includes(currentCategory);
        }

        return matchesSearch && matchesCategory;
    });

    renderGameStore(filteredGames);
}

function renderGameStore(gameList) {
    const container = document.getElementById("game-grid") || document.getElementById("gameGrid");
    if (!container) {
        console.warn("Element with ID 'game-grid' or 'gameGrid' not found in HTML!");
        return;
    }

    container.innerHTML = "";

    if (gameList.length === 0) {
        container.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>No games found matching your search or category.</p>
            </div>
        `;
        return;
    }

    gameList.forEach((game) => {
        const originalIndex = loadedGamesData.indexOf(game);
        const card = document.createElement("div");
        card.classList.add("game-card");

        const priceText = String(game.price || "").trim().toUpperCase();
        const isFree = priceText === "FREE" || priceText === "0" || priceText.includes("FREE");

        const actionBtnText = isFree ? "Get" : "Buy Now";
        const actionBtnClass = isFree ? "btn-get" : "btn-download";
        const targetUrl = game.downloadUrl || "https://wa.me/255692752060";

        let actionButtonsHTML = `
            <a href="${targetUrl}" target="_blank" class="btn-action ${actionBtnClass}">${actionBtnText}</a>
        `;

        if (game.altDownloadUrl) {
            actionButtonsHTML += `
                <a href="${game.altDownloadUrl}" target="_blank" class="btn-action btn-vodacom" title="Buy via WhatsApp using Vodacom network">
                    💬 Buy (Vodacom)
                </a>
            `;
        }

        card.innerHTML = `
            <span class="card-badge">${game.platform || "Game"}</span>
            <div class="game-img-wrapper">
                <img src="${game.image || 'images/nfsmw-shot1.png'}" alt="${game.title}" class="game-img" loading="lazy" onerror="this.onerror=null; this.src='images/nfsmw-shot1.png';" />
            </div>
            <div class="game-details">
                <span class="category-tag">${game.category || "General"}</span>
                <h3>${game.title}</h3>
                <p>${game.description || ""}</p>
                <div class="card-action">
                    <span class="price">${game.price || 'FREE'}</span>
                    <div class="action-group">
                        <button class="btn-details" onclick="openDetails(${originalIndex})">Details &rarr;</button>
                        ${actionButtonsHTML}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function openDetailsById(index) {
    openDetails(index);
}

function openDetails(index) {
    const game = loadedGamesData[index];
    if (!game) return;

    const modalDetailsModal = document.getElementById("details-modal");

    // If modal doesn't exist on this page layout, safely redirect to details.html with game ID
    if (!modalDetailsModal) {
        window.location.href = `details.html?id=${game.id || index}`;
        return;
    }

    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modalReq = document.getElementById("modal-req");
    const modalPrice = document.getElementById("modal-price");

    if (modalTitle) modalTitle.innerText = game.title;
    if (modalDesc) modalDesc.innerText = game.description || "";
    
    // Dynamically pulls and shows the exact PC specifications/requirements written in your games.json
    if (modalReq) {
        modalReq.innerText = game.requirements || "Standard System Requirements not specified.";
    }
    
    if (modalPrice) modalPrice.innerText = game.price || "FREE";

    const priceText = String(game.price || "").trim().toUpperCase();
    const isFree = priceText === "FREE" || priceText === "0" || priceText.includes("FREE");

    const modalBtnText = isFree ? "Get" : "Buy Now";
    const modalBtnClass = isFree ? "btn-get" : "btn-download";
    const targetUrl = game.downloadUrl || "https://wa.me/255692752060";

    const modalBtnGroup = document.getElementById("modal-btn-group");
    if (modalBtnGroup) {
        let modalButtonsHTML = `
            <a href="${targetUrl}" target="_blank" class="btn-action ${modalBtnClass}">${modalBtnText}</a>
        `;

        if (game.altDownloadUrl) {
            modalButtonsHTML += `
                <a href="${game.altDownloadUrl}" target="_blank" class="btn-action btn-vodacom" style="margin-top: 6px;">
                    💬 Buy via WhatsApp (Vodacom)
                </a>
            `;
        }
        modalBtnGroup.innerHTML = modalButtonsHTML;
    }

    const gallery = document.getElementById("modal-gallery");
    if (gallery) {
        gallery.innerHTML = "";
        if (game.screenshots && game.screenshots.length > 0) {
            game.screenshots.forEach((imgSrc) => {
                const img = document.createElement("img");
                img.src = imgSrc;
                img.alt = "Screenshot";
                img.onerror = function () { this.src = "images/nfsmw-shot1.png"; };
                img.onclick = function () { openFullScreen(imgSrc); };
                gallery.appendChild(img);
            });
        } else {
            const img = document.createElement("img");
            img.src = game.image || 'images/nfsmw-shot1.png';
            img.onclick = function () { openFullScreen(game.image); };
            gallery.appendChild(img);
        }
    }

    modalDetailsModal.classList.add("active");
}

function closeModal(event) {
    if (event.target.classList.contains("modal-overlay")) {
        closeModalDirect();
    }
}

function closeModalDirect() {
    const modal = document.getElementById("details-modal");
    if (modal) modal.classList.remove("active");
}

function openFullScreen(imgSrc) {
    const fullModal = document.getElementById("fullscreen-modal");
    const fullImg = document.getElementById("fullscreen-img");
    if (fullImg) fullImg.src = imgSrc;
    if (fullModal) fullModal.classList.add("active");
}

function closeFullScreen() {
    const fullModal = document.getElementById("fullscreen-modal");
    if (fullModal) fullModal.classList.remove("active");
}
