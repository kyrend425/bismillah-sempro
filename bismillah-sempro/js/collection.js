// ==================== LOAD DOCUMENTS ====================
const documents = JSON.parse(localStorage.getItem('documents')) || [];
const gallery = document.getElementById('gallery');

console.log('Gallery loaded. Documents:', documents.length);

if (documents.length === 0) {
    console.log('No documents found, redirecting to index');
    window.location.href = 'index.html';
}

// Display documents with staggered animation
documents.forEach((doc, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.style.animationDelay = `${0.2 + (index * 0.2)}s`;
    
    card.innerHTML = `
        <span class="level-badge">Tahap ${doc.level}</span>
        <img src="${doc.image}" alt="Document ${doc.level}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2220%22>Foto tidak dapat dimuat</text></svg>'">
        <p>${doc.caption}</p>
    `;
    gallery.appendChild(card);
});

// ==================== CONFETTI EFFECT ====================
function createConfetti() {
    const confetti = document.getElementById('confetti');
    const emojis = ['🎉', '🎊', '🎂', '💝', '🎈', '✨', '⭐', '💖', '🎁', '🌟'];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#ffd700'];
    
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            
            // Random: emoji or colored square
            if (Math.random() > 0.5) {
                piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                piece.style.fontSize = (15 + Math.random() * 25) + 'px';
            } else {
                piece.style.width = (5 + Math.random() * 10) + 'px';
                piece.style.height = piece.style.width;
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            }
            
            piece.style.position = 'fixed';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.top = '-50px';
            piece.style.pointerEvents = 'none';
            piece.style.zIndex = '1';
            
            const duration = 3 + Math.random() * 4;
            const rotation = Math.random() * 720 - 360;
            const drift = Math.random() * 200 - 100;
            
            piece.style.animation = `confettiFall ${duration}s linear forwards`;
            piece.style.setProperty('--drift', drift + 'px');
            piece.style.setProperty('--rotation', rotation + 'deg');
            
            confetti.appendChild(piece);
            
            setTimeout(() => piece.remove(), duration * 1000);
        }, i * 30);
    }
}

// Add confetti animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to { 
            top: 100vh; 
            transform: translateX(var(--drift)) rotate(var(--rotation));
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Trigger confetti
setTimeout(createConfetti, 300);
setInterval(createConfetti, 8000); // Repeat every 8 seconds

// ==================== QR CODE EFFECTS ====================
const qrImage = document.getElementById('qrImage');
if (qrImage) {
    qrImage.onerror = function() {
        console.error('QR Code image not found');
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250"><rect fill="%23f5f5f5" width="250" height="250"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="16">QR Code tidak ditemukan</text></svg>';
        this.parentElement.style.background = '#fff3cd';
    };
    
    qrImage.onload = function() {
        console.log('QR Code loaded successfully');
        this.classList.add('qr-loaded');
    };
}

// ==================== ACTIONS ====================
function playAgain() {
    if (confirm('Mulai dari awal? Progress akan direset.')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

function downloadCollection() {
    console.log('Downloading collection...');
    
    let htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Koleksi Kenangan Spesial</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    padding: 40px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                h1 { 
                    text-align: center; 
                    color: #333;
                    margin-bottom: 40px;
                    font-size: 42px;
                }
                .doc { 
                    margin: 40px 0; 
                    padding: 30px; 
                    background: #f9f9f9; 
                    border-radius: 15px;
                    border-left: 5px solid #667eea;
                }
                .doc h2 {
                    color: #667eea;
                    margin-bottom: 20px;
                }
                img { 
                    max-width: 100%; 
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    margin: 20px 0;
                }
                .caption {
                    font-size: 18px;
                    line-height: 1.8;
                    color: #555;
                    font-style: italic;
                }
                .footer {
                    text-align: center;
                    margin-top: 60px;
                    padding-top: 30px;
                    border-top: 2px solid #ddd;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎂 Koleksi Kenangan Spesial</h1>
    `;
    
    documents.forEach(doc => {
        htmlContent += `
            <div class="doc">
                <h2>📄 Tahap ${doc.level}</h2>
                <img src="${doc.image}" alt="Dokumen ${doc.level}">
                <p class="caption">${doc.caption}</p>
            </div>
        `;
    });
    
    htmlContent += `
                <div class="footer">
                    <p>💝 Dibuat dengan cinta oleh Kyrend</p>
                    <p>🎉 ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'koleksi-kenangan-spesial.html';
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('Download initiated');
}

// Make functions global
window.playAgain = playAgain;
window.downloadCollection = downloadCollection;