let loadedGamesData = [];

document.addEventListener("DOMContentLoaded", () => {
    // Detects gamesData or games automatically
    const dataList = (typeof gamesData !== "undefined") ? gamesData : ((typeof games !== "undefined") ? games : null);

    if (dataList) {
        renderGameStore(dataList);
    } else {
        console.error("No game array found. Check games-data.js.");
    }
});

function renderGameStore(gameList) {
    loadedGamesData = gameList;
    const container = document.getElementById("game-grid");
    if (!container) return;

    container.innerHTML = "";

    gameList.forEach((game, index) => {
        const card = document.createElement("div");
        card.classList.add("game-card");

        // Dynamic check for free pricing
        const priceText = String(game.price || "").trim().toUpperCase();
        const isFree = priceText === "FREE" || priceText === "0" || priceText.includes("FREE");

        // Label buttons as "Download" for free items and "Buy Now" for paid items
        const actionBtnText = isFree ? "Download" : "Buy Now";
        const actionBtnClass = isFree ? "btn-get" : "btn-download";

        // Fallback target URL if downloadUrl is missing
        const targetUrl = game.downloadUrl || "https://wa.me/255692752060";

        // Action group HTML builder supporting optional secondary Vodacom payment link
        let actionButtonsHTML = `
            <a href="${targetUrl}" target="_blank" ${isFree ? 'download' : ''} class="btn-action ${actionBtnClass}">${actionBtnText}</a>
        `;

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
                <img src="${game.image}" 
                     alt="${game.title}" 
                     class="game-img" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='images/nfsmw-shot1.png';" />
            </div>
            <div class="game-details">
                <span class="category-tag">${game.category || "General"}</span>
                <h3>${game.title}</h3>
                <p>${game.description || ""}</p>
                <div class="card-action">
                    <span class="price">${game.price}</span>
                    <div class="action-group">
                        <button class="btn-details" onclick="openDetails(${index})">Details</button>
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

    const priceText = String(game.price || "").trim().toUpperCase();
    const isFree = priceText === "FREE" || priceText === "0" || priceText.includes("FREE");

    const modalBtnText = isFree ? "Download" : "Buy Now";
    const modalBtnClass = isFree ? "btn-get" : "btn-download";
    const targetUrl = game.downloadUrl || "https://wa.me/255692752060";

    document.getElementById("modal-title").innerText = game.title;
    document.getElementById("modal-desc").innerText = game.description || "";
    document.getElementById("modal-req").innerText = game.requirements || "Standard System Requirements";
    document.getElementById("modal-price").innerText = game.price;

    // Build modal action container supporting both primary and optional secondary checkout buttons
    const actionGroupContainer = document.getElementById("modal-buy").parentNode;
    
    let modalButtonsHTML = `
        <a id="modal-buy" href="${targetUrl}" target="_blank" ${isFree ? 'download' : ''} class="btn-action ${modalBtnClass}">${modalBtnText}</a>
    `;

    if (game.altDownloadUrl) {
        modalButtonsHTML += `
            <a href="${game.altDownloadUrl}" target="_blank" class="btn-action btn-vodacom" style="margin-top: 8px;">
                💬 Buy via WhatsApp (Vodacom)
            </a>
        `;
    }
    actionGroupContainer.innerHTML = modalButtonsHTML;

    const gallery = document.getElementById("modal-gallery");
    gallery.innerHTML = "";

    if (game.screenshots && game.screenshots.length > 0) {
        game.screenshots.forEach((imgSrc) => {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = "Screenshot";
            img.onerror = function () {
                this.src = "images/nfsmw-shot1.png";
            };
            img.onclick = function () {
                openFullScreen(imgSrc);
            };
            gallery.appendChild(img);
        });
    } else {
        const img = document.createElement("img");
        img.src = game.image;
        img.onclick = function () {
            openFullScreen(game.image);
        };
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
