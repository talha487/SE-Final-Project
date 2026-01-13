// Game Navigation
function showGame(gameId) {
    document.querySelectorAll('.game-container').forEach(g => g.classList.remove('active'));
    document.getElementById(gameId).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    event.target.closest('.nav-link').classList.add('active');
}

// ==================== RACING GAME ====================
let raceCanvas, raceCtx;
let raceGame = {
    running: false,
    paused: false,
    score: 0,
    highScore: 0,
    speed: 2,
    player: { x: 0, y: 0, width: 40, height: 70 },
    cars: [],
    road: { offset: 0 },
    keys: {}
};

function initRaceGame() {
    raceCanvas = document.getElementById('raceCanvas');
    raceCtx = raceCanvas.getContext('2d');
    raceCanvas.width = 600;
    raceCanvas.height = 600;
    
    raceGame.player.x = raceCanvas.width / 2 - raceGame.player.width / 2;
    raceGame.player.y = raceCanvas.height - raceGame.player.height - 40;
    
    document.addEventListener('keydown', e => raceGame.keys[e.key] = true);
    document.addEventListener('keyup', e => raceGame.keys[e.key] = false);
}

function startRaceGame() {
    if (!raceCanvas) initRaceGame();
    
    raceGame.running = true;
    raceGame.paused = false;
    raceGame.score = 0;
    raceGame.speed = 2;
    raceGame.cars = [];
    raceGame.player.x = raceCanvas.width / 2 - raceGame.player.width / 2;
    
    gameLoopRace();
}

function pauseRaceGame() {
    raceGame.paused = !raceGame.paused;
    if (!raceGame.paused && raceGame.running) gameLoopRace();
}

function gameLoopRace() {
    if (!raceGame.running || raceGame.paused) return;
    
    updateRaceGame();
    drawRaceGame();
    
    requestAnimationFrame(gameLoopRace);
}

function updateRaceGame() {
    // Player movement
    if (raceGame.keys['ArrowLeft'] && raceGame.player.x > 100) {
        raceGame.player.x -= 5;
    }
    if (raceGame.keys['ArrowRight'] && raceGame.player.x < raceCanvas.width - raceGame.player.width - 100) {
        raceGame.player.x += 5;
    }
    
    // Road animation
    raceGame.road.offset += raceGame.speed * 2;
    if (raceGame.road.offset > 40) raceGame.road.offset = 0;
    
    // Spawn cars
    if (Math.random() < 0.02) {
        const lanes = [150, 250, 350];
        raceGame.cars.push({
            x: lanes[Math.floor(Math.random() * lanes.length)],
            y: -100,
            width: 40,
            height: 70,
            color: ['#ff4444', '#44ff44', '#4444ff', '#ffff44'][Math.floor(Math.random() * 4)]
        });
    }
    
    // Move cars
    raceGame.cars.forEach((car, i) => {
        car.y += raceGame.speed;
        
        // Check collision
        if (checkCollision(raceGame.player, car)) {
            raceGame.running = false;
            if (raceGame.score > raceGame.highScore) {
                raceGame.highScore = raceGame.score;
                document.getElementById('raceHighScore').textContent = raceGame.highScore;
            }
            alert('Game Over! Score: ' + raceGame.score);
        }
        
        // Remove off-screen cars and increase score
        if (car.y > raceCanvas.height) {
            raceGame.cars.splice(i, 1);
            raceGame.score += 10;
            document.getElementById('raceScore').textContent = raceGame.score;
            
            // Increase difficulty
            if (raceGame.score % 100 === 0) {
                raceGame.speed += 0.5;
                document.getElementById('raceSpeed').textContent = (raceGame.speed / 2).toFixed(1) + 'x';
            }
        }
    });
}

function drawRaceGame() {
    // Background
    raceCtx.fillStyle = '#2d5016';
    raceCtx.fillRect(0, 0, raceCanvas.width, raceCanvas.height);
    
    // Road
    raceCtx.fillStyle = '#444';
    raceCtx.fillRect(100, 0, 400, raceCanvas.height);
    
    // Road edges
    raceCtx.fillStyle = '#fff';
    raceCtx.fillRect(95, 0, 10, raceCanvas.height);
    raceCtx.fillRect(495, 0, 10, raceCanvas.height);
    
    // Road lines
    raceCtx.fillStyle = '#ffff00';
    for (let i = -40; i < raceCanvas.height; i += 40) {
        raceCtx.fillRect(245, i + raceGame.road.offset, 10, 20);
        raceCtx.fillRect(345, i + raceGame.road.offset, 10, 20);
    }
    
    // Player car
    drawCar(raceGame.player.x, raceGame.player.y, raceGame.player.width, raceGame.player.height, '#00aaff');
    
    // Enemy cars
    raceGame.cars.forEach(car => {
        drawCar(car.x, car.y, car.width, car.height, car.color);
    });
}

function drawCar(x, y, w, h, color) {
    // Car body
    raceCtx.fillStyle = color;
    raceCtx.fillRect(x, y, w, h);
    
    // Car windows
    raceCtx.fillStyle = '#333';
    raceCtx.fillRect(x + 5, y + 10, w - 10, 15);
    raceCtx.fillRect(x + 5, y + h - 30, w - 10, 15);
    
    // Car wheels
    raceCtx.fillStyle = '#000';
    raceCtx.fillRect(x - 3, y + 10, 6, 15);
    raceCtx.fillRect(x + w - 3, y + 10, 6, 15);
    raceCtx.fillRect(x - 3, y + h - 25, 6, 15);
    raceCtx.fillRect(x + w - 3, y + h - 25, 6, 15);
    
    // Highlights
    raceCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    raceCtx.fillRect(x + 2, y + 2, 10, 20);
}

// ==================== SPACE SHOOTER GAME ====================
let spaceCanvas, spaceCtx;
let spaceGame = {
    running: false,
    paused: false,
    score: 0,
    highScore: 0,
    lives: 3,
    player: { x: 0, y: 0, width: 50, height: 50 },
    bullets: [],
    enemies: [],
    stars: [],
    keys: {},
    shootCooldown: 0
};

function initSpaceGame() {
    spaceCanvas = document.getElementById('spaceCanvas');
    spaceCtx = spaceCanvas.getContext('2d');
    spaceCanvas.width = 600;
    spaceCanvas.height = 600;
    
    spaceGame.player.x = spaceCanvas.width / 2 - 25;
    spaceGame.player.y = spaceCanvas.height - 80;
    
    // Create stars
    for (let i = 0; i < 100; i++) {
        spaceGame.stars.push({
            x: Math.random() * spaceCanvas.width,
            y: Math.random() * spaceCanvas.height,
            size: Math.random() * 2
        });
    }
    
    document.addEventListener('keydown', e => {
        spaceGame.keys[e.key] = true;
        if (e.key === ' ') e.preventDefault();
    });
    document.addEventListener('keyup', e => spaceGame.keys[e.key] = false);
}

function startSpaceGame() {
    if (!spaceCanvas) initSpaceGame();
    
    spaceGame.running = true;
    spaceGame.paused = false;
    spaceGame.score = 0;
    spaceGame.lives = 3;
    spaceGame.bullets = [];
    spaceGame.enemies = [];
    spaceGame.player.x = spaceCanvas.width / 2 - 25;
    
    document.getElementById('spaceScore').textContent = spaceGame.score;
    document.getElementById('spaceLives').textContent = spaceGame.lives;
    
    gameLoopSpace();
}

function pauseSpaceGame() {
    spaceGame.paused = !spaceGame.paused;
    if (!spaceGame.paused && spaceGame.running) gameLoopSpace();
}

function gameLoopSpace() {
    if (!spaceGame.running || spaceGame.paused) return;
    
    updateSpaceGame();
    drawSpaceGame();
    
    requestAnimationFrame(gameLoopSpace);
}

function updateSpaceGame() {
    // Player movement
    if (spaceGame.keys['ArrowLeft'] && spaceGame.player.x > 0) {
        spaceGame.player.x -= 5;
    }
    if (spaceGame.keys['ArrowRight'] && spaceGame.player.x < spaceCanvas.width - spaceGame.player.width) {
        spaceGame.player.x += 5;
    }
    if (spaceGame.keys['ArrowUp'] && spaceGame.player.y > 0) {
        spaceGame.player.y -= 5;
    }
    if (spaceGame.keys['ArrowDown'] && spaceGame.player.y < spaceCanvas.height - spaceGame.player.height) {
        spaceGame.player.y += 5;
    }
    
    // Shooting
    spaceGame.shootCooldown--;
    if (spaceGame.keys[' '] && spaceGame.shootCooldown <= 0) {
        spaceGame.bullets.push({
            x: spaceGame.player.x + spaceGame.player.width / 2 - 2,
            y: spaceGame.player.y,
            width: 4,
            height: 15,
            speed: 7
        });
        spaceGame.shootCooldown = 10;
    }
    
    // Move bullets
    spaceGame.bullets.forEach((bullet, i) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) spaceGame.bullets.splice(i, 1);
    });
    
    // Spawn enemies
    if (Math.random() < 0.02) {
        spaceGame.enemies.push({
            x: Math.random() * (spaceCanvas.width - 40),
            y: -50,
            width: 40,
            height: 40,
            speed: 2 + Math.random() * 2,
            type: Math.floor(Math.random() * 3)
        });
    }
    
    // Move enemies
    spaceGame.enemies.forEach((enemy, i) => {
        enemy.y += enemy.speed;
        
        // Check collision with player
        if (checkCollision(spaceGame.player, enemy)) {
            spaceGame.enemies.splice(i, 1);
            spaceGame.lives--;
            document.getElementById('spaceLives').textContent = spaceGame.lives;
            
            if (spaceGame.lives <= 0) {
                spaceGame.running = false;
                if (spaceGame.score > spaceGame.highScore) {
                    spaceGame.highScore = spaceGame.score;
                    document.getElementById('spaceHighScore').textContent = spaceGame.highScore;
                }
                alert('Game Over! Score: ' + spaceGame.score);
            }
        }
        
        // Remove off-screen enemies
        if (enemy.y > spaceCanvas.height) {
            spaceGame.enemies.splice(i, 1);
        }
        
        // Check collision with bullets
        spaceGame.bullets.forEach((bullet, j) => {
            if (checkCollision(bullet, enemy)) {
                spaceGame.enemies.splice(i, 1);
                spaceGame.bullets.splice(j, 1);
                spaceGame.score += 10;
                document.getElementById('spaceScore').textContent = spaceGame.score;
            }
        });
    });
    
    // Move stars
    spaceGame.stars.forEach(star => {
        star.y += 1;
        if (star.y > spaceCanvas.height) {
            star.y = 0;
            star.x = Math.random() * spaceCanvas.width;
        }
    });
}

function drawSpaceGame() {
    // Background
    spaceCtx.fillStyle = '#000';
    spaceCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);
    
    // Stars
    spaceCtx.fillStyle = '#fff';
    spaceGame.stars.forEach(star => {
        spaceCtx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    // Player spaceship
    drawSpaceship(spaceGame.player.x, spaceGame.player.y, spaceGame.player.width, spaceGame.player.height);
    
    // Bullets
    spaceCtx.fillStyle = '#0ff';
    spaceGame.bullets.forEach(bullet => {
        spaceCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        spaceCtx.shadowBlur = 10;
        spaceCtx.shadowColor = '#0ff';
        spaceCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        spaceCtx.shadowBlur = 0;
    });
    
    // Enemies
    spaceGame.enemies.forEach(enemy => {
        drawEnemy(enemy.x, enemy.y, enemy.width, enemy.height, enemy.type);
    });
}

function drawSpaceship(x, y, w, h) {
    // Main body
    spaceCtx.fillStyle = '#4a9eff';
    spaceCtx.beginPath();
    spaceCtx.moveTo(x + w/2, y);
    spaceCtx.lineTo(x + w, y + h);
    spaceCtx.lineTo(x + w/2, y + h - 10);
    spaceCtx.lineTo(x, y + h);
    spaceCtx.closePath();
    spaceCtx.fill();
    
    // Cockpit
    spaceCtx.fillStyle = '#fff';
    spaceCtx.beginPath();
    spaceCtx.arc(x + w/2, y + 15, 8, 0, Math.PI * 2);
    spaceCtx.fill();
    
    // Wings glow
    spaceCtx.fillStyle = '#ff4444';
    spaceCtx.fillRect(x, y + h - 5, 15, 5);
    spaceCtx.fillRect(x + w - 15, y + h - 5, 15, 5);
}

function drawEnemy(x, y, w, h, type) {
    const colors = ['#ff4444', '#44ff44', '#ff44ff'];
    spaceCtx.fillStyle = colors[type];
    
    if (type === 0) {
        // Triangle enemy
        spaceCtx.beginPath();
        spaceCtx.moveTo(x + w/2, y + h);
        spaceCtx.lineTo(x + w, y);
        spaceCtx.lineTo(x, y);
        spaceCtx.closePath();
        spaceCtx.fill();
    } else if (type === 1) {
        // Square enemy
        spaceCtx.fillRect(x, y, w, h);
        spaceCtx.fillStyle = '#000';
        spaceCtx.fillRect(x + 10, y + 10, w - 20, h - 20);
    } else {
        // Circle enemy
        spaceCtx.beginPath();
        spaceCtx.arc(x + w/2, y + h/2, w/2, 0, Math.PI * 2);
        spaceCtx.fill();
        spaceCtx.fillStyle = '#000';
        spaceCtx.beginPath();
        spaceCtx.arc(x + w/2, y + h/2, w/3, 0, Math.PI * 2);
        spaceCtx.fill();
    }
}

// Utility function
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('raceCanvas')) {
        initRaceGame();
        initSpaceGame();
        document.getElementById('race-game').classList.add('active');
    }
});