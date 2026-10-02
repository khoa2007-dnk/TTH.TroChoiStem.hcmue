const ui1 = document.getElementById('ui-1');
const ui2 = document.getElementById('ui-2');
const ui3 = document.getElementById('ui-3');
const btnPlay = document.getElementById('btnPlay');
const btnPlayAgain = document.getElementById('btnPlayAgain');
const btnNewGame = document.getElementById('btnNewGame');
const playerNameInput = document.getElementById('playerName');
const gun = document.getElementById('gun');
const gameArea = document.getElementById('game-area');
const questionBox = document.getElementById('questionBox');

let currentUser = "";
let currentScore = 0;
let health = 3;
let ducks = [];
let gameInterval;
let duckSpeed = 2.5; 

// Ngân hàng câu hỏi
const questions = [
    { q: "Đạo hàm của x^2", correct: "2x", wrongs: ["x", "2", "x^2"] },
    { q: "Giá trị của cos(0)", correct: "1", wrongs: ["0", "-1", "π"] },
    { q: "Căn bậc 2 của 25", correct: "5", wrongs: ["-5", "10", "25"] },
    { q: "Tích phân của 2x", correct: "x^2", wrongs: ["2x^2", "x", "2"] },
    { q: "7 x 8 = ?", correct: "56", wrongs: ["54", "48", "64"] },
    { q: "lim(x->0) sin(x)/x", correct: "1", wrongs: ["0", "∞", "-1"] }
];
let currentQuestion = {};

// Súng hướng theo chuột
gameArea.addEventListener('mousemove', (e) => {
    const gunRect = gun.getBoundingClientRect();
    const gunCenterX = gunRect.left + gunRect.width / 2;
    const gunCenterY = gunRect.top + gunRect.height; 
    const angle = Math.atan2(e.clientY - gunCenterY, e.clientX - gunCenterX) * 180 / Math.PI;
    gun.style.transform = `rotate(${angle + 90}deg)`;
});

// Chuyển giao diện
btnPlay.addEventListener('click', () => {
    if(playerNameInput.value.trim() === "") { alert("Vui lòng nhập tên!"); return; }
    currentUser = playerNameInput.value;
    startGame();
});

btnPlayAgain.addEventListener('click', startGame);

btnNewGame.addEventListener('click', () => {
    ui3.style.display = 'none';
    ui1.style.display = 'flex';
    playerNameInput.value = "";
});

// Vận hành Game
function startGame() {
    currentScore = 0;
    health = 3;
    document.getElementById('score').innerText = currentScore;
    updateHealthUI();
    
    ui1.style.display = 'none';
    ui3.style.display = 'none';
    ui2.style.display = 'flex';
    
    nextTurn();
}

function nextTurn() {
    if (health <= 0) {
        gameOver();
        return;
    }
    
    gameArea.querySelectorAll('.duck').forEach(d => d.remove());
    ducks = [];
    
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionBox.innerText = `Câu hỏi: ${currentQuestion.q}`;
    
    let answers = [currentQuestion.correct, ...currentQuestion.wrongs];
    answers.sort(() => Math.random() - 0.5);
    
    for(let i = 0; i < 4; i++) {
        spawnDuck(answers[i], i);
    }
    
    clearInterval(gameInterval);
    gameInterval = setInterval(moveDucks, 30);
}

function spawnDuck(answerText, index) {
    let duck = document.createElement('div');
    duck.classList.add('duck');
    duck.innerText = answerText;
    
    let startY = Math.random() * (gameArea.clientHeight * 0.6); 
    let startX = (index % 2 === 0) ? -80 : gameArea.clientWidth + 20; 
    let direction = (index % 2 === 0) ? 1 : -1; 
    
    duck.style.top = startY + 'px';
    duck.style.left = startX + 'px';
    duck.dataset.answer = answerText;
    duck.dataset.direction = direction;
    
    duck.addEventListener('mousedown', function() {
        shootDuck(this);
    });
    
    gameArea.appendChild(duck);
    ducks.push(duck);
}

function moveDucks() {
    let allDucksOut = true;
    
    ducks.forEach(duck => {
        if(!duck.parentElement) return; 
        
        let currentLeft = parseFloat(duck.style.left);
        let dir = parseFloat(duck.dataset.direction);
        let newLeft = currentLeft + (duckSpeed * dir);
        duck.style.left = newLeft + 'px';
        
        if ((dir === 1 && newLeft > gameArea.clientWidth + 50) || 
            (dir === -1 && newLeft < -100)) {
            duck.remove();
        } else {
            allDucksOut = false; 
        }
    });
    
    if (allDucksOut) {
        clearInterval(gameInterval);
        health--;
        updateHealthUI();
        setTimeout(nextTurn, 500);
    }
}

function shootDuck(duckElement) {
    let answer = duckElement.dataset.answer;
    duckElement.style.backgroundColor = "red";
    duckElement.innerText = "💥";
    
    setTimeout(() => {
        duckElement.remove();
        
        if (answer === currentQuestion.correct) {
            currentScore += 10;
            document.getElementById('score').innerText = currentScore;
            clearInterval(gameInterval); 
            setTimeout(nextTurn, 400); 
        } else {
            health--;
            updateHealthUI();
            if(health <= 0) {
                clearInterval(gameInterval);
                gameOver();
            }
        }
    }, 200);
}

function updateHealthUI() {
    let healthStr = "";
    for(let i = 0; i < health; i++) healthStr += "❤️";
    document.getElementById('health').innerText = healthStr === "" ? "💀" : healthStr;
}

function gameOver() {
    ui2.style.display = 'none';
    ui3.style.display = 'flex';
    document.getElementById('final-score').innerText = currentScore;
}
