var grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var turn = 1;
var finished = false;
var ai = false;
var turnCount = 1;

const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

function isWon(gameGrid) {
    for (let i = 0; i < winningPatterns.length; i++){
        const arr = winningPatterns[i];
        if (gameGrid[arr[0]] != 0 && gameGrid[arr[0]] == gameGrid[arr[1]] && gameGrid[arr[1]] == gameGrid [arr[2]]) return true;
    }
    return false;
}

function isDraw(gameGrid) {
    for (let i = 0; i < gameGrid.length; i++){
        if (gameGrid[i]===0) return false;
    }
    return true;
}


function onSelect(obj) {
    const num = Number(obj.dataset.num);
    const turnDiv = document.getElementById("turn");

    if (grid[num-1] != 0 || finished) return;

    if (turn === 1) {
        turn = 2;
        obj.innerHTML = "O";
        turnDiv.innerHTML = "Turno: X"; 
    }
    else {
        turn = 1;
        obj.innerHTML = "X";
        turnDiv.innerHTML = "Turno: O";
    }

    grid[num-1] = obj.innerHTML;

    if (isWon(grid)) {
        // show winner and stop game
        turnDiv.innerHTML = "Vincitore: " + obj.innerHTML;
        finished = true;
    }
    else if (isDraw(grid)) {
        // draw
        turnDiv.innerHTML = "Pareggio";
        finished = true;
    }

    turnCount++;

    if (ai && !finished) playAI();
}

function playAI() {
    const turnDiv = document.getElementById("turn");
    if (turnCount === 1){
        // place in center
        document.getElementById("box5").innerHTML = "X";
        grid[4] = "X";
    }
    else {
        console.time('AI execution time')
        const bestMove = findBestMoveHard(grid);
        console.timeEnd('AI execution time')

        document.getElementById("box"+(bestMove+1)).innerHTML = "X";
        grid[bestMove] = "X";
    }

    turn = 1;
    if (isWon(grid)) {
        // show winner and stop game
        turnDiv.innerHTML = "Vincitore: " + "Computer";
        finished = true;
    }
    else if (isDraw(grid)) {
        // draw
        turnDiv.innerHTML = "Pareggio";
        finished = true;
    }
    else {
        // continue playing
        turnDiv.innerHTML = "Turno: O";
    }
    turnCount++;
}


// ALL ALGORITHM DIFFICULTIES

const memo = new Map();
function findBestMoveHard(arr) {
    let move = 10;
    let bestScore = 0;
    for (let i = 0; i < 9; i++){
        if (arr[i] != 0) continue;

        const newArr = [...arr];
        newArr[i] = "X";
        const score = helper(newArr, 1);

        if (score == 2) return i;

        if (score >= bestScore){
            bestScore = score;
            move = i;
        }
    }
    return move;
}


function helper(arr, turn) {
    if (isWon(arr)) return (turn % 2 != 0) ? 2 : 0;
    if (isDraw(arr)) return 1;

    if (memo.get(arr)) return memo.get(arr);

    let scores = [];
    for (let i = 0; i < 9; i++){
        if (arr[i] != 0) continue; 

        const newArr = [...arr];

        if (turn % 2 != 0)
            newArr[i] = "O";
        else    
            newArr[i] = "X";

        const score = helper(newArr, turn+1);

        if (turn % 2 != 0 && score == 0){
            memo.set(arr, 0);
            return 0;
        }
        else if (turn % 2 == 0 && score == 2){
            memo.set(arr, 2);
            return 2;
        }

        scores.push(score);
    }
    const bestScore = (turn % 2 != 0) ? Math.min(...scores) : Math.max(...scores);
    memo.set(arr, bestScore);
    return bestScore;
}

function findBestMoveMedium(arr) {
    var possibleMove = 10;
    for (let i = 0; i < 9; i++){
        if (arr[i] != 0) continue;

        let newArr = [...arr];
        newArr[i] = "X";
        if (isWon(newArr) || isDraw(newArr)) return i;

        var worstMove = 1;
        for (let j = 0; j < 9; j++){
            if (newArr[j] != 0) continue;

            let newArr2 = [...newArr];
            newArr2[j] = "O";

            if (isWon(newArr2)) {
                worstMove = 0;
                break;
            }
            else if (isDraw(newArr2)) worstMove = 1;
        }

        if (worstMove == 1) possibleMove = i;
    }

    if (possibleMove != 10) return possibleMove;

    for (let i = 0; i < 9; i++){
        if (arr[i] == 0) return i;
    }
    return 10;
}

function findBestMoveEasy(arr) {
    for (let i = 0; i < 9; i++){
        if (arr[i] != 0) continue;

        let newArr = [...arr];
        newArr[i] = "X";
        if (isWon(newArr) || isDraw(newArr)) return i;
    }

    var randomArr = []; 
    for (let i = 0; i < 9; i++){
        if (arr[i] == 0){
            randomArr.push(i);
        }
    }

    return randomArr[Math.floor(Math.random()*randomArr.length)];
}

function onReset() {
    turnCount = 1;
    finished = false;
    grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 1; i < 10; i++){
        document.getElementById("box"+i).innerHTML = "";
    }

    const turnDiv = document.getElementById("turn");

    if (turn === 1) {
        turnDiv.innerHTML = "Turno: O"; 
    }
    else {
        turnDiv.innerHTML = "Turno: X";
        if (ai) playAI();
    }
    
}

function onModeChange1v1(obj) {
    if (!ai) return;
    ai = false;
    click(obj);
    unclick(document.getElementById("ai"));
}

function onModeChangeAI(obj) {
    if (ai) return;
    ai = true;
    click(obj);
    unclick(document.getElementById("1v1"))
    if (turn == 2) playAI();
}

// animazioni per bottoni
function click(obj) {
    obj.style.transform = "translate(5px, 10px)" 
    obj.style.boxShadow = "none"
}

function unclick(obj) {
    obj.style.transform = "none" 
    obj.style.boxShadow = "5px 10px black"
}



