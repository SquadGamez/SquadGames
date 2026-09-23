let loadedGamesData = [];
let currentSearchQuery = "";
let currentCategory = "all";
let currentFranchise = "all";

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

    // 3. Sleek loading animation handler & Universal Multi-part popup trigger for all current & future games
    document.addEventListener('click', function(e) {
        if (e.target.closest('#download-parts-modal')) return;

        const downloadBtn = e.target.closest('.btn-download, .btn-get, .btn-action');
        if (!downloadBtn) return;

        if (downloadBtn.classList.contains('btn-vodacom') || downloadBtn.href.includes('wa.me')) return;

        let targetGame = null;

        const gameIndex = downloadBtn.getAttribute('data-game-index');
        if (gameIndex !== null && loadedGamesData[gameIndex]) {
            targetGame = loadedGamesData[gameIndex];
        }

        if (!targetGame && downloadBtn.href) {
            targetGame = loadedGamesData.find(g => g.downloadUrl && downloadBtn.href.includes(g.downloadUrl));
        }

        if (targetGame && targetGame.downloadParts && targetGame.downloadParts.length > 0) {
            e.preventDefault();
            showDownloadPartsModal(targetGame);
            return;
        }

        const targetUrl = downloadBtn.getAttribute('href');
        if (!targetUrl || targetUrl === '#' || targetUrl === 'undefined' || targetUrl === '') return;
        if (downloadBtn.classList.contains('preparing')) return;

        e.preventDefault();
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

    let gamesArray = [];
    if (Array.isArray(rawData)) {
        gamesArray = rawData;
    } else if (rawData && typeof rawData === 'object') {
        gamesArray = rawData.games || rawData.data || rawData.list || Object.values(rawData).find(Array.isArray) || [];
    }

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

    // Populate both dropdowns dynamically
    populateCategoryDropdown(games);
    populateFranchiseDropdown(games);

    // Exact Custom Featured Games Filter:
    // - Excludes any 1.57 version games
    // - Includes ETS2 Tanzania (PC) and ETS2 Mobile
    // - Includes Spider-Man, GTA 5 / Legacy, NFS Heat, FIFA 22, and Black Ops 3 Zombie
    const featuredGames = games.filter(game => {
        const title = (game.title || "").toLowerCase();
        
        // Exclude unwanted 1.57 versions explicitly
        if (title.includes("1.57")) return false;

        const isEtsTanzaniaOrMobile = title.includes("euro truck") && (title.includes("tanzania") || title.includes("tz") || title.includes("mobile") || title.includes("android"));
        
        return isEtsTanzaniaOrMobile || 
               title.includes("spider-man") || 
               title.includes("gta v") || 
               title.includes("gta 5") || 
               title.includes("heat") || 
               title.includes("fifa 22") || 
               title.includes("black ops 3");
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

    // Handle normal navigation tab click ("Home Store" button reset)
    document.querySelectorAll('.portal-navbar .nav-tab:not(select)').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.portal-navbar .nav-tab:not(select)').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = "all";
            
            // Reset dropdowns when clicking standard tab
            const categoryDropdown = document.getElementById('categoryDropdown');
            if (categoryDropdown) categoryDropdown.value = "all";
            const franchiseDropdown = document.getElementById('franchiseDropdown');
            if (franchiseDropdown) franchiseDropdown.value = "all";
            currentFranchise = "all";

            applyFilters();
        });
    });

    // Handle category dropdown changes
    const categoryDropdown = document.getElementById('categoryDropdown');
    if (categoryDropdown) {
        categoryDropdown.addEventListener('change', (e) => {
            currentCategory = e.target.value.toLowerCase();
            document.querySelectorAll('.portal-navbar .nav-tab:not(select)').forEach(t => t.classList.remove('active'));
            applyFilters();
        });
    }

    // Handle franchise dropdown changes
    const franchiseDropdown = document.getElementById('franchiseDropdown');
    if (franchiseDropdown) {
        franchiseDropdown.addEventListener('change', (e) => {
            currentFranchise = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    const closeModalBtn = document.querySelector('.close-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalDirect);

    const fullscreenCloseBtn = document.querySelector('.fullscreen-close');
    if (fullscreenCloseBtn) fullscreenCloseBtn.addEventListener('click', closeFullScreen);
}

// Helper to populate category dropdown safely
function populateCategoryDropdown(games) {
    const dropdown = document.getElementById('categoryDropdown');
    if (!dropdown) return;

    let uniqueCategories = new Set();
    games.forEach(game => {
        const rawCategory = game.category || game.Category || game.genre || game.tags || "";
        if (rawCategory) {
            const catString = Array.isArray(rawCategory) ? rawCategory.join('/') : String(rawCategory);
            catString.split('/').forEach(cat => {
                let cleanCat = cat.trim();
                if (cleanCat) uniqueCategories.add(cleanCat);
            });
        }
    });

    dropdown.innerHTML = `<option value="all">📁 Select Category...</option>`;
    uniqueCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.toLowerCase();
        option.textContent = cat;
        dropdown.appendChild(option);
    });
}

// Helper to populate franchise/series dropdown safely
function populateFranchiseDropdown(games) {
    const dropdown = document.getElementById('franchiseDropdown');
    if (!dropdown) return;

    let uniqueFranchises = new Set();
    games.forEach(game => {
        let franchise = game.franchise || game.series;
        
        if (!franchise && game.title) {
            const title = game.title.toLowerCase();
            if (title.includes("need for speed")) franchise = "Need for Speed";
            else if (title.includes("call of duty")) franchise = "Call of Duty";
            else if (title.includes("grand theft auto") || title.includes("gta")) franchise = "Grand Theft Auto";
            else if (title.includes("euro truck simulator")) franchise = "Euro Truck Simulator";
            else if (title.includes("spider-man")) franchise = "Spider-Man";
            else if (title.includes("carx street")) franchise = "CarX Street";
            else if (title.includes("fifa")) franchise = "FIFA";
        }

        if (franchise) {
            uniqueFranchises.add(franchise.trim());
        }
    });

    dropdown.innerHTML = `<option value="all">🎮 Select Franchise...</option>`;
    uniqueFranchises.forEach(fran => {
        const option = document.createElement('option');
        option.value = fran.toLowerCase();
        option.textContent = fran;
        dropdown.appendChild(option);
    });
}

function renderFeaturedMarquee(sliderGames) {
    const track = document.getElementById("featuredTrack");
    if (!track) return;

    track.innerHTML = sliderGames.map((game) => {
        const originalIndex = loadedGamesData.indexOf(game);
        return `
            <div class="marquee-game-card">
                <img class="marquee-game-img" src="${game.image}" alt="${game.title}" loading="lazy" onerror="this.src='images/nfsmw-shot1.png';">
                <div class="marquee-game-content">
                    <span class="marquee-game-badge">${game.platform || 'Game'}</span>
                    <h4>${game.title}</h4>
                    <p>${game.description || ''}</p>
                    <div class="marquee-game-footer">
                        <span class="marquee-price">${game.price || 'FREE'}</span>
                        <button class="btn-details" onclick="openDetails(${originalIndex})" style="padding: 4px 8px; font-size: 0.75rem;">View</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPopularList(popularGames) {
    const container = document.getElementById("popularList");
    if (!container) return;

    container.innerHTML = popularGames.map((game) => {
        const originalIndex = loadedGamesData.indexOf(game);
        return `
            <div class="popular-item" onclick="openDetails(${originalIndex})" style="cursor: pointer;">
                <img src="${game.image}" alt="${game.title}" loading="lazy" onerror="this.src='images/nfsmw-shot1.png';">
                <div class="popular-item-info">
                    <h5>${game.title}</h5>
                    <span>${game.price || 'FREE'}</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: var(--text-muted);"></i>
            </div>
        `;
    }).join('');
}

function applyFilters() {
    const filteredGames = loadedGamesData.filter(game => {
        const title = (game.title || "").toLowerCase();
        const description = (game.description || "").toLowerCase();
        const category = (game.category || game.Category || "").toLowerCase();
        const platform = (game.platform || "").toLowerCase();
        const franchiseField = (game.franchise || game.series || "").toLowerCase();
        const fullText = (title + " " + description).toLowerCase();

        const matchesSearch = title.includes(currentSearchQuery) || description.includes(currentSearchQuery);

        let matchesCategory = true;
        if (currentCategory !== 'all') {
            matchesCategory = category.includes(currentCategory) || platform.includes(currentCategory);
        }

        let matchesFranchise = true;
        if (currentFranchise !== 'all') {
            matchesFranchise = franchiseField.includes(currentFranchise) || fullText.includes(currentFranchise);
        }

        return matchesSearch && matchesCategory && matchesFranchise;
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
                <p>No games found matching your search or filters.</p>
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
        
        const targetUrl = game.downloadUrl || (game.downloadParts && game.downloadParts.length > 0 ? "#" : "");

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
                <span class="category-tag">${game.category || game.Category || "General"}</span>
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

    const identifier = game.id !== undefined ? game.id : index;
    window.location.href = `details.html?id=${identifier}`;
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
    const fullModal = document.getElementById("fullscreenOverlay");
    const fullImg = document.getElementById("fullscreenImg");
    if (fullImg) fullImg.src = imgSrc;
    if (fullModal) fullModal.classList.add("active");
}

function closeFullScreen() {
    const fullModal = document.getElementById("fullscreenOverlay");
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
