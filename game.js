// Game Configuration
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let nextDirection = {x: 0, y: 0};
let food = {x: 15, y: 15};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;
let currentSpeed = INITIAL_SPEED;

// UI Elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Initialize high score display
highScoreElement.textContent = highScore;

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    // Prevent default behavior for arrow keys
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }

    // Handle pause with spacebar
    if(event.key === ' ') {
        if(gameRunning) {
            togglePause();
        }
        return;
    }

    // Don't change direction if game is not running or paused
    if(!gameRunning || gamePaused) return;

    switch(event.key) {
        case 'ArrowUp':
            if(direction.y === 0) {
                nextDirection = {x: 0, y: -1};
            }
            break;
        case 'ArrowDown':
            if(direction.y === 0) {
                nextDirection = {x: 0, y: 1};
            }
            break;
        case 'ArrowLeft':
            if(direction.x === 0) {
                nextDirection = {x: -1, y: 0};
            }
            break;
        case 'ArrowRight':
            if(direction.x === 0) {
                nextDirection = {x: 1, y: 0};
            }
            break;
    }
}

function startGame() {
    if(!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        gameLoop = setInterval(update, currentSpeed);
    }
}

function togglePause() {
    if(!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    
    if(gamePaused) {
        clearInterval(gameLoop);
        // Draw "PAUSED" on canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    } else {
        gameLoop = setInterval(update, currentSpeed);
    }
}

function resetGame() {
    clearInterval(gameLoop);
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    nextDirection = {x: 0, y: 0};
    score = 0;
    currentSpeed = INITIAL_SPEED;
    scoreElement.textContent = score;
    gameRunning = false;
    gamePaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    generateFood();
    draw();
}

function generateFood() {
    let validPosition = false;
    
    while(!validPosition) {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        // Check if food is not on snake
        validPosition = !snake.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

function update() {
    if(!gameRunning || gamePaused) return;
    
    // Update direction
    direction = nextDirection;
    
    // Move snake
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Check wall collision
    if(head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }
    
    // Check self collision
    if(snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if(head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score
        if(score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Increase speed slightly
        if(score % 50 === 0 && currentSpeed > 50) {
            clearInterval(gameLoop);
            currentSpeed -= SPEED_INCREMENT;
            gameLoop = setInterval(update, currentSpeed);
        }
        
        generateFood();
    } else {
        snake.pop();
    }
    
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for(let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Gradient from head to tail
        const opacity = 1 - (index / snake.length) * 0.5;
        ctx.fillStyle = `rgba(102, 126, 234, ${opacity})`;
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
        
        // Draw eyes on head
        if(index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = 3;
            const eyeOffset = 6;
            
            // Eyes position based on direction
            if(direction.x === 1) { // Moving right
                ctx.fillRect(segment.x * CELL_SIZE + 14, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + 14, segment.y * CELL_SIZE + 12, eyeSize, eyeSize);
            } else if(direction.x === -1) { // Moving left
                ctx.fillRect(segment.x * CELL_SIZE + 3, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + 3, segment.y * CELL_SIZE + 12, eyeSize, eyeSize);
            } else if(direction.y === 1) { // Moving down
                ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 14, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + 14, eyeSize, eyeSize);
            } else if(direction.y === -1) { // Moving up
                ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 3, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + 3, eyeSize, eyeSize);
            }
        }
    });
    
    // Draw food with pulsing effect
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 0.2 + 0.8;
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        (CELL_SIZE / 2 - 2) * pulse,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Initial draw
resetGame();
