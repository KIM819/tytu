const seatingGrid = document.querySelector('.seating-grid');
const studentInput = document.getElementById('studentNumber');
const seatInput = document.getElementById('seatNumber');
const submittedList = document.getElementById('submittedList');
const confirmButton = document.getElementById('confirmButton');
const resultDiv = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const form = document.getElementById('seatForm');

const studentData = {}; // 各出席番号が希望する席番号
const finalSeats = {}; // 最終確定した席
let currentStudentNumber = 1; // 現在の出席番号

// 初期化
function initialize() {
    studentInput.value = currentStudentNumber;
}

// 座席をクリックで選択
seatingGrid.addEventListener('click', (event) => {
    const seatElement = event.target;

    if (!seatElement.classList.contains('seat')) return;

    // 確定済みの席は選択不可
    const seatNumber = parseInt(seatElement.dataset.seat, 10);
    if (finalSeats[seatNumber]) {
        alert(`席番号${seatNumber}は確定済みです。他の席を選んでください。`);
        return;
    }

    // 青いハイライトを更新
    document.querySelectorAll('.seat').forEach(seat => seat.classList.remove('selected'));
    seatInput.value = seatNumber;
    seatElement.classList.add('selected');
});

// 入力
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const studentNumber = parseInt(studentInput.value, 10);
    const seatNumber = parseInt(seatInput.value, 10);

    if (isNaN(seatNumber)) {
        alert('席番号を選んでください。');
        return;
    }

    studentData[studentNumber] = seatNumber;
    updateSubmittedList();

    // 青いハイライトを消す
    document.querySelectorAll('.seat').forEach(seat => seat.classList.remove('selected'));

    seatInput.value = '';
    currentStudentNumber++;
    studentInput.value = currentStudentNumber <= 39 ? currentStudentNumber : '';
});

// 入力済みリスト更新
function updateSubmittedList() {
    submittedList.textContent = Object.entries(studentData)
        .map(([student, seat]) => `${student}`)
        .join(', ');
}

// 確定
confirmButton.addEventListener('click', () => {
    handleConflicts();
    displayFinalSeats();
    markUnselectedSeats();
});

// 重複のある席番号を解決
function handleConflicts() {
    const seatCounts = {}; // 席ごとの希望人数
    const conflicts = {}; // 被りがある席の管理

    // 席番号ごとの人数をカウント
    Object.values(studentData).forEach(seat => {
        seatCounts[seat] = (seatCounts[seat] || 0) + 1;
    });

    // 被りのある席を収集
    for (const [student, seat] of Object.entries(studentData)) {
        if (seatCounts[seat] === 1) {
            finalSeats[seat] = student; // 被りなしは確定
        } else {
            if (!conflicts[seat]) {
                conflicts[seat] = [];
            }
            conflicts[seat].push(student);
        }
    }

    // 被りのある席を表示
    resultContent.innerHTML = '';
    for (const [seat, students] of Object.entries(conflicts)) {
        const conflictDiv = document.createElement('div');
        conflictDiv.innerHTML = `
            <p>席番号${seat}に希望した出席番号: ${students.join(', ')}</p>
            <button onclick="resolveConflict(${seat}, [${students.join(',')}])" class="resolve-btn">手動で解決</button>
        `;
        resultContent.appendChild(conflictDiv);
    }

    if (Object.keys(conflicts).length > 0) {
        resultDiv.classList.remove('hidden');
    }
}

// 手動で解決
function resolveConflict(seat, students) {
    const selectedStudent = prompt(`席番号${seat}を確定させる出席番号を入力してください (${students.join(', ')}):`);
    if (!students.includes(Number(selectedStudent))) {
        alert('無効な入力です。');
        return;
    }

    finalSeats[seat] = Number(selectedStudent);

    // 残りの学生を未割り当てに戻す
    students.forEach(student => {
        if (student !== Number(selectedStudent)) {
            delete studentData[student];
        }
    });

    updateSubmittedList();
    handleConflicts(); // 再確認
}

// 確定された席と出席番号を表示
function displayFinalSeats() {
    const finalList = Object.entries(finalSeats)
        .map(([seat, student]) => `<p>席番号${seat}: 出席番号${student}</p>`)
        .join('');
    resultContent.innerHTML += finalList;
    resultDiv.classList.remove('hidden');
}

// 未選択の席を赤い文字にする
function markUnselectedSeats() {
    document.querySelectorAll('.seat').forEach(seat => {
        const seatNumber = parseInt(seat.dataset.seat, 10);
        if (!finalSeats[seatNumber]) {
            seat.classList.add('unselected-text');
        } else {
            seat.classList.remove('unselected-text');
        }
    });
}

// 初期化
initialize();