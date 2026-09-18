let loadedGamesData = [];
let currentSlideIndex = 0;
let slideInterval;
let currentSearchQuery = "";
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Restore scroll position instantly if it was saved before leaving
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition !== null) {
        window.scrollTo({
            top: parseInt(savedPosition),
            behavior: 'instant'
        });
        localStorage.removeItem('scrollPosition');
    }

    // 2. Save scroll position whenever any action/download button is clicked
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-action')) {
            localStorage.setItem('scrollPosition', window.scrollY);
        }
    });

    // 3. Fetch games data
    fetch("./games.json")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load games.json");
            return response.json();
        })
        .then(games => {
            initStore(games);
        })
        .catch(err => {
            console.warn("Using fallback local games data:", err);
            // Fallback array if fetch fails locally
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
    renderFeaturedSlider(games.slice(0, 5)); // Show top 5 in slider
    applyFilters(); // Renders game store based on initial filters
    startAutoSlide();
}

function renderFeaturedSlider(sliderGames) {
    const sliderContainer = document.getElementById("featured-slider");
    if (!sliderContainer) return;

    sliderContainer.innerHTML = sliderGames.map((game, index) => `
        <div class="slider-item ${index === 0 ? 'active' : ''}">
            <img src="${game.image}" alt="${game.title}" onerror="this.src='images/nfsmw-shot1.png';">
            <div class="slider-caption">
                <span class="card-badge">${game.platform}</span>
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="slider-actions">
                    <button class="btn-details" onclick="openDetailsById(${loadedGamesData.indexOf(game)})">Details</button>
                    <a href="${game.downloadUrl}" target="_blank" class="btn-action ${game.price === 'FREE' ? 'btn-get' : 'btn-download'}">
                        ${game.price === 'FREE' ? 'Get Game' : 'Buy Now'}
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
    slideInterval = setInterval(() => {
        moveSlide(1);
    }, 5000); // Slide every 5 seconds automatically
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

/* --- Search and Category Filtering Logic --- */
function filterGames() {
    const searchInput = document.getElementById('gameSearchInput');
    if (searchInput) {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
    }
    applyFilters();
}

function filterByCategory(category, buttonElement) {
    // Update active state on category pills
    document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
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

        // Check search query match
        const matchesSearch = title.includes(currentSearchQuery) || description.includes(currentSearchQuery);

        // Check category/platform match
        let matchesCategory = true;
        if (currentCategory !== 'all') {
            matchesCategory = category.includes(currentCategory) || platform.includes(currentCategory);
        }

        return matchesSearch && matchesCategory;
    });

    renderGameStore(filteredGames);
}

function renderGameStore(gameList) {
    const container = document.getElementById("game-grid");
    if (!container) return;

    container.innerHTML = "";

    if (gameList.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <p>No games found matching your search or category.</p>
            </div>
        `;
        return;
    }

    gameList.forEach((game) => {
        // Find the correct index in the original loadedGamesData array for modal opening
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

        // Add Vodacom alternate WhatsApp payment button ONLY if altDownloadUrl is present (Paid games)
        if (game.altDownloadUrl) {
            actionButtonsHTML += `
                <a href="${game.altDownloadUrl}" target="_blank" class="btn-action btn-vodacom" title="Buy via WhatsApp using Vodacom network">
                    💬 Buy (Vodacom)
                </a>
            `;
        }

        card.innerHTML = `
            <div class="card-badge">${game.platform || "Game"}</div>
            <div class="game-img-wrapper">
                <img src="${game.image}" alt="${game.title}" class="game-img" loading="lazy" onerror="this.onerror=null; this.src='images/nfsmw-shot1.png';" />
            </div>
            <div class="game-details">
                <span class="category-tag">${game.category || "General"}</span>
                <h3>${game.title}</h3>
                <p>${game.description || ""}</p>
                <div class="card-action">
                    <span class="price">${game.price}</span>
                    <div class="action-group">
                        <button class="btn-details" onclick="openDetails(${originalIndex})">Details</button>
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

    const priceText = String(game.price || "").trim().toUpperCase();
    const isFree = priceText === "FREE" || priceText === "0" || priceText.includes("FREE");

    const modalBtnText = isFree ? "Get" : "Buy Now";
    const modalBtnClass = isFree ? "btn-get" : "btn-download";
    const targetUrl = game.downloadUrl || "https://wa.me/255692752060";

    document.getElementById("modal-title").innerText = game.title;
    document.getElementById("modal-desc").innerText = game.description || "";
    document.getElementById("modal-req").innerText = game.requirements || "Standard System Requirements";
    document.getElementById("modal-price").innerText = game.price;

    const modalBtnGroup = document.getElementById("modal-btn-group");
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

    const gallery = document.getElementById("modal-gallery");
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
        img.src = game.image;
        img.onclick = function () { openFullScreen(game.image); };
        gallery.appendChild(img);
    }

    document.getElementById("details-modal").classList.add("active");
}

function closeModal(event) {
    if (event.target.classList.contains("modal-overlay")) {
        closeModalDirect();
    }
}

function closeModalDirect() {
    document.getElementById("details-modal").classList.remove("active");
}

function openFullScreen(imgSrc) {
    const fullImg = document.getElementById("fullscreen-img");
    fullImg.src = imgSrc;
    document.getElementById("fullscreen-modal").classList.add("active");
}

function closeFullScreen() {
    document.getElementById("fullscreen-modal").classList.remove("active");
}
