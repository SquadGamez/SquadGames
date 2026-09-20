let loadedGamesData = [];
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

    // 3. Sleek loading animation handler for download / get buttons & Multi-part popup trigger
    document.addEventListener('click', function(e) {
        const downloadBtn = e.target.closest('.btn-download, .btn-get, .btn-action');
        if (!downloadBtn) return;

        e.preventDefault();

        const gameIndex = downloadBtn.getAttribute('data-game-index');
        if (gameIndex !== null && loadedGamesData[gameIndex]) {
            const game = loadedGamesData[gameIndex];
            if (game.downloadParts && game.downloadParts.length > 0) {
                showDownloadPartsModal(game);
                return;
            }
        }

        const targetUrl = downloadBtn.getAttribute('href');
        if (!targetUrl || targetUrl === '#') return;
        if (downloadBtn.classList.contains('preparing')) return;

        downloadBtn.classList.add('preparing');
        
        const originalHTML = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Preparing Link...`;

        setTimeout(() => {
            downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> Redirecting...`;
            window.open(targetUrl, '_blank');

            setTimeout(() => {
                downloadBtn.innerHTML = originalHTML;
                downloadBtn.classList.remove('preparing');
            }, 2000);
        }, 1000);
    });

    // 4. Load Game Catalog
    loadGameCatalog();
});

async function loadGameCatalog() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const repoPrefix = (window.location.hostname.includes("github.io") && pathSegments.length > 0) ? `/${pathSegments[0]}/` : './';

    const possiblePaths = [
        repoPrefix + 'games.json',
        './games.json',
        'games.json'
    ];

    let rawData = null;

    for (const path of possiblePaths) {
        try {
            console.log("Attempting to fetch games.json from:", path);
            const response = await fetch(path);
            if (response.ok) {
                rawData = await response.json();
                console.log("Successfully loaded games.json from:", path);
                break;
            }
        } catch (err) {
            console.warn("Failed path attempt:", path);
        }
    }

    // Safely extract games array whether games.json is an Array or an Object containing games
    let gamesArray = [];
    if (Array.isArray(rawData)) {
        gamesArray = rawData;
    } else if (rawData && typeof rawData === 'object') {
        gamesArray = rawData.games || rawData.data || rawData.list || Object.values(rawData).find(Array.isArray) || [];
    }

    // Fallback if fetch failed or data is empty
    if (gamesArray.length === 0) {
        console.warn("Using fallback catalog data.");
        gamesArray = [
            {
                id: 1,
                title: "Tanzania Euro Truck Simulator 2 + 50 TZ mods packs",
                platform: "PC",
                category: "Simulation / PC",
                description: "Full Euro Truck Simulator 2 PC game bundled with 50 custom TZ mods.",
                requirements: "OS: Windows 10/11 (64-bit) | RAM: 8 GB | Storage: 25 GB",
                price: "TZS 20,000",
                image: "images/ets-2-pc.jpg",
                screenshots: [],
                downloadUrl: "https://selar.com/8z3yp9tnyv",
                altDownloadUrl: "https://wa.me/255692752060?text=Hello%20Squad%20Games"
            },
            {
                id: 2,
                title: "Marvel’s Spider-Man: Miles Morales",
                platform: "PC",
                category: "Action",
                description: "Experience the rise of Miles Morales as new powers unfold.",
                requirements: "OS: Windows 10 (64-bit) | RAM: 8 GB",
                price: "FREE",
                image: "images/spider-man.jpg",
                screenshots: [],
                downloadUrl: "https://wa.me/255692752060"
            }
        ];
    }

    initStore(gamesArray);
}

function initStore(games) {
    loadedGamesData = games;

    const featuredGames = games.filter(game => {
        const title = (game.title || "").toLowerCase();
        return title.includes("euro truck simulator") || title.includes("call of duty") || title.includes("carx street");
    });
    renderFeaturedMarquee(featuredGames.length ? featuredGames : games); 

    const popularGames = games.filter(game => {
        const title = (game.title || "").toLowerCase();
        return title.includes("euro truck simulator") || title.includes("gta") || title.includes("spider-man");
    });
    renderPopularList(popularGames.length ? popularGames : games);

    applyFilters(); 

    const searchInput = document.getElementById('gameSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    document.querySelectorAll('.portal-navbar .nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.portal-navbar .nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.getAttribute('data-category').toLowerCase();
            applyFilters();
        });
    });

    const closeModalBtn = document.querySelector('.close-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalDirect);

    const fullscreenCloseBtn = document.querySelector('.fullscreen-close');
    if (fullscreenCloseBtn) fullscreenCloseBtn.addEventListener('click', closeFullScreen);
}

function renderFeaturedMarquee(sliderGames) {
    const track = document.getElementById("featuredTrack");
    if (!track) return;

    track.innerHTML = sliderGames.map((game) => `
        <div class="marquee-game-card">
            <img class="marquee-game-img" src="${game.image}" alt="${game.title}" onerror="this.src='images/nfsmw-shot1.png';">
            <div class="marquee-game-content">
                <span class="marquee-game-badge">${game.platform || 'Game'}</span>
                <h4>${game.title}</h4>
                <p>${game.description || ''}</p>
                <div class="marquee-game-footer">
                    <span class="marquee-price">${game.price || 'FREE'}</span>
                    <button class="btn-details" onclick="openDetails(${loadedGamesData.indexOf(game)})" style="padding: 4px 8px; font-size: 0.75rem;">View</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPopularList(popularGames) {
    const container = document.getElementById("popularList");
    if (!container) return;

    container.innerHTML = popularGames.map((game) => `
        <div class="popular-item" onclick="openDetails(${loadedGamesData.indexOf(game)})" style="cursor: pointer;">
            <img src="${game.image}" alt="${game.title}" onerror="this.src='images/nfsmw-shot1.png';">
            <div class="popular-item-info">
                <h5>${game.title}</h5>
                <span>${game.price || 'FREE'}</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: var(--text-muted);"></i>
        </div>
    `).join('');
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
    const container = document.getElementById("gameGrid") || document.getElementById("games-grid");

    if (!container) {
        console.error("Error: Could not find element with ID 'gameGrid' or 'games-grid'.");
        return;
    }

    container.innerHTML = "";

    if (gameList.length === 0) {
        container.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #fff;">
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
            <a href="${targetUrl}" target="_blank" class="btn-action ${actionBtnClass}" data-game-index="${originalIndex}">${actionBtnText}</a>
        `;

        if (game.altDownloadUrl) {
            actionButtonsHTML += `
                <a href="${game.altDownloadUrl}" target="_blank" class="btn-action btn-vodacom" style="margin-top: 6px;">
                    💬 WhatsApp
                </a>
            `;
        }

        card.innerHTML = `
            <span class="card-badge">${game.platform || "PC"}</span>
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

function openDetails(index) {
    const game = loadedGamesData[index];
    if (!game) return;

    const modal = document.getElementById("details-modal");
    if (!modal) {
        window.location.href = `details.html?id=${game.id || index}`;
        return;
    }

    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modalReq = document.getElementById("modal-req");
    const modalPrice = document.getElementById("modal-price");

    if (modalTitle) modalTitle.innerText = game.title;
    if (modalDesc) modalDesc.innerText = game.description || "";
    if (modalReq) modalReq.innerText = game.requirements || "Standard System Requirements not specified.";
    if (modalPrice) modalPrice.innerText = game.price || "FREE";

    // Cleared out download and buy action buttons from the details popup window so it shows details only
    const modalBtnGroup = document.getElementById("modal-btn-group");
    if (modalBtnGroup) {
        modalBtnGroup.innerHTML = "";
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

    modal.classList.add("active");
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

function showDownloadPartsModal(game) {
    let modal = document.getElementById('download-parts-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'download-parts-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px; background: var(--bg-card, #1e1e1e); padding: 25px; border-radius: 12px; color: #fff; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <button onclick="closeDownloadPartsModal()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #aaa; font-size: 1.2rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 id="parts-modal-title" style="margin-bottom: 8px; font-size: 1.25rem;">Select Download Part</h3>
                
                <p style="color: #f1c40f; font-size: 0.85rem; margin-bottom: 12px; font-weight: 600; line-height: 1.4;">
                    <i class="fa-solid fa-triangle-exclamation"></i> To get this game you are required to download all these parts for proper installation and extraction of the game.
                </p>

                <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 20px;">Choose a specific part series below to start your direct download link:</p>
                <div id="parts-list-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeDownloadPartsModal();
            }
        });
    }

    document.getElementById('parts-modal-title').innerText = `Download: ${game.title}`;
    
    const container = document.getElementById('parts-list-container');
    container.innerHTML = game.downloadParts.map((part, idx) => `
        <a href="${part.url}" target="_blank" class="btn-action btn-get" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; text-decoration: none;">
            <span><i class="fa-solid fa-download"></i> ${part.name || `Part ${idx + 1}`}</span>
            <i class="fa-solid fa-external-link-alt" style="font-size: 0.8rem;"></i>
        </a>
    `).join('');

    modal.classList.add('active');
}

function closeDownloadPartsModal() {
    const modal = document.getElementById('download-parts-modal');
    if (modal) modal.classList.remove('active');
}
