const contentTabs = {
    'daftar-klub': document.getElementById('daftar-klub-content'),
    'cari-klub-pemain': document.getElementById('cari-klub-pemain-content'),
    'filter-data': document.getElementById('filter-data-content'),
    'berita': document.getElementById('berita-content')
};

const clubModal = document.getElementById('clubModal');
const newsModal = document.getElementById('newsModal');
const modalClubContentDetail = document.getElementById('modal-content-detail');
const modalNewsContent = document.getElementById('news-modal-content');


function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function setActiveMenu(activeMenu) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-content') === activeMenu) {
            item.classList.add('active');
        }
    });
}

function navigate(menu) {
    setActiveMenu(menu);

    Object.keys(contentTabs).forEach(key => {
        const tabElement = contentTabs[key];
        if (tabElement) {
            tabElement.classList.remove('active-content');
        }
    });

    const activeContentDiv = contentTabs[menu];
    if (activeContentDiv) {
        activeContentDiv.classList.add('active-content');
        
        switch (menu) {
            case 'daftar-klub':
                renderDaftarKlub(); 
                break;
            case 'berita':
                renderNews();
                break;
            case 'cari-klub-pemain':
                renderSearch(activeContentDiv);
                break;
            case 'filter-data':
                renderFilter(activeContentDiv); 
                break;
        }
    }
}

function createPlayerTableRow(playerString, clubName) {
    const [nama, nomor, posisi] = playerString.split(' - ').map(s => s.trim());
    const playerId = `${nama}-${clubName}`; 
    
    const playerDetail = allPlayers.find(p => p.id === playerId);
    const statusAbsen = playerDetail ? playerDetail.statusAbsen : null;
    const status = statusAbsen ? `<span class="status-absen">(${statusAbsen})</span>` : '';

    return `
        <tr onclick="showPlayerDetail('${playerId.replace(/'/g, "\\'")}')" style="cursor: pointer;">
            <td>${nama} ${status}</td>
            <td>${nomor}</td>
            <td>${posisi}</td>
            <td><button onclick="event.stopPropagation(); showPlayerDetail('${playerId.replace(/'/g, "\\'")}')">Detail</button></td>
        </tr>
    `;
}

function renderNews() {
    const newsListDiv = document.getElementById('newsList'); 
    if (!newsListDiv) return;

    let html = '';
    
    newsData.forEach((item, index) => {
        const isReversed = index % 2 !== 0 ? 'news-item-reversed' : '';
        html += `
            <div class="news-item ${isReversed}" onclick="showNewsDetail(${item.id})">
                <div class="news-thumbnail-container">
                    <img src="${item.gambar}" alt="${item.judul}" class="news-thumbnail" onerror="this.onerror=null;this.src='png/placeholder.jpg';">
                </div>
                <div class="news-info">
                    <h3>${item.judul}</h3>
                    <p>${item.deskripsi.substring(0, 100)}...</p>
                    <button class="read-more-button">Baca Selengkapnya</button>
                </div>
            </div>
        `;
    });
    
    newsListDiv.innerHTML = html;
}

function renderDaftarKlub() {
    const tableBody = document.getElementById('clubTableBody');
    if (!tableBody) return;

    let html = '';
    
    clubData.forEach(club => {
        html += `
            <tr>
                <td>${club.id}</td>
                <td>
                    <img src="${club.logo}" alt="Logo ${club.klub}" class="club-logo-small" onerror="this.onerror=null;this.src='png/placeholder.jpg';">
                    <span class="player-link" onclick="showClubDetail(${club.id})">${club.klub}</span>
                </td>
                <td>${club.negara}</td>
                <td>${club.pelatih}</td>
                <td><button onclick="showClubDetail(${club.id})">Lihat Skuad</button></td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

function renderSearch(contentDiv) {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = '<p>Silakan masukkan nama klub atau pemain untuk mencari.</p>';
    }
    document.getElementById('searchInput').setAttribute('onkeyup', 'performSearch()');
}

function renderFilter(contentDiv) {
    const uniqueNegara = [...new Set(clubData.map(c => c.negara))].sort();
    const uniquePosisi = [...new Set(allPlayers.map(p => p.posisi))].sort();

    const filterNegara = document.getElementById('filterNegara');
    const filterPosisi = document.getElementById('filterPosisi');

    filterNegara.innerHTML = '<option value="">Filter Berdasarkan Negara</option>';
    uniqueNegara.forEach(n => {
        filterNegara.innerHTML += `<option value="${n}">${n}</option>`;
    });

    filterPosisi.innerHTML = '<option value="">Filter Berdasarkan Posisi</option>';
    uniquePosisi.forEach(p => {
        filterPosisi.innerHTML += `<option value="${p}">${p}</option>`;
    });

    const filterResults = document.getElementById('filterResults');
    if (filterResults) {
        filterResults.innerHTML = '<p>Tabel hasil filter akan ditampilkan di bawah.</p>';
    }
}

function showNewsDetail(newsId) {
    const newsItem = newsData.find(item => item.id === newsId);
    if (!newsItem) return;

    modalNewsContent.innerHTML = `
        <div class="news-modal-content-inner">
            <img src="${newsItem.imageLarge || newsItem.gambar}" alt="${newsItem.judul}" class="news-modal-image" onerror="this.onerror=null;this.src='png/placeholder.jpg';">
            <h3>${newsItem.judul}</h3>
            <p>${newsItem.deskripsi}</p>
        </div>
    `;
    newsModal.style.display = 'block';
}

function showClubDetail(clubId) {
    const club = clubData.find(c => c.id === clubId);
    if (!club) return;

    let html = `
        <div class="modal-club-header">
            <img src="${club.logo}" alt="Logo ${club.klub}" class="club-logo-large" onerror="this.onerror=null;this.src='png/placeholder.jpg';">
            <h2>${club.klub}</h2>
        </div>
        <p><strong>Negara:</strong> ${club.negara} | <strong>Pelatih:</strong> ${club.pelatih}</p>
        
        <h3 style="margin-top: 20px;">Daftar Skuad Inti</h3>
    `;

    const renderTableSection = (title, players, clubName) => {
        if (!players || players.length === 0) return '';
        
        if (typeof players[0] === 'string') {
            const tableRows = players.map(p => createPlayerTableRow(p, clubName)).join('');
            
            return `
                <div class="squad-section">
                    <h4>${title} (${players.length} Pemain)</h4>
                    <table class="player-squad-table">
                        <thead>
                            <tr>
                                <th>Nama Pemain</th>
                                <th style="width: 15%;">Nomor</th>
                                <th style="width: 20%;">Posisi</th>
                                <th style="width: 15%;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            `;
        }
        return '';
    };

    html += renderTableSection('Penyerang', club.att, club.klub);
    html += renderTableSection('Pemain Tengah', club.mid, club.klub);
    html += renderTableSection('Belakang/Defender', club.def, club.klub);
    html += renderTableSection('Kiper', club.kiper, club.klub);
    
    modalClubContentDetail.innerHTML = html;
    clubModal.style.display = 'block';
}

function showPlayerDetail(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    const modalContentDetail = document.getElementById('modal-content-detail');

    if (!player) {
        modalContentDetail.innerHTML = '<p>Detail pemain tidak ditemukan.</p>';
        clubModal.style.display = 'block';
        return;
    }

    const club = clubData.find(c => c.klub === player.klub);
    
    const stats2425 = player.stats ? player.stats['2024/2025'] : null;
    const goals = stats2425 && stats2425.goals !== undefined ? stats2425.goals : 0;
    const assists = stats2425 && stats2425.assists !== undefined ? stats2425.assists : 0;
    const games = stats2425 && stats2425.games !== undefined ? stats2425.games : 0;

    let statsContent;
    
    if (!stats2425) {
        statsContent = `<p>Statistik belum tersedia untuk musim ini.</p>`;
    } else {
        statsContent = `
            <p><strong>Bermain:</strong> ${games} Laga</p>
            <p><strong>Goal:</strong> ${goals}</p>
            <p><strong>Assist:</strong> ${assists}</p>
        `;
    }

    const statusText = player.statusAbsen ? `<span class="status-absen">${player.statusAbsen}</span>` : 'Tidak Absen';
    
    const backButton = club ? 
        `<button class="read-more-button" style="margin-top: 20px;" onclick="showClubDetail(${club.id})">
            Kembali ke Skuad ${club.klub}
        </button>` : '';

    modalContentDetail.innerHTML = `
        <div class="modal-player-header">
            <h2>${player.nama} (#${player.nomor})</h2>
        </div>
        
        <div class="player-detail-section">
            <p><strong>Klub Saat Ini:</strong> ${player.klub} (${player.negara})</p>
            <p><strong>Posisi Utama:</strong> ${player.posisi}</p>
            <p><strong>Status Absen:</strong> ${statusText}</p>
        </div>

        <h4>Statistik Musim 2024/2025:</h4>
        <div class="stats-box">
            ${statsContent}
        </div>

        <h4>Deskripsi Pemain:</h4>
        <p>${player.description || 'Tidak ada deskripsi yang tersedia.'}</p>
        
        ${backButton}
    `;

    clubModal.style.display = 'block';
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    
    if (!query) {
        resultsDiv.innerHTML = '<p>Silakan masukkan nama klub atau pemain untuk mencari.</p>';
        return;
    }

    const clubResults = clubData.filter(klub => 
        klub.klub.toLowerCase().includes(query) || klub.pelatih.toLowerCase().includes(query)
    );

    const playerResults = allPlayers.filter(pemain => 
        pemain.nama.toLowerCase().includes(query)
    );

    let html = `<h3>Hasil Pencarian untuk "${query}"</h3>`;

    html += '<h4>⚽ Hasil Klub:</h4>';
    if (clubResults.length > 0) {
        html += '<table class="club-table">';
        clubResults.forEach(klub => {
            html += `
                <tr>
                    <td><img src="${klub.logo}" class="club-logo-small" alt="Logo" onerror="this.onerror=null;this.src='png/placeholder.jpg';">${klub.klub}</td>
                    <td>${klub.negara}</td>
                    <td><button onclick="showClubDetail(${klub.id})">Lihat Skuad</button></td>
                </tr>
            `;
        });
        html += '</table>';
    } else {
        html += '<p>Tidak ada klub yang ditemukan.</p>';
    }

    html += '<h4 style="margin-top: 20px;">🏃 Hasil Pemain:</h4>';
    if (playerResults.length > 0) {
        html += '<table class="player-squad-table">';
        html += '<thead><tr><th>Nama Pemain</th><th>Klub</th><th>Posisi</th><th>Detail</th></tr></thead><tbody>';
        playerResults.forEach(pemain => {
            const playerId = `${pemain.nama}-${pemain.klub}`; 
            html += `
                <tr>
                    <td>${pemain.nama}</td>
                    <td>${pemain.klub}</td>
                    <td>${pemain.posisi}</td>
                    <td><button onclick="showPlayerDetail('${playerId.replace(/'/g, "\\'")}')">Detail</button></td>
                </tr>
            `;
        });
        html += '</tbody></table>';
    } else {
        html += '<p>Tidak ada pemain yang ditemukan.</p>';
    }

    resultsDiv.innerHTML = html;
}

function terapkanFilter() { 
    const negara = document.getElementById('filterNegara').value;
    const posisi = document.getElementById('filterPosisi').value;
    const resultsDiv = document.getElementById('filterResults');

    let filteredPlayers = allPlayers.filter(player => {
        const matchNegara = !negara || player.negara === negara;
        const matchPosisi = !posisi || player.posisi === posisi;
        return matchNegara && matchPosisi;
    });

    if (filteredPlayers.length === 0) {
        resultsDiv.innerHTML = '<p>Tidak ada pemain yang cocok dengan filter yang Anda pilih.</p>';
        return;
    }

    let html = `<h4>Hasil Filter Pemain (${filteredPlayers.length} Pemain):</h4>`;
    html += '<table class="club-table">';
    html += '<thead><tr><th>Nama Pemain</th><th>Klub</th><th>Negara</th><th>Nomor</th><th>Posisi</th><th>Detail</th></tr></thead>';
    html += '<tbody>';
    
    filteredPlayers.forEach(player => {
        const playerId = `${player.nama}-${player.klub}`; 
        
        html += `
            <tr>
                <td><span class="player-link" onclick="showPlayerDetail('${playerId.replace(/'/g, "\\'")}')">${player.nama}</span></td>
                <td>${player.klub}</td>
                <td>${player.negara}</td>
                <td>${player.nomor}</td>
                <td>${player.posisi}</td>
                <td><button onclick="showPlayerDetail('${playerId.replace(/'/g, "\\'")}')">Detail</button></td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    resultsDiv.innerHTML = html;
}