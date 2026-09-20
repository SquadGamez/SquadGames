<script>
        let currentGame = null;

        function getSmartCategories(game) {
            let categories = new Set();
            if (game.category) {
                game.category.split(',').forEach(c => categories.add(c.trim().toLowerCase()));
            }
            if (game.platform) {
                categories.add(game.platform.trim().toLowerCase());
            }

            const textCheck = (game.title + " " + (game.description || "")).toLowerCase();

            if (textCheck.match(/gta|grand theft auto|action/)) categories.add('action');
            if (textCheck.match(/truck|simulator/)) categories.add('simulation');
            if (textCheck.match(/shooting|fps|call of duty/)) categories.add('shooting');
            if (textCheck.match(/carx|nfs|racing|need for speed/)) categories.add('racing');

            return Array.from(categories);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const gameIdParam = urlParams.get('id');

        fetch('games.json')
            .then(res => res.json())
            .then(games => {
                const game = games.find(g => String(g.id) === String(gameIdParam)) || 
                             games[parseInt(gameIdParam)] ||
                             games.find(g => g.title && g.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === gameIdParam);
                
                const container = document.getElementById('gameDetailsContainer');

                if (!game) {
                    container.innerHTML = `
                        <div class="loading-state" style="text-align: center; padding: 40px;">
                            <h2 style="color: #ff4d4d;">Game not found</h2>
                            <p style="color: var(--text-muted); margin: 10px 0;">The game you are looking for does not exist or was removed.</p>
                            <a href="index.html" class="btn-details" style="margin-top: 15px; display: inline-block; text-decoration: none;">Return to Home</a>
                        </div>`;
                    return;
                }

                currentGame = game;
                const smartCats = getSmartCategories(game);
                const downloadUrl = game.downloadUrl || '#';
                
                const priceText = String(game.price || "").trim().toUpperCase();
                const isFree = priceText === "FREE" || priceText === "0" || priceText.includes("FREE");
                const buttonText = isFree ? 'Get / Download Game' : 'Buy / Order Game';
                const buttonClass = isFree ? 'btn-get' : 'btn-download';

                let screenshotsHTML = '';
                const imagesList = (game.screenshots && Array.isArray(game.screenshots) && game.screenshots.length > 0) 
                    ? game.screenshots 
                    : [game.image || 'images/nfsmw-shot1.png'];

                screenshotsHTML = `
                    <div class="stacked-screenshots-section">
                        <h3 style="color: #fff; margin-bottom: 5px; font-size: 1.3rem;"><i class="fa-solid fa-images"></i> Gameplay Screenshots</h3>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 15px;">Scroll down to view high-resolution screenshots of the game.</p>
                        <div class="stacked-gallery">
                            ${imagesList.map(img => `<img src="${img}" alt="Screenshot" onclick="openFullScreen('${img}')" onerror="this.src='images/nfsmw-shot1.png'">`).join('')}
                        </div>
                    </div>
                `;

                let specsHTML = '';
                const gameRequirements = game.requirements || game.specs;
                if (gameRequirements) {
                    specsHTML = `
                        <div class="specs-box" style="margin-top: 20px; background: rgba(255,255,255,0.03); padding: 18px; border-radius: 10px; border: 1px solid var(--border-color);">
                            <strong style="color: #fff; display: block; margin-bottom: 8px; font-size: 1.05rem;"><i class="fa-solid fa-sliders"></i> System Requirements & Specifications:</strong>
                            <p style="margin: 0; color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; white-space: pre-line;">${gameRequirements}</p>
                        </div>
                    `;
                }

                let altButtonHTML = '';
                if (game.altDownloadUrl) {
                    altButtonHTML = `
                        <a href="${game.altDownloadUrl}" class="btn-action btn-vodacom" target="_blank" style="padding: 12px 20px; font-size: 1rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; background: #25d366; color: #fff; font-weight: 600;">
                            <i class="fa-brands fa-whatsapp"></i> Buy via WhatsApp
                        </a>
                    `;
                }

                container.innerHTML = `
                    <div class="apunka-details-layout">
                        <div class="game-main-info-box">
                            <span class="card-badge" style="display: inline-block; padding: 4px 10px; background: var(--accent-blue); color: #fff; border-radius: 6px; font-size: 0.75rem; font-weight: 700; margin-bottom: 12px;">${(game.platform || smartCats[0] || 'PC').toUpperCase()}</span>
                            
                            <h1 style="margin: 0 0 12px 0; font-size: 2.2rem; color: #fff; line-height: 1.2;">${game.title}</h1>
                            
                            <div class="specs-box" style="margin-bottom: 20px; color: var(--text-muted); font-size: 0.9rem;">
                                <strong style="color: #fff;">Categories:</strong> ${smartCats.join(' • ')} &nbsp;|&nbsp; 
                                <strong style="color: #fff;">Platform:</strong> ${game.platform || 'PC / Android'}
                            </div>

                            <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.7; margin-bottom: 20px;">${game.description || 'No description provided.'}</p>
                            
                            <div class="hero-banner-wrapper" onclick="openFullScreen('${game.image || 'images/nfsmw-shot1.png'}')">
                                <img src="${game.image || 'images/nfsmw-shot1.png'}" alt="${game.title}" onerror="this.src='images/nfsmw-shot1.png';">
                            </div>

                            ${specsHTML}

                            <div style="margin-top: 30px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; padding-top: 15px; border-top: 1px solid var(--border-color);">
                                <span class="price" style="font-size: 1.8rem; font-weight: 800; color: #fff;">${game.price || 'FREE'}</span>
                                <a href="${downloadUrl}" id="mainDownloadBtn" target="_blank" class="btn-action ${buttonClass}" style="padding: 12px 28px; font-size: 1rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-download"></i> ${buttonText}
                                </a>
                                ${altButtonHTML}
                            </div>
                        </div>

                        ${screenshotsHTML}
                    </div>
                `;

                // Smart click handler: opens multi-part modal if parts exist, otherwise lets the link open natively.
                const mainDownloadBtn = document.getElementById('mainDownloadBtn');
                if (mainDownloadBtn) {
                    mainDownloadBtn.addEventListener('click', function(e) {
                        if (currentGame && currentGame.downloadParts && currentGame.downloadParts.length > 0) {
                            e.preventDefault(); // Stop direct link, open modal for parts
                            showDownloadPartsModal(currentGame);
                        } else if (!currentGame.downloadUrl || currentGame.downloadUrl === '#') {
                            e.preventDefault();
                            alert('Download link is currently unavailable for this game.');
                        }
                        // If it has a standard single downloadUrl, e.preventDefault() is NOT called, 
                        // so target="_blank" handles opening your link automatically!
                    });
                }
            })
            .catch(error => {
                console.error('Error loading game details:', error);
                document.getElementById('gameDetailsContainer').innerHTML = `
                    <div class="loading-state" style="text-align: center; padding: 40px;">
                        <p style="color: #ff4d4d;">Failed to load game details. Please ensure your games.json file is accessible.</p>
                    </div>`;
            });

        function showDownloadPartsModal(game) {
            let modal = document.getElementById('download-parts-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'download-parts-modal';
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 450px; background: #1e1e1e; padding: 25px; border-radius: 12px; color: #fff; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);">
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
                    if (event.target === modal) closeDownloadPartsManager();
                });
            }

            document.getElementById('parts-modal-title').innerText = `Download: ${game.title}`;
            
            const container = document.getElementById('parts-list-container');
            container.innerHTML = game.downloadParts.map((part, idx) => `
                <a href="${part.url}" target="_blank" class="btn-action btn-get" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; text-decoration: none; border-radius: 6px;">
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
    </script>
