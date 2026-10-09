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

// Ngân hàng 100 câu hỏi Toán học (Đã chèn &nbsp; chống lỗi dính chữ)
const questions = [
    // --- PHẦN 1: 30 CÂU TỪ ĐỀ THI TTH ---
    { q: "Rút gọn biểu thức &nbsp; \\( M = \\sqrt{x^2} \\) &nbsp;", correct: "|x|", wrongs: ["x", "-x", "\\pm x", "x^2", "0"] },
    { q: "Tập xác định của hàm số &nbsp; \\( y = (x-1)^{\\pi} \\) &nbsp;", correct: "(1; +\\infty)", wrongs: ["\\mathbb{R}", "\\mathbb{R} \\setminus \\{1\\}", "[1; +\\infty)", "(0; +\\infty)", "\\emptyset"] },
    { q: "Đạo hàm của hàm số &nbsp; \\( y = e^{\\pi} \\) &nbsp; trên &nbsp; \\( \\mathbb{R} \\) &nbsp; là:", correct: "0", wrongs: ["e^{\\pi}", "\\pi e^{\\pi-1}", "e^{\\pi} \\ln \\pi", "1", "\\pi"] },
    { q: "Họ nguyên hàm của hàm số &nbsp; \\( f(x) = \\frac{1}{x} \\) &nbsp; là:", correct: "\\ln |x| + C", wrongs: ["\\ln x + C", "-\\frac{1}{x^2} + C", "\\frac{1}{x^2} + C", "e^x + C", "\\frac{1}{x} + C"] },
    { q: "Với &nbsp; \\( x \\neq 0 \\) &nbsp;, biểu thức &nbsp; \\( \\log_2(x^2) \\) &nbsp; bằng:", correct: "2\\log_2|x|", wrongs: ["2\\log_2 x", "\\frac{1}{2}\\log_2 x", "\\log_2|x|", "x\\log_2 2", "2"] },
    { q: "Đồ thị hàm số &nbsp; \\( y = \\frac{x-1}{x^2-1} \\) &nbsp; có bao nhiêu đường tiệm cận đứng?", correct: "1", wrongs: ["2", "3", "0", "4", "V\\text{ô số}"] },
    { q: "Số nghiệm của phương trình &nbsp; \\( \\sqrt{x - 1} = -2 \\) &nbsp; là:", correct: "0", wrongs: ["1", "2", "V\\text{ô số}", "-2", "3"] },
    { q: "Phương trình &nbsp; \\( x^2 + 1 = 0 \\) &nbsp; có bao nhiêu nghiệm trên tập &nbsp; \\( \\mathbb{R} \\) &nbsp;?", correct: "0", wrongs: ["1", "2", "V\\text{ô số}", "3", "4"] },
    { q: "Giới hạn &nbsp; \\( \\lim_{x \\to 0} \\frac{\\sin 2x}{x} \\) &nbsp; bằng:", correct: "2", wrongs: ["1", "\\frac{1}{2}", "0", "\\infty", "-1"] },
    { q: "Đạo hàm của hàm số &nbsp; \\( y = \\ln(3x) \\) &nbsp; (với &nbsp; \\( x > 0 \\) &nbsp;) là:", correct: "\\frac{1}{x}", wrongs: ["\\frac{1}{3x}", "\\frac{3}{x}", "\\frac{3}{\\ln(3x)}", "3", "\\ln 3"] },
    { q: "Tại &nbsp; \\( x = 0 \\) &nbsp;, hàm số &nbsp; \\( y = |x| \\) &nbsp; có tính chất gì?", correct: "Đ\\text{ạt cực tiểu và không có đạo hàm}", wrongs: ["Đ\\text{ạt cực đại}", "K\\text{hông đạt cực trị}", "Đ\\text{ạt cực tiểu và có đạo hàm bằng 0}", "Đ\\text{ạt cực đại và không có đạo hàm}", "Đ\\text{ồng biến}"] },
    { q: "Cho &nbsp; \\( \\vec{u} = (1; 2; 3) \\) &nbsp; và &nbsp; \\( \\vec{v} = \\vec{0} \\) &nbsp;. Tích vô hướng &nbsp; \\( \\vec{u} \\cdot \\vec{v} \\) &nbsp; bằng:", correct: "0", wrongs: ["\\vec{0}", "K\\text{hông xác định}", "1", "3", "-1"] },
    { q: "Có bao nhiêu cách xếp 3 người ngồi vào một chiếc bàn tròn?", correct: "2", wrongs: ["6", "3", "27", "9", "1"] },
    { q: "Phương trình &nbsp; \\( \\sin x = \\frac{\\pi}{2} \\) &nbsp; có bao nhiêu nghiệm thực?", correct: "0", wrongs: ["1", "2", "V\\text{ô số}", "3", "\\pi"] },
    { q: "Diện tích hình phẳng giới hạn bởi &nbsp; \\( y=f(x) \\) &nbsp;, trục hoành và &nbsp; \\( x=a, x=b \\) &nbsp; là:", correct: "\\int_a^b |f(x)| dx", wrongs: ["\\int_a^b f(x) dx", "\\left| \\int_a^b f(x) dx \\right|", "\\pi \\int_a^b f^2(x) dx", "\\int_a^b f^2(x) dx", "0"] },
    { q: "Gieo hai con xúc xắc. Xác suất để tổng số chấm bằng 13 là:", correct: "0", wrongs: ["\\frac{1}{36}", "\\frac{1}{12}", "1", "\\frac{1}{6}", "\\frac{13}{36}"] },
    { q: "Vectơ pháp tuyến của mặt phẳng &nbsp; \\( (Oxy) \\) &nbsp; là:", correct: "\\vec{k} = (0;0;1)", wrongs: ["\\vec{i} = (1;0;0)", "\\vec{j} = (0;1;0)", "\\vec{n} = (1;1;0)", "\\vec{n} = (1;1;1)", "\\vec{0}"] },
    { q: "Tập xác định của hàm số &nbsp; \\( y = \\ln(x^2) \\) &nbsp; là:", correct: "\\mathbb{R} \\setminus \\{0\\}", wrongs: ["(0; +\\infty)", "[0; +\\infty)", "\\mathbb{R}", "(1; +\\infty)", "\\emptyset"] },
    { q: "Trong không gian, hai đường thẳng phân biệt không có điểm chung thì chúng:", correct: "S\\text{ong song hoặc chéo nhau}", wrongs: ["S\\text{ong song}", "C\\text{héo nhau}", "N\\text{ằm trong cùng một mặt phẳng}", "C\\text{ắt nhau}", "V\\text{uông góc}"] },
    { q: "Cho &nbsp; \\( a > 0, a \\neq 1 \\) &nbsp;. Giá trị của biểu thức &nbsp; \\( P = a^{\\log_a 5} \\) &nbsp; là:", correct: "5", wrongs: ["\\log_a 5", "a^5", "K\\text{hông xác định}", "1", "0"] },
    { q: "Có bao nhiêu số tự nhiên có 3 chữ số khác nhau lập từ &nbsp; \\( \\{0, 1, 2, 3\\} \\) &nbsp;?", correct: "18", wrongs: ["24", "64", "4", "12", "36"] },
    { q: "Hai vectơ ngược hướng dài 2 và 3. Tích vô hướng của chúng bằng:", correct: "-6", wrongs: ["6", "\\vec{0}", "0", "5", "-5"] },
    { q: "Hàm số nào sau đây đồng biến trên toàn trục số &nbsp; \\( \\mathbb{R} \\) &nbsp;?", correct: "y = x^3 - 3x^2 + 3x", wrongs: ["y = \\tan x", "y = \\frac{x+1}{x-1}", "y = x^4 + x^2", "y = x^2", "y = \\sin x"] },
    { q: "Giá trị của tích phân &nbsp; \\( \\int_{0}^{1} e^x dx \\) &nbsp; bằng:", correct: "e - 1", wrongs: ["e", "1", "e + 1", "0", "e^2"] },
    { q: "Đạo hàm của hàm số &nbsp; \\( y = 2^x \\) &nbsp; là:", correct: "2^x \\ln 2", wrongs: ["x \\cdot 2^{x-1}", "\\frac{2^x}{\\ln 2}", "2^x", "2^x \\ln x", "\\ln 2"] },
    { q: "Đẳng thức &nbsp; \\( \\sqrt{a^2 + b^2} = a + b \\) &nbsp; đúng khi nào?", correct: "a=0 \\text{ hoặc } b=0 \\text{ (và } a,b \\ge 0)", wrongs: ["\\forall a, b \\ge 0", "\\forall a, b \\in \\mathbb{R}", "K\\text{hông bao giờ}", "a=b", "a,b > 0"] },
    { q: "Giá trị lớn nhất của &nbsp; \\( y = x^2 + 1 \\) &nbsp; trên khoảng &nbsp; \\( (-1; 2) \\) &nbsp; là:", correct: "K\\text{hông tồn tại}", wrongs: ["5", "2", "1", "4", "0"] },
    { q: "Khẳng định nào sau đây SAI về số phức &nbsp; \\( z = a + bi \\) &nbsp;?", correct: "z^2 = |z|^2", wrongs: ["z \\cdot \\bar{z} = |z|^2", "z = \\bar{z} \\Rightarrow z \\in \\mathbb{R}", "z = -\\bar{z} \\Rightarrow z \\text{ thuần ảo}", "z+\\bar{z}=2a", "z-\\bar{z}=2bi"] },
    { q: "Nếu &nbsp; \\( \\lim_{x \\to \\infty} f(x) = L \\) &nbsp; thì đồ thị hàm số có tiệm cận nào?", correct: "T\\text{CN } y=L", wrongs: ["T\\text{CĐ } x=L", "T\\text{CN } x=L", "T\\text{iệm cận xiên}", "K\\text{hông có tiệm cận}", "T\\text{CĐ } y=L"] },
    { q: "Phương trình nào là phương trình của một đường tròn?", correct: "x^2 + y^2 + 2x - 4y - 4 = 0", wrongs: ["x^2 - y^2 = 1", "x^2 + y^2 - 2x + 4y + 10 = 0", "2x^2 + 3y^2 = 6", "x^2 + y^2 = -1", "x+y=1"] },

    // --- PHẦN 2: 30 CÂU TỪ ĐỀ TN CĐS ---
    { q: "Tính đạo hàm của &nbsp; \\( y=\\pi^{\\pi} \\) &nbsp; tại &nbsp; \\( x=1 \\) &nbsp;", correct: "0", wrongs: ["3", "1", "4", "\\pi", "\\pi^{\\pi}"] },
    { q: "Giá trị của &nbsp; \\( \\ln(e)+\\log_{10}(100) \\) &nbsp; bằng:", correct: "3", wrongs: ["1", "4", "2", "0", "10"] },
    { q: "Phương trình &nbsp; \\( \\sin x = \\pi \\) &nbsp; có bao nhiêu nghiệm thực?", correct: "0", wrongs: ["3", "1", "2", "V\\text{ô số}", "4"] },
    { q: "Rút gọn biểu thức &nbsp; \\( A=2^{\\log_{2}10} \\) &nbsp;", correct: "10", wrongs: ["2", "5", "20", "100", "0"] },
    { q: "Thể tích khối lập phương có đường chéo một mặt bằng &nbsp; \\( \\sqrt{2} \\) &nbsp;", correct: "1", wrongs: ["2", "3", "4", "2\\sqrt{2}", "\\frac{1}{2}"] },
    { q: "Hệ số của &nbsp; \\( x \\) &nbsp; trong khai triển &nbsp; \\( (x-1)^2 \\) &nbsp;", correct: "-2", wrongs: ["1", "2", "-1", "0", "-3"] },
    { q: "Tập giá trị của hàm số &nbsp; \\( y=\\cos x \\) &nbsp; chứa bao nhiêu số nguyên?", correct: "3", wrongs: ["2", "4", "1", "0", "5"] },
    { q: "Kết quả của &nbsp; \\( \\lim_{n\\to+\\infty}\\frac{4n^2-1}{-n^2+2} \\) &nbsp; là:", correct: "-4", wrongs: ["2", "0", "-8", "4", "\\infty"] },
    { q: "Bán kính mặt cầu ngoại tiếp hình hộp chữ nhật có ba kích thước 2, 2, 1 là:", correct: "1.5", wrongs: ["2.5", "3", "2", "1", "4.5"] },
    { q: "Giá trị của tích phân &nbsp; \\( \\int_{-\\pi}^{\\pi} \\sin(x^3) dx \\) &nbsp; bằng:", correct: "0", wrongs: ["2", "1", "-1", "\\pi", "2\\pi"] },
    { q: "Một tổ có 5 người. Có bao nhiêu cách chọn ra 1 tổ trưởng?", correct: "5", wrongs: ["10", "1", "4", "15", "20"] },
    { q: "Tính giới hạn &nbsp; \\( \\lim_{x\\to-\\infty}\\frac{x}{|x|} \\) &nbsp;", correct: "-1", wrongs: ["2", "0", "1", "-\\infty", "+\\infty"] },
    { q: "Tổng &nbsp; \\( C_n^0+C_n^1+\\dots+C_n^n \\) &nbsp; bằng:", correct: "2^n", wrongs: ["0", "n^2", "n", "2n", "n!"] },
    { q: "Khoảng cách từ &nbsp; \\( M(1; 2; 3) \\) &nbsp; đến mặt phẳng &nbsp; \\( (Oxy) \\) &nbsp; là:", correct: "3", wrongs: ["1", "4", "2", "\\sqrt{14}", "5"] },
    { q: "Đạo hàm của hàm số &nbsp; \\( y = e^{2x} \\) &nbsp; là:", correct: "2e^{2x}", wrongs: ["e^{2x}", "e^x", "\\frac{1}{2}e^{2x}", "2xe^{2x}", "0"] },
    { q: "Số lượng các đường tiệm cận của đồ thị hàm số &nbsp; \\( y=\\frac{1}{x} \\) &nbsp; là:", correct: "2", wrongs: ["3", "1", "0", "4", "V\\text{ô số}"] },
    { q: "Đạo hàm cấp 2 của hàm số &nbsp; \\( y=x^2+5x-3 \\) &nbsp; là:", correct: "2", wrongs: ["5", "0", "1", "2x+5", "x"] },
    { q: "Bán kính đường tròn &nbsp; \\( x^2+y^2-4x+6y-3=0 \\) &nbsp; là:", correct: "4", wrongs: ["2", "16", "3", "8", "1"] },
    { q: "Khoảng cách giữa hai đường thẳng song song &nbsp; \\( x-y+1=0 \\) &nbsp; và &nbsp; \\( x-y+3=0 \\) &nbsp;", correct: "\\sqrt{2}", wrongs: ["4", "2", "1", "3", "2\\sqrt{2}"] },
    { q: "Tính tổng các nghiệm của phương trình &nbsp; \\( |x-2|=1 \\) &nbsp;", correct: "4", wrongs: ["3", "1", "2", "0", "-4"] },
    { q: "Thể tích khối lăng trụ có diện tích đáy &nbsp; \\( B=4 \\) &nbsp; và chiều cao &nbsp; \\( h=3 \\) &nbsp;", correct: "12", wrongs: ["4", "7", "24", "6", "16"] },
    { q: "Biểu thức &nbsp; \\( \\frac{0!}{1!} + \\frac{1!}{0!} \\) &nbsp; có giá trị bằng bao nhiêu?", correct: "2", wrongs: ["0", "4", "1", "3", "5"] },
    { q: "Trung bình cộng của ba số: -3, 0, 6 là:", correct: "1", wrongs: ["2", "1.5", "3", "0", "4"] },
    { q: "Phương sai của mẫu số liệu &nbsp; \\( 5, 5, 5, 5 \\) &nbsp; bằng:", correct: "0", wrongs: ["25", "1", "5", "10", "20"] },
    { q: "Nếu &nbsp; \\( 1+2+3+\\dots+n=55 \\) &nbsp; thì &nbsp; \\( n \\) &nbsp; bằng:", correct: "10", wrongs: ["9", "11", "12", "15", "8"] },
    { q: "Giá trị của &nbsp; \\( \\sqrt{(\\sqrt{5}-3)^2} \\) &nbsp; là:", correct: "3-\\sqrt{5}", wrongs: ["\\sqrt{5}-3", "2", "5", "3+\\sqrt{5}", "-2"] },
    { q: "Một cấp số cộng có &nbsp; \\( u_1=5, u_2=2 \\) &nbsp;. Khi đó &nbsp; \\( u_{10} \\) &nbsp; bằng:", correct: "-22", wrongs: ["32", "-25", "16", "22", "-28"] },
    { q: "Giá trị của &nbsp; \\( \\frac{\\log_5 16}{\\log_5 2} \\) &nbsp; là:", correct: "4", wrongs: ["3", "5", "6", "8", "2"] },
    { q: "Diện tích mặt cầu có bán kính &nbsp; \\( R=2 \\) &nbsp; bằng:", correct: "16\\pi", wrongs: ["4\\pi", "8\\pi", "12\\pi", "32\\pi", "64\\pi"] },
    { q: "Nếu &nbsp; \\( x+\\frac{1}{x}=3 \\) &nbsp;, thì &nbsp; \\( x^2+\\frac{1}{x^2} \\) &nbsp; bằng bao nhiêu?", correct: "7", wrongs: ["5", "9", "11", "13", "3"] },

    // --- PHẦN 3: 40 CÂU BỔ SUNG MỞ RỘNG ---
    { q: "Đạo hàm của hàm số &nbsp; \\( y = \\sin x \\) &nbsp; là:", correct: "\\cos x", wrongs: ["-\\cos x", "\\sin x", "-\\sin x", "1", "0"] },
    { q: "Họ nguyên hàm của hàm số &nbsp; \\( f(x) = \\cos x \\) &nbsp; là:", correct: "\\sin x + C", wrongs: ["-\\sin x + C", "\\cos x + C", "-\\cos x + C", "x\\sin x + C", "\\tan x + C"] },
    { q: "Giá trị của &nbsp; \\( \\log_3 9 \\) &nbsp; bằng:", correct: "2", wrongs: ["3", "9", "1", "0", "18"] },
    { q: "Thể tích khối chóp có diện tích đáy &nbsp; \\( B \\) &nbsp; và chiều cao &nbsp; \\( h \\) &nbsp; là:", correct: "\\frac{1}{3}Bh", wrongs: ["Bh", "3Bh", "\\frac{1}{2}Bh", "\\frac{4}{3}Bh", "B^2h"] },
    { q: "Giới hạn &nbsp; \\( \\lim_{x \\to 1} \\frac{x^2-1}{x-1} \\) &nbsp; bằng:", correct: "2", wrongs: ["1", "0", "\\infty", "-1", "-2"] },
    { q: "Số phức liên hợp của &nbsp; \\( z = 3 - 4i \\) &nbsp; là:", correct: "3 + 4i", wrongs: ["-3 + 4i", "-3 - 4i", "3 - 4", "4 - 3i", "-4 + 3i"] },
    { q: "Môđun của số phức &nbsp; \\( z = 3 + 4i \\) &nbsp; bằng:", correct: "5", wrongs: ["7", "1", "25", "12", "-5"] },
    { q: "Tích phân &nbsp; \\( \\int_0^{\\pi} \\sin x dx \\) &nbsp; bằng:", correct: "2", wrongs: ["0", "1", "-2", "\\pi", "-\\pi"] },
    { q: "Đạo hàm của hàm số &nbsp; \\( y = x^3 \\) &nbsp; là:", correct: "3x^2", wrongs: ["x^2", "3x", "\\frac{x^4}{4}", "3x^3", "6x"] },
    { q: "Với &nbsp; \\( a>0, a \\neq 1 \\) &nbsp;, giá trị của &nbsp; \\( \\log_a a^3 \\) &nbsp; bằng:", correct: "3", wrongs: ["a", "1", "\\frac{1}{3}", "a^3", "0"] },
    { q: "Điểm cực đại của hàm số &nbsp; \\( y = -x^2 + 2x \\) &nbsp; là:", correct: "x = 1", wrongs: ["x = -1", "x = 0", "x = 2", "x = -2", "K\\text{hông có}"] },
    { q: "Cấp số nhân có &nbsp; \\( u_1=2, q=3 \\) &nbsp;. Giá trị &nbsp; \\( u_3 \\) &nbsp; bằng:", correct: "18", wrongs: ["6", "8", "12", "54", "24"] },
    { q: "Họ nguyên hàm của hàm số &nbsp; \\( f(x) = \\frac{1}{\\cos^2 x} \\) &nbsp; là:", correct: "\\tan x + C", wrongs: ["\\cot x + C", "-\\tan x + C", "-\\cot x + C", "\\sin x + C", "\\frac{1}{\\cos x} + C"] },
    { q: "Nghiệm của phương trình &nbsp; \\( \\log_2(x-1) = 3 \\) &nbsp; là:", correct: "x = 9", wrongs: ["x = 8", "x = 10", "x = 7", "x = 4", "x = 1"] },
    { q: "Diện tích hình tròn bán kính &nbsp; \\( R=3 \\) &nbsp; bằng:", correct: "9\\pi", wrongs: ["3\\pi", "6\\pi", "27\\pi", "\\frac{9\\pi}{2}", "12\\pi"] },
    { q: "Giới hạn &nbsp; \\( \\lim_{x \\to +\\infty} \\frac{2x+1}{x-3} \\) &nbsp; bằng:", correct: "2", wrongs: ["1", "-3", "0", "+\\infty", "-\\frac{1}{3}"] },
    { q: "Hàm số &nbsp; \\( y = x^4 - 2x^2 \\) &nbsp; có bao nhiêu điểm cực trị?", correct: "3", wrongs: ["1", "2", "0", "4", "V\\text{ô số}"] },
    { q: "Đạo hàm của hàm số &nbsp; \\( y = \\tan x \\) &nbsp; là:", correct: "\\frac{1}{\\cos^2 x}", wrongs: ["\\frac{1}{\\sin^2 x}", "-\\frac{1}{\\cos^2 x}", "\\cot x", "\\sin x", "1+\\tan^2 x"] },
    { q: "Thể tích khối cầu bán kính &nbsp; \\( R=1 \\) &nbsp; bằng:", correct: "\\frac{4}{3}\\pi", wrongs: ["4\\pi", "\\frac{3}{4}\\pi", "\\frac{1}{3}\\pi", "\\pi", "3\\pi"] },
    { q: "Cho &nbsp; \\( \\vec{a}=(1; -2; 2) \\) &nbsp;. Độ dài &nbsp; \\( |\\vec{a}| \\) &nbsp; bằng:", correct: "3", wrongs: ["5", "1", "9", "\\sqrt{5}", "2"] },
    { q: "Tổ hợp chập 2 của 5 phần tử &nbsp; \\( C_5^2 \\) &nbsp; bằng:", correct: "10", wrongs: ["20", "5", "12", "15", "2"] },
    { q: "Chỉnh hợp chập 2 của 5 phần tử &nbsp; \\( A_5^2 \\) &nbsp; bằng:", correct: "20", wrongs: ["10", "5", "25", "15", "120"] },
    { q: "Tập nghiệm của phương trình &nbsp; \\( 3^x = 9 \\) &nbsp; là:", correct: "\\{2\\}", wrongs: ["\\{3\\}", "\\{1\\}", "\\{0\\}", "\\{2; -2\\}", "\\emptyset"] },
    { q: "Tập xác định của hàm số &nbsp; \\( y = \\log_3 x \\) &nbsp; là:", correct: "(0; +\\infty)", wrongs: ["\\mathbb{R}", "\\mathbb{R} \\setminus \\{0\\}", "[0; +\\infty)", "(1; +\\infty)", "\\emptyset"] },
    { q: "Nghiệm của phương trình &nbsp; \\( \\sin x = 0 \\) &nbsp; là:", correct: "k\\pi", wrongs: ["k2\\pi", "\\frac{\\pi}{2} + k\\pi", "\\frac{\\pi}{2} + k2\\pi", "\\pi + k2\\pi", "0"] },
    { q: "Với mọi góc &nbsp; \\( x \\) &nbsp;, khẳng định &nbsp; \\( \\sin^2 x + \\cos^2 x \\) &nbsp; bằng:", correct: "1", wrongs: ["0", "-1", "2", "\\sin 2x", "\\cos 2x"] },
    { q: "Giá trị của &nbsp; \\( \\sin \\frac{\\pi}{6} \\) &nbsp; bằng:", correct: "\\frac{1}{2}", wrongs: ["\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{2}}{2}", "1", "0", "-\\frac{1}{2}"] },
    { q: "Bán kính mặt cầu &nbsp; \\( (S): x^2+y^2+z^2 = 16 \\) &nbsp; là:", correct: "4", wrongs: ["16", "8", "2", "256", "0"] },
    { q: "Trong không gian &nbsp; \\( Oxyz \\) &nbsp;, phương trình mặt phẳng &nbsp; \\( (Oyz) \\) &nbsp; là:", correct: "x = 0", wrongs: ["y = 0", "z = 0", "x+y+z=0", "x=y=z", "x=1"] },
    { q: "Họ nguyên hàm của hàm số &nbsp; \\( f(x) = e^{2x} \\) &nbsp; là:", correct: "\\frac{1}{2}e^{2x} + C", wrongs: ["e^{2x} + C", "2e^{2x} + C", "\\frac{1}{2}e^x + C", "e^x + C", "-\\frac{1}{2}e^{2x} + C"] },
    { q: "Có bao nhiêu hoán vị của 4 phần tử?", correct: "24", wrongs: ["16", "4", "12", "8", "32"] },
    { q: "Giá trị của &nbsp; \\( \\log 1000 \\) &nbsp; bằng:", correct: "3", wrongs: ["10", "100", "2", "4", "0"] },
    { q: "Tâm &nbsp; \\( I \\) &nbsp; của mặt cầu &nbsp; \\( (x-1)^2 + (y+2)^2 + z^2 = 9 \\) &nbsp; là:", correct: "(1; -2; 0)", wrongs: ["(-1; 2; 0)", "(1; 2; 0)", "(-1; -2; 0)", "(1; -2; 9)", "(0; 1; -2)"] },
    { q: "Kết quả của phép tính &nbsp; \\( 2^3 \\cdot 2^2 \\) &nbsp; bằng:", correct: "2^5", wrongs: ["2^6", "4^5", "4^6", "2^1", "2^{1.5}"] },
    { q: "Giá trị của &nbsp; \\( \\cos \\pi \\) &nbsp; bằng:", correct: "-1", wrongs: ["1", "0", "\\frac{1}{2}", "-\\frac{1}{2}", "\\frac{\\sqrt{2}}{2}"] },
    { q: "Diện tích xung quanh hình trụ bán kính &nbsp; \\( R \\) &nbsp;, cao &nbsp; \\( h \\) &nbsp; là:", correct: "2\\pi Rh", wrongs: ["\\pi Rh", "2\\pi R^2h", "\\pi R^2h", "4\\pi R^2", "\\frac{1}{3}\\pi R^2h"] },
    { q: "Phương trình &nbsp; \\( x^3 - 3x + 2 = 0 \\) &nbsp; có bao nhiêu nghiệm?", correct: "2", wrongs: ["1", "3", "0", "4", "V\\text{ô số}"] },
    { q: "Tiệm cận ngang của đồ thị hàm số &nbsp; \\( y = \\frac{2x-1}{x+1} \\) &nbsp; là:", correct: "y = 2", wrongs: ["y = -1", "x = 2", "x = -1", "y = 1", "y = 0"] },
    { q: "Tích phân &nbsp; \\( \\int_1^2 \\frac{1}{x} dx \\) &nbsp; bằng:", correct: "\\ln 2", wrongs: ["\\ln 3", "1", "\\frac{1}{2}", "e^2", "\\ln |x|"] },
    { q: "Cấp số cộng có &nbsp; \\( u_1=1, d=2 \\) &nbsp;. Giá trị &nbsp; \\( u_5 \\) &nbsp; bằng:", correct: "9", wrongs: ["7", "11", "5", "10", "8"] }
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
    
    // Xóa vịt cũ
    gameArea.querySelectorAll('.duck').forEach(d => d.remove());
    ducks = [];
    
    // Bốc câu hỏi mới
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionBox.innerHTML = `Câu hỏi: ${currentQuestion.q}`;
    
    if (window.MathJax) {
        MathJax.typesetPromise([questionBox]);
    }
    
    // Lấy 1 đáp án đúng và 5 đáp án sai
    let answers = [currentQuestion.correct, ...currentQuestion.wrongs.slice(0, 5)];
    answers.sort(() => Math.random() - 0.5);
    
    // Sinh toàn bộ 6 con vịt ngay lập tức (KHÔNG dùng setTimeout để tránh lỗi tua game)
    for(let i = 0; i < 6; i++) { 
        spawnDuck(answers[i], i);
    }
    
    clearInterval(gameInterval);
    gameInterval = setInterval(moveDucks, 30);
}

function spawnDuck(answerText, index) {
    let duck = document.createElement('div');
    duck.classList.add('duck');
    
    duck.innerHTML = `\\( ${answerText} \\)`;
    
    // CĂN CHỈNH CHIỀU DỌC (Tránh đè nhau và chừa chỗ cho súng)
    // Trừ đi 130px ở đáy màn hình để không gian bơi của vịt không đụng trúng khẩu súng
    let usableHeight = gameArea.clientHeight - 130; 
    let laneHeight = usableHeight / 6; 
    let startY = (index * laneHeight) + 10;
    
    // CĂN CHỈNH CHIỀU NGANG (Tạo thành từng đợt bơi ngẫu nhiên)
    // Con thứ 1 cách lề 0px, con 2 cách 250px, con 3 cách 500px... cộng thêm độ chênh lệch ngẫu nhiên
    let delaySpacing = (Math.floor(index / 2) * 250) + (Math.random() * 150); 
    
    let direction = (index % 2 === 0) ? 1 : -1; 
    
    // Đẩy vịt ra tít ngoài màn hình dựa trên khoảng cách delaySpacing
    let startX = (direction === 1) ? -100 - delaySpacing : gameArea.clientWidth + 50 + delaySpacing; 
    
    if (direction === -1) {
        duck.classList.add('fly-left');
    }
    
    duck.style.top = startY + 'px';
    duck.style.left = startX + 'px';
    duck.dataset.answer = answerText;
    duck.dataset.direction = direction;
    
    // Cập nhật đoạn lắng nghe sự kiện bắn vịt trong hàm spawnDuck
    duck.addEventListener('mousedown', function(e) {
        e.stopPropagation(); // <--- DÒNG QUAN TRỌNG: Ngăn sự kiện bắn lan ra ngoài nền (tránh lỗi trừ máu oan)
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
// XỬ LÝ TÍNH NĂNG BẮN HỤT
gameArea.addEventListener('mousedown', (e) => { // Sửa 'click' thành 'mousedown'
    // Chỉ tính khi game đang trong màn hình chơi (ui2 đang hiển thị)
    // và người chơi click vào khoảng trống (không bấm trúng con vịt)
    if (ui2.style.display === 'flex' && !e.target.closest('.duck')) {
        handleMiss();
    }
});

function handleMiss() {
    if (health <= 0) return;
    
    // Trừ 1 máu khi bắn hụt
    health--;
    updateHealthUI();
    
    // Dừng chuyển động của đàn vịt hiện tại
    clearInterval(gameInterval);
    
    // Xóa toàn bộ vịt đang có trên màn hình
    gameArea.querySelectorAll('.duck').forEach(d => d.remove());
    
    // Kiểm tra nếu hết máu thì kết thúc game, ngược lại chuyển sang câu hỏi/đợt vịt mới
    if (health <= 0) {
        gameOver();
    } else {
        setTimeout(nextTurn, 300);
    }
}
