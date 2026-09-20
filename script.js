function renderGameStore(gameList) {
    // Automatically looks for either ID to prevent blank screens
    const container = document.getElementById("gameGrid") || document.getElementById("games-grid");
    if (!container) {
        console.error("Error: Could not find your game container ID in HTML (checked 'gameGrid' and 'games-grid').");
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
