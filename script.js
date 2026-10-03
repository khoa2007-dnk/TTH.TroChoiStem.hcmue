// Biến lưu trữ bảng xếp hạng từ bộ nhớ trình duyệt
let leaderboardData = JSON.parse(localStorage.getItem('mathGameLeaderboard')) || [];
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
    
    // 1. FIX ĐÈ NHAU CHIỀU DỌC: Chia màn hình làm 4 "làn đường bay" riêng biệt cho 4 con vịt
    let laneHeight = gameArea.clientHeight / 4;
    let startY = (index * laneHeight) + (Math.random() * 20); 
    
    // 2. FIX ĐÈ NHAU CHIỀU NGANG: Cộng thêm khoảng lùi ngẫu nhiên để vịt bay ra so le nhau
    let randomDelayX = Math.random() * 150; 
    let startX = (index % 2 === 0) ? -80 - randomDelayX : gameArea.clientWidth + 20 + randomDelayX; 
    let direction = (index % 2 === 0) ? 1 : -1; 
    
    // 3. FIX ĐẢO CHIỀU: Gắn nhãn cho vịt bay từ phải sang trái
    if (direction === -1) {
        duck.classList.add('fly-left');
    }
    
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
    
    // Lưu điểm vào mảng
    leaderboardData.push({ name: currentUser, score: currentScore });
    
    // Sắp xếp lại từ cao xuống thấp
    leaderboardData.sort((a, b) => b.score - a.score);
    
    // Lưu vào bộ nhớ máy
    localStorage.setItem('mathGameLeaderboard', JSON.stringify(leaderboardData));
    
    // Hiển thị ra bảng
    renderLeaderboard();
}

// Logic nút xóa toàn bộ bảng xếp hạng
document.getElementById('btnClearAll').addEventListener('click', () => {
    if(confirm("CẢNH BÁO: Xóa toàn bộ dữ liệu bảng xếp hạng? Không thể khôi phục!")) {
        leaderboardData = [];
        localStorage.removeItem('mathGameLeaderboard');
        renderLeaderboard();
    }
});

// Hàm xóa 1 người chơi
window.deletePlayer = function(index) {
    if(confirm("Bạn muốn xóa người chơi này khỏi bảng xếp hạng?")) {
        leaderboardData.splice(index, 1);
        localStorage.setItem('mathGameLeaderboard', JSON.stringify(leaderboardData));
        renderLeaderboard();
    }
};

// Hàm hiển thị bảng xếp hạng
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = ""; // Xóa dữ liệu cũ
    
    // Chỉ lấy Top 50 người cao điểm nhất để web không bị lag
    let displayData = leaderboardData.slice(0, 50);
    
    displayData.forEach((player, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td>${player.name}</td>
            <td style="color: #ffd700; font-weight: bold;">${player.score}</td>
            <td><button class="btn-delete" onclick="deletePlayer(${index})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}
