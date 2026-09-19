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
        if (e.target.closest('.btn-action') || e.target.closest('.btn-details') || e.target.closest('.part-btn')) {
            localStorage.setItem('scrollPosition', window.scrollY);
        }
    });

    // 3. Sleek loading animation handler for download / get buttons
    document.addEventListener('click', function(e) {
        const downloadBtn = e.target.closest('.btn-download, .btn-get, .part-btn');
        if (!downloadBtn) return;

        const targetUrl = downloadBtn.getAttribute('href');
        if (!targetUrl || targetUrl === '#') return;
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

    // 4. Fetch games data with an absolute/relative path check and robust fallback
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
            console.warn("Fetch failed, activating comprehensive fallback catalog:", err);
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
                    id: 12,
                    title: "Marvel’s Spider-Man: Miles Morales",
                    platform: "PC",
                    category: "Action",
                    description: "Experience the rise of Miles Morales as new powers unfold.",
                    requirements: "OS: Windows 10 (64-bit) | RAM: 8 GB",
                    price: "FREE",
                    image: "images/spider-man.jpg",
                    screenshots: [],
                    downloadUrl: "https://wa.me/255692752060"
                },
                {
                    id: 13,
                    title: "FIFA 22",
                    platform: "PC",
                    category: "Sports",
                    description: "Powered by Football, FIFA 22 brings the game even closer to the real thing.",
                    requirements: "OS: Windows 10 (64-bit) | RAM: 8 GB",
                    price: "FREE",
                    image: "images/fifa22.jpg",
                    screenshots: [],
                    downloadUrl: "https://wa.me/255692752060"
                }
            ]);
        });
});

function initStore(games) {
    loadedGamesData = games;

    // --- SMART GUIDANCE LOGIC ---
    const featuredGames = games.filter(game => {
        const title = (game.title || "").toLowerCase();
        return title.includes("euro truck simulator") || 
               title.includes("call of duty") || 
               title.includes("carx street") || 
               title.includes("fifa 22");
    });
    renderFeaturedMarquee(featuredGames.length ? featuredGames : games); 

    const popularGames = games.filter(game => {
        const title = (game.title || "").toLowerCase();
        return title.includes("euro truck simulator") || 
               title.includes("gta") || 
               title.includes("spider-man") || 
               title.includes("fifa 22");
    });
    renderPopularList(popularGames.length ? popularGames : games);
    // ----------------------------

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
            currentCategory = tab.getAttribute('data-category').toLowerCase();
            applyFilters();
        });
    });

    // Modal Close Triggers
    const closeModalBtn = document.querySelector('.close-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModalDirect);
    }

    const fullscreenCloseBtn = document.querySelector('.fullscreen-close');
    if (fullscreenCloseBtn) {
        fullscreenCloseBtn.addEventListener('click', closeFullScreen);
    }
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

// Helper function to generate action buttons whether single URL or multi-parts
function generateActionButtons(game) {
    const priceText = String(game.price || "").trim().toUpperCase();
    const isFree = priceText === "FREE" || priceText === "0" || priceText.includes("FREE");

    // Check if the game contains multi-part download links
    if (game.downloadParts && game.downloadParts.length > 0) {
        let partsHTML = game.downloadParts.map(part => {
            const partUrl = part.url && part.url.trim() !== "" ? part.url : "#";
            return `<a href="${partUrl}" target="_blank" class="btn-action btn-get part-btn" style="margin-bottom: 4px;">📥 ${part.part}</a>`;
        }).join('');
        return `<div class="download-parts-container" style="display: flex; flex-direction: column; width: 100%;">${partsHTML}</div>`;
    }

    // Standard single link logic (Free or Paid)
    const actionBtnText = isFree ? "Get" : "Buy Now";
    const actionBtnClass = isFree ? "btn-get" : "btn-download";
    const targetUrl = game.downloadUrl || "https://wa.me/255692752060";

    let actionButtonsHTML = `
        <a href="${targetUrl}" target="_blank" class="btn-action ${actionBtnClass}">${actionBtnText}</a>
    `;

    if (game.altDownloadUrl) {
        actionButtonsHTML += `
            <a href="${game.altDownloadUrl}" target="_blank" class="btn-action btn-vodacom" style="margin-top: 6px;" title="Buy via WhatsApp">
                💬 WhatsApp
            </a>
        `;
    }

    return actionButtonsHTML;
}

function renderGameStore(gameList) {
    const container = document.getElementById("gameGrid");
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
                    <div class="action-group" style="width: 100%;">
                        <button class="btn-details" onclick="openDetails(${originalIndex})" style="margin-bottom: 6px; width: 100%;">Details &rarr;</button>
                        ${generateActionButtons(game)}
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

    const modalBtnGroup = document.getElementById("modal-btn-group");
    if (modalBtnGroup) {
        modalBtnGroup.innerHTML = generateActionButtons(game);
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
