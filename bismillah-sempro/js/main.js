// ==================== GAME CONFIGURATION ====================
const DOCUMENTS = [
    {
        level: 1,
        image: 'assets/images/doc1.jpg',
        caption: 'Depok punya cerita, meskipun belum tau bakal cinta',
        difficulty: 'easy'
    },
    {
        level: 2,
        image: 'assets/images/doc2.jpg',
        caption: 'Kirain pelantikan dua dua, ternyata awal mula kisah kita berdua',
        difficulty: 'medium'
    },
    {
        level: 3,
        image: 'assets/images/doc3.jpg',
        caption: 'Cewek hebat mana yang mau nyempetin dateng ke rumah cowonya padahal lagi liburan keluarga',
        difficulty: 'hard'
    }
];

// ==================== GAME STATE VALIDATION ====================
function getValidLevel() {
    const stored = parseInt(localStorage.getItem('currentLevel'));
    if (stored >= 1 && stored <= 3) {
        return stored;
    }
    localStorage.setItem('currentLevel', '1');
    return 1;
}

function getValidLives() {
    const stored = parseInt(localStorage.getItem('lives'));
    if (stored >= 1 && stored <= 3) {
        return stored;
    }
    return 3;
}

let currentLevel = getValidLevel();
let collectedDocs = JSON.parse(localStorage.getItem('documents')) || [];
let lives = getValidLives();
let documentCollected = false;
let isRespawning = false;
let deathCheckInterval = null;

console.log('=== GAME INITIALIZED ===');
console.log('Level:', currentLevel);
console.log('Lives:', lives);
console.log('Collected:', collectedDocs.length);

// ==================== UI UPDATES ====================
function updateUI() {
    document.getElementById('levelDisplay').textContent = currentLevel;
    document.getElementById('collectedDisplay').textContent = `${collectedDocs.length}/3`;
    document.getElementById('livesDisplay').textContent = lives;
}

updateUI();

// ==================== PHASER CONFIG ====================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player, playerEmoji, playerBody, platforms, goal, goalBg, goalEmoji, obstacles, cursors;
let canMove = true;
let jumpPressed = false;
let scene;

// ==================== PRELOAD ====================
function preload() {
    scene = this;
}

// ==================== CREATE ====================
function create() {
    scene = this;
    documentCollected = false;
    isRespawning = false;
    
    console.log('Creating Level:', currentLevel);
    
    // Sky & Clouds
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB);
    this.add.ellipse(150, 80, 100, 50, 0xFFFFFF, 0.7);
    this.add.ellipse(350, 120, 120, 60, 0xFFFFFF, 0.7);
    this.add.ellipse(550, 90, 100, 50, 0xFFFFFF, 0.7);
    this.add.ellipse(700, 110, 110, 55, 0xFFFFFF, 0.7);
    
    platforms = this.physics.add.staticGroup();
    
    // Platform Helper
    function createPlatform(x, y, width, height) {
        const platform = platforms.create(x, y, null);
        platform.setSize(width, height);
        platform.setOrigin(0.5, 0.5);
        platform.refreshBody();
        
        const rect = scene.add.rectangle(x, y, width, height, 0x8B4513);
        rect.setStrokeStyle(3, 0x654321);
        scene.add.rectangle(x, y - height/2 + 2, width - 6, 4, 0xA0522D);
        
        const grassCount = Math.floor(width / 20);
        for (let i = 0; i < grassCount; i++) {
            const grassX = x - width/2 + (i * 20) + 10;
            scene.add.text(grassX, y - height/2 - 5, '🌿', { fontSize: '12px' });
        }
    }
    
    // Level Designs
    if (currentLevel === 1) {
        createPlatform(400, 580, 800, 50);
        createPlatform(200, 460, 280, 30);
        createPlatform(600, 360, 280, 30);
        createPlatform(200, 260, 280, 30);
        
    } else if (currentLevel === 2) {
        createPlatform(150, 580, 300, 50);
        createPlatform(450, 480, 220, 30);
        createPlatform(650, 380, 220, 30);
        createPlatform(300, 280, 220, 30);
        createPlatform(650, 180, 220, 30);
        
        obstacles = this.physics.add.group();
        const obs1 = obstacles.create(320, 530, null);
        obs1.setSize(35, 35);
        obs1.setOrigin(0.5, 0.5);
        obs1.setImmovable(true);
        obs1.body.allowGravity = false;
        
        this.add.rectangle(320, 530, 35, 35, 0xFF0000);
        this.add.text(320, 530, '⚠️', { fontSize: '24px' }).setOrigin(0.5);
        
    } else if (currentLevel === 3) {
        createPlatform(120, 580, 240, 50);
        createPlatform(380, 500, 180, 30);
        createPlatform(600, 420, 180, 30);
        createPlatform(320, 340, 180, 30);
        createPlatform(600, 260, 180, 30);
        createPlatform(320, 180, 180, 30);
        createPlatform(650, 100, 220, 30);
        
        obstacles = this.physics.add.group();
        
        const obstaclePositions = [
            {x: 300, y: 500},
            {x: 480, y: 370},
            {x: 400, y: 180}
        ];
        
        obstaclePositions.forEach(pos => {
            const obs = obstacles.create(pos.x, pos.y, null);
            obs.setSize(35, 35);
            obs.setOrigin(0.5, 0.5);
            obs.setImmovable(true);
            obs.body.allowGravity = false;
            
            this.add.rectangle(pos.x, pos.y, 35, 35, 0xFF0000);
            this.add.text(pos.x, pos.y, '⚠️', { fontSize: '24px' }).setOrigin(0.5);
        });
    }
    
    // Player
    player = this.physics.add.sprite(100, 400, null);
    player.setSize(40, 40);
    player.setOrigin(0.5, 0.5);
    player.setCollideWorldBounds(true);
    player.setBounce(0.05);
    
    playerBody = this.add.circle(100, 400, 20, 0x4A90E2);
    playerBody.setStrokeStyle(3, 0x2E5C8A);
    
    playerEmoji = this.add.text(100, 400, '🎓', { fontSize: '36px' });
    playerEmoji.setOrigin(0.5);
    playerEmoji.setDepth(10);
    
    // Goal
    const goalY = currentLevel === 1 ? 210 : currentLevel === 2 ? 130 : 50;
    const goalX = currentLevel === 1 ? 200 : currentLevel === 2 ? 650 : 650;
    
    goal = this.physics.add.sprite(goalX, goalY, null);
    goal.setSize(70, 70);
    goal.setOrigin(0.5, 0.5);
    goal.setImmovable(true);
    goal.body.allowGravity = false;
    
    goalBg = this.add.rectangle(goalX, goalY, 50, 50, 0xFFD700);
    goalBg.setStrokeStyle(4, 0xFF8C00);
    
    goalEmoji = this.add.text(goalX, goalY, '📄', { fontSize: '40px' });
    goalEmoji.setOrigin(0.5);
    goalEmoji.setDepth(5);
    
    this.tweens.add({
        targets: [goalBg, goalEmoji],
        y: goalY - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Physics
    this.physics.add.collider(player, platforms);
    
    if (obstacles) {
        this.physics.add.collider(obstacles, platforms);
        this.physics.add.overlap(player, obstacles, function(p, obs) {
            if (!isRespawning && !documentCollected) {
                console.log('HIT OBSTACLE!');
                hitObstacle();
            }
        }, null, this);
    }
    
    this.physics.add.overlap(player, goal, function() {
        if (!documentCollected) {
            console.log('GOAL REACHED!');
            documentCollected = true;
            collectDocument();
        }
    }, null, this);
    
    cursors = this.input.keyboard.createCursorKeys();
    
    const instructionBg = this.add.rectangle(400, 30, 650, 40, 0xFFFFFF, 0.9);
    instructionBg.setStrokeStyle(2, 0x000000);
    this.add.text(400, 30, 'Gunakan ⬅️ ➡️ untuk bergerak | ⬆️ atau SPASI untuk melompat', {
        fontSize: '16px',
        fill: '#000',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.playerBody = playerBody;
    
    // Start death check interval
    startDeathCheck();
}

// ==================== DEATH CHECK SYSTEM ====================
function startDeathCheck() {
    if (deathCheckInterval) {
        clearInterval(deathCheckInterval);
    }
    
    deathCheckInterval = setInterval(function() {
        if (!player || isRespawning || documentCollected || !canMove) {
            return;
        }
        
        const DEATH_ZONE = 620;
        const FAST_FALL_ZONE = 590;
        const FAST_FALL_VELOCITY = 150;
        
        // Check 1: Below death zone
        if (player.y > DEATH_ZONE) {
            console.log('DEATH CHECK 1: Y > 620 →', player.y);
            triggerDeath();
            return;
        }
        
        // Check 2: Falling fast
        if (player.y > FAST_FALL_ZONE && player.body.velocity.y > FAST_FALL_VELOCITY) {
            console.log('DEATH CHECK 2: Fast fall → Y:', player.y, 'Vel:', player.body.velocity.y);
            triggerDeath();
            return;
        }
        
        // Check 3: Below all platforms and not grounded
        const onGround = player.body.blocked.down || player.body.touching.down;
        if (player.y > 580 && !onGround && player.body.velocity.y > 0) {
            console.log('DEATH CHECK 3: Below platforms, not grounded');
            triggerDeath();
            return;
        }
        
    }, 50); // Check every 50ms
}

function triggerDeath() {
    if (isRespawning) return;
    console.log('TRIGGER DEATH!');
    loseLife();
}

// ==================== UPDATE ====================
function update() {
    if (!canMove || isRespawning) return;
    
    if (player && playerEmoji && this.playerBody) {
        playerEmoji.x = player.x;
        playerEmoji.y = player.y;
        this.playerBody.x = player.x;
        this.playerBody.y = player.y;
    }
    
    if (player && goal && !documentCollected) {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            goal.x, goal.y
        );
        
        if (distance < 60) {
            documentCollected = true;
            collectDocument();
        }
    }
    
    if (cursors.left.isDown) {
        player.setVelocityX(-250);
        playerEmoji.setScale(-1, 1);
    } else if (cursors.right.isDown) {
        player.setVelocityX(250);
        playerEmoji.setScale(1, 1);
    } else {
        player.setVelocityX(0);
    }
    
    const onGround = player.body.blocked.down || player.body.touching.down;
    
    if (cursors.up.isDown && onGround && !jumpPressed) {
        player.setVelocityY(-580);
        jumpPressed = true;
    }
    
    if (cursors.space && cursors.space.isDown && onGround && !jumpPressed) {
        player.setVelocityY(-580);
        jumpPressed = true;
    }
    
    if (!cursors.up.isDown && (!cursors.space || !cursors.space.isDown)) {
        jumpPressed = false;
    }
    
    if (!onGround) {
        playerEmoji.rotation += 0.1;
    } else {
        playerEmoji.rotation = 0;
    }
}

// ==================== GAME FUNCTIONS ====================
function hitObstacle() {
    if (isRespawning) return;
    loseLife();
}

function loseLife() {
    if (isRespawning) return;
    
    console.log('LOSE LIFE! Current lives:', lives);
    isRespawning = true;
    
    lives--;
    localStorage.setItem('lives', lives);
    updateUI();
    
    if (lives <= 0) {
        canMove = false;
        if (deathCheckInterval) {
            clearInterval(deathCheckInterval);
        }
        document.getElementById('gameOver').classList.remove('hidden');
    } else {
        if (playerEmoji) playerEmoji.setAlpha(0.3);
        if (playerBody) playerBody.setAlpha(0.3);
        
        setTimeout(function() {
            player.setPosition(100, 400);
            player.setVelocity(0, 0);
            if (playerEmoji) {
                playerEmoji.rotation = 0;
                playerEmoji.setAlpha(1);
            }
            if (playerBody) {
                playerBody.setAlpha(1);
            }
            isRespawning = false;
        }, 800);
    }
}

function collectDocument() {
    canMove = false;
    
    if (deathCheckInterval) {
        clearInterval(deathCheckInterval);
    }
    
    const doc = DOCUMENTS[currentLevel - 1];
    const alreadyCollected = collectedDocs.some(d => d.level === doc.level);
    
    if (!alreadyCollected) {
        collectedDocs.push(doc);
        localStorage.setItem('documents', JSON.stringify(collectedDocs));
        console.log('Document collected! Total:', collectedDocs.length);
    }
    
    setTimeout(function() {
        const modal = document.getElementById('levelComplete');
        const imgElement = document.getElementById('docImage');
        const captionElement = document.getElementById('docCaption');
        
        if (!modal) {
            alert('Level complete! ' + doc.caption);
            setTimeout(nextLevel, 1000);
            return;
        }
        
        if (imgElement) {
            imgElement.src = doc.image;
            imgElement.onload = function() {
                console.log('Image loaded successfully');
            };
            imgElement.onerror = function() {
                console.error('Failed to load image:', doc.image);
            };
        }
        
        if (captionElement) {
            captionElement.textContent = doc.caption;
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('show');
        
    }, 200);
}

function nextLevel() {
    console.log('Next level. Current:', currentLevel);
    
    const modal = document.getElementById('levelComplete');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
    }
    
    if (currentLevel < 3) {
        currentLevel++;
        localStorage.setItem('currentLevel', currentLevel);
        console.log('Going to level:', currentLevel);
        location.reload();
    } else {
        console.log('All levels complete! Going to gallery');
        window.location.href = 'gallery.html';
    }
}

function restartLevel() {
    location.reload();
}

function restartFromBeginning() {
    console.log('Clearing all progress');
    localStorage.clear();
    window.location.href = 'index.html';
}

window.nextLevel = nextLevel;
window.restartFromBeginning = restartFromBeginning;