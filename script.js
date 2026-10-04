const firebaseConfig = {
    apiKey: "AIzaSyBlFV6WEnbqAz6nt-xLFDw-2KfKXH_E0zo",
    authDomain: "tthtrochoistem.firebaseapp.com",
    databaseURL: "https://tthtrochoistem-default-rtdb.firebaseio.com",
    projectId: "tthtrochoistem",
    storageBucket: "tthtrochoistem.firebasestorage.app",
    messagingSenderId: "801801522309",
    appId: "1:801801522309:web:919bfb9187af9e2cea2dec",
    measurementId: "G-F6NMF0ZCR4"
};
// Khởi tạo kết nối máy chủ
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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

// Ngân hàng câu hỏi Toán học
const questions = [
    { q: "Đạo hàm của &nbsp; \\( x^2 \\)", correct: "2x", wrongs: ["x", "2", "x^2"] },
    { q: "Giá trị của &nbsp; \\(\\cos(0) \\)", correct: "1", wrongs: ["0", "-1", "\\pi"] },
    { q: "Tính &nbsp; \\(\\sqrt{25} \\)", correct: "5", wrongs: ["-5", "10", "25"] },
    { q: "Tích phân của &nbsp; \\( 2x \\)", correct: "x^2", wrongs: ["2x^2", "x", "2"] },
    { q: "Tính giới hạn &nbsp; \\(\\lim_{x \\to 0} \\frac{\\sin x}{x} \\)", correct: "1", wrongs: ["0", "\\infty", "-1"] },
    { q: "Nghiệm của &nbsp; \\( 2^x = 8 \\)", correct: "3", wrongs: ["2", "4", "8"] }
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
    questionBox.innerHTML = `Câu hỏi: ${currentQuestion.q}`;
    
    if (window.MathJax) {
        MathJax.typesetPromise([questionBox]);
    }
    
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
    
    duck.innerHTML = `\\( ${answerText} \\)`;
    
    let laneHeight = gameArea.clientHeight / 4;
    let startY = (index * laneHeight) + (Math.random() * 20); 
    let randomDelayX = Math.random() * 150; 
    let startX = (index % 2 === 0) ? -80 - randomDelayX : gameArea.clientWidth + 20 + randomDelayX; 
    let direction = (index % 2 === 0) ? 1 : -1; 
    
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

    if (window.MathJax) {
        MathJax.typesetPromise([duck]);
    }
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

// ==========================================
// KHU VỰC KẾT NỐI MÁY CHỦ FIREBASE (ONLINE)
// ==========================================

// Đẩy điểm lên máy chủ đám mây khi thua
function gameOver() {
    ui2.style.display = 'none';
    ui3.style.display = 'flex';
    document.getElementById('final-score').innerText = currentScore;
    
    db.ref('leaderboard').push({
        name: currentUser,
        score: currentScore,
        timestamp: Date.now()
    });
}

// Lắng nghe dữ liệu Realtime và tự động cập nhật Bảng xếp hạng
db.ref('leaderboard').on('value', (snapshot) => {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = ""; 
    
    let dataList = [];
    snapshot.forEach((childSnapshot) => {
        dataList.push({
            id: childSnapshot.key, 
            ...childSnapshot.val()
        });
    });
    
    dataList.sort((a, b) => b.score - a.score);
    
    dataList.slice(0, 50).forEach((player, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td>${player.name}</td>
            <td style="color: #ffd700; font-weight: bold;">${player.score}</td>
            <td><button class="btn-delete" onclick="deletePlayer('${player.id}')">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
});

// Nút Xóa 1 người chơi khỏi máy chủ
window.deletePlayer = function(id) {
    if(confirm("Bạn muốn xóa người chơi này khỏi máy chủ?")) {
        db.ref('leaderboard/' + id).remove();
    }
};

// Nút Xóa tất cả dữ liệu máy chủ
document.getElementById('btnClearAll').addEventListener('click', () => {
    if(confirm("CẢNH BÁO: Xóa toàn bộ dữ liệu trên máy chủ? Hành động này không thể hoàn tác!")) {
        db.ref('leaderboard').remove();
    }
});
