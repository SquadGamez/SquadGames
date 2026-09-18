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
                    category: "Mobile",
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
                    category: "Action",
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
    renderFeaturedMarquee(games.slice(0, 5)); 
    renderPopularList(games.slice(0, 4));
    applyFilters(); 

    // Bind Search Input Listener
    const searchInput = document.getElementById('gameSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    // Bind Navbar Category Tabs
    document.querySelectorAll('.portal-navbar .nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.portal-navbar .nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.getAttribute('data-filter').toLowerCase();
            applyFilters();
        });
    });

    // Modal Close Triggers
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModalDirect);
    }

    const fullscreenCloseBtn = document.getElementById('fullscreenClose');
    if (fullscreenCloseBtn) {
        fullscreenCloseBtn.addEventListener('click', closeFullScreen);
    }

    const closeGdriveBtn = document.getElementById('closeGdriveModal');
    if (closeGdriveBtn) {
        closeGdriveBtn.addEventListener('click', () => {
            document.getElementById('gdriveModal').classList.remove('active');
        });
    }

    // Copy Google Drive Link Button
    const copyBtn = document.getElementById('gdriveCopyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const input = document.getElementById('gdriveLinkInput');
            input.select();
            document.execCommand('copy');
            copyBtn.innerText = "✅ Copied!";
            setTimeout(() => { copyBtn.innerText = "📋 Copy Link"; }, 2000);
        });
    }
}

function renderFeaturedMarquee(sliderGames) {
    const track = document.getElementById("featuredMarqueeTrack");
    if (!track) return;

    track.innerHTML = sliderGames.map((game, index) => `
        <div class="featured-card">
            <img src="${game.image}" alt="${game.title}" onerror="this.src='images/nfsmw-shot1.png';">
            <div class="featured-info">
                <span class="card-badge">${game.platform || 'Game'}</span>
                <h4>${game.title}</h4>
                <div class="slider-actions">
                    <button class="btn-details" onclick="openDetailsById(${loadedGamesData.indexOf(game)})">Details</button>
                    <a href="${game.downloadUrl || '#'}" target="_blank" class="btn-action ${String(game.price).toUpperCase().includes('FREE') ? 'btn-get' : 'btn-download'}">
                        ${String(game.price).toUpperCase().includes('FREE') ? 'Get' : 'Buy'}
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPopularList(popularGames) {
    const container = document.getElementById("popularListContainer");
    if (!container) return;

    container.innerHTML = popularGames.map((game) => `
        <div class="popular-item" onclick="openDetailsById(${loadedGamesData.indexOf(game)})">
            <img src="${game.image}" alt="${game.title}" onerror="this.src='images/nfsmw-shot1.png';">
            <div class="popular-info">
                <h4>${game.title}</h4>
                <span class="popular-price">${game.price || 'FREE'}</span>
            </div>
        </div>
    `).join('');
}

/* --- Search and Category Filtering Logic --- */
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
    const container = document.getElementById("gameGrid") || document.getElementById("game-grid");
    if (!container) return;

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
            <button onclick="handleDownloadAction(${originalIndex})" class="btn-action ${actionBtnClass}">${actionBtnText}</button>
        `;

        if (game.altDownloadUrl) {
            actionButtonsHTML += `
                <a href="${game.altDownloadUrl}" target="_blank" class="btn-action btn-vodacom" title="Buy via WhatsApp">
                    💬 WhatsApp
                </a>
            `;
        }

        card.innerHTML = `
            <span class="card-badge">${game.platform || "Game"}</span>
            <div class="game-img-wrapper" onclick="openDetails(${originalIndex})" style="cursor: pointer;">
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

function handleDownloadAction(index) {
    const game = loadedGamesData[index];
    if (!game) return;

    const url = game.downloadUrl || "";
    // If it's a Google Drive link, open the custom popup modal
    if (url.includes("drive.google.com")) {
        const gdriveModal = document.getElementById("gdriveModal");
        const titleSpan = document.getElementById("modalGameTitle");
        const linkInput = document.getElementById("gdriveLinkInput");
        const directBtn = document.getElementById("gdriveDirectBtn");

        if (titleSpan) titleSpan.innerText = game.title;
        if (linkInput) linkInput.value = url;
        if (directBtn) directBtn.href = url;
        if (gdriveModal) gdriveModal.classList.add("active");
    } else {
        window.open(url, '_blank');
    }
}

function openDetailsById(index) {
    openDetails(index);
}

function openDetails(index) {
    const game = loadedGamesData[index];
    if (!game) return;

    const modal = document.getElementById("detailsModal");
    if (!modal) {
        window.location.href = `details.html?id=${game.id || index}`;
        return;
    }

    // Populate Modal Content dynamically
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="closeModalDirect()">&times;</span>
            <h2 style="color: #fff; margin-bottom: 10px;">${game.title}</h2>
            <p style="color: #a0aec0; margin-bottom: 15px;">${game.description || ""}</p>
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: var(--accent-blue);">System Requirements:</strong>
                <p style="color: #cbd5e1; font-size: 13px; margin-top: 5px;">${game.requirements || "Standard specs apply."}</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 18px; font-weight: bold; color: #48bb78;">${game.price || "FREE"}</span>
                <button onclick="handleDownloadAction(${index})" class="btn-action ${String(game.price).toUpperCase().includes('FREE') ? 'btn-get' : 'btn-download'}">
                    ${String(game.price).toUpperCase().includes('FREE') ? 'Get Game' : 'Buy Now'}
                </button>
            </div>
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;">
                ${(game.screenshots || [game.image]).map(img => `<img src="${img}" style="width: 120px; height: 75px; object-fit: cover; border-radius: 6px; cursor: pointer;" onclick="openFullScreen('${img}')" onerror="this.src='images/nfsmw-shot1.png'">`).join('')}
            </div>
        </div>
    `;

    modal.classList.add("active");
}

function closeModalDirect() {
    const modal = document.getElementById("detailsModal");
    if (modal) modal.classList.remove("active");
}

function openFullScreen(imgSrc) {
    const fullModal = document.getElementById("fullscreenOverlay");
    const fullImg = document.getElementById("fullscreenImg");
    if (fullImg) fullImg.src = imgSrc;
    if (fullModal) fullModal.classList.add("active");
}

function closeFullScreen() {
    const fullModal = document.getElementById("fullscreenOverlay");
    if (fullModal) fullModal.classList.remove("active");
}
