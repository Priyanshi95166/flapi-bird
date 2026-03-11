// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'START'; // START, PLAYING, GAME_OVER
let score = 0;
let frameCount = 0;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.4,
    jumpPower: -8,
    rotation: 0
};

// Pipe properties
const pipes = [];
const pipeWidth = 52;
const pipeGap = 120;
const pipeSpeed = 2;

// Ground properties
let groundX = 0;
const groundSpeed = 1;

// Colors
const colors = {
    bird: '#FFD700',
    pipe: '#32CD32',
    ground: '#DEB887',
    sky: '#87CEEB'
};

// Initialize game
function init() {
    canvas.addEventListener('click', handleInput);
    document.addEventListener('keydown', handleKeyPress);
    gameLoop();
}

// Handle input
function handleInput() {
    if (gameState === 'START') {
        startGame();
    } else if (gameState === 'PLAYING') {
        bird.velocity = bird.jumpPower;
    } else if (gameState === 'GAME_OVER') {
        resetGame();
    }
}

function handleKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        handleInput();
    }
}

// Start the game
function startGame() {
    gameState = 'PLAYING';
    document.getElementById('startScreen').style.display = 'none';
    bird.velocity = bird.jumpPower;
}

// Reset the game
function resetGame() {
    gameState = 'START';
    score = 0;
    frameCount = 0;
    bird.x = 50;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes.length = 0;
    groundX = 0;
    
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    updateScore();
}

// Update game logic
function update() {
    if (gameState !== 'PLAYING') return;

    frameCount++;

    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Bird rotation based on velocity
    if (bird.velocity < 0) {
        bird.rotation = Math.max(-25, bird.velocity * 2);
    } else {
        bird.rotation = Math.min(25, bird.velocity * 2);
    }

    // Generate pipes
    if (frameCount % 120 === 0) {
        createPipe();
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;

        // Remove pipes that are off-screen
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            if (pipe.counted === false) {
                score++;
                updateScore();
                pipe.counted = true;
            }
        }

        // Check for scoring
        if (!pipe.counted && pipe.x + pipeWidth < bird.x) {
            pipe.counted = true;
            score++;
            updateScore();
        }
    }

    // Update ground
    groundX -= groundSpeed;
    if (groundX <= -canvas.width) {
        groundX = 0;
    }

    // Check collisions
    checkCollisions();
}

// Create a new pipe pair
function createPipe() {
    const minPipeHeight = 50;
    const maxPipeHeight = canvas.height - pipeGap - minPipeHeight - 60; // 60 for ground
    const topPipeHeight = minPipeHeight + Math.random() * (maxPipeHeight - minPipeHeight);

    pipes.push({
        x: canvas.width,
        topHeight: topPipeHeight,
        bottomY: topPipeHeight + pipeGap,
        bottomHeight: canvas.height - 60 - (topPipeHeight + pipeGap),
        counted: false
    });
}

// Check collisions
function checkCollisions() {
    // Check if bird hits ground or ceiling
    if (bird.y + bird.height >= canvas.height - 60 || bird.y <= 0) {
        gameOver();
        return;
    }

    // Check pipe collisions
    for (const pipe of pipes) {
        // Check if bird is horizontally aligned with pipe
        if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x) {
            // Check if bird hits top or bottom pipe
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                gameOver();
                return;
            }
        }
    }
}

// Game over
function gameOver() {
    gameState = 'GAME_OVER';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'block';
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'GAME_OVER') {
        // Draw pipes
        ctx.fillStyle = colors.pipe;
        for (const pipe of pipes) {
            // Top pipe
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            // Bottom pipe
            ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
            
            // Pipe caps (decorative)
            ctx.fillStyle = '#228B22';
            ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, pipeWidth + 4, 20);
            ctx.fillRect(pipe.x - 2, pipe.bottomY, pipeWidth + 4, 20);
            ctx.fillStyle = colors.pipe;
        }
    }

    // Draw bird
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    // Bird body
    ctx.fillStyle = colors.bird;
    ctx.fillRect(-bird.width/2, -bird.height/2, bird.width, bird.height);
    
    // Bird wing
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(-bird.width/2 + 5, -bird.height/2 + 2, bird.width - 15, bird.height - 8);
    
    // Bird beak
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(bird.width/2 - 8, -3, 8, 6);
    
    // Bird eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-5, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Draw ground
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Ground texture
    ctx.fillStyle = '#CD853F';
    for (let i = groundX; i < canvas.width + 20; i += 20) {
        ctx.fillRect(i, canvas.height - 60, 20, 5);
        ctx.fillRect(i + 10, canvas.height - 50, 20, 5);
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);