let grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];  // rappresentazione in un array della griglia
let turn = 1;  // indica di chi e' il turno
let finished = false;  // indica se il gioco e' terminato
let ai = 'hard';  // indica se l'ai e' attivo o se si e' in 1vs1
let turnCount = 1;  // conteggio dei turni
let puntiX = 0;  // punti dei giocatori x e o
let puntiO = 0;

// tutte le combinazioni vincenti
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

// controllo se il gioco e' vinto
function isWon(gameGrid) {
    for (let i = 0; i < winningPatterns.length; i++){
        const arr = winningPatterns[i];
        if (gameGrid[arr[0]] != 0 && gameGrid[arr[0]] == gameGrid[arr[1]] && gameGrid[arr[1]] == gameGrid [arr[2]]) return true;
    }
    return false;
}

// controllo se il gioco e' pareggiato
function isDraw(gameGrid) {
    for (let i = 0; i < gameGrid.length; i++){
        if (gameGrid[i]===0) return false;
    }
    return true;
}

// aumenta e aggiorna i punti
function onWin() {
    (turn === 1) ? puntiO++ : puntiX++;  
    document.getElementById('punti1').innerHTML = puntiO;
    document.getElementById('punti2').innerHTML = puntiX;
    finished = true;
}

// inserisce il simbolo giusto nella casella selezionata 
function onSelect(obj) {
    const num = Number(obj.dataset.num);
    const turnDiv = document.getElementById("turn");

    if (grid[num-1] != 0 || finished) return;

    if (turn === 1) {
        obj.innerHTML = "O";
        turnDiv.innerHTML = "Turno: X"; 
    }
    else {
        obj.innerHTML = "X";
        turnDiv.innerHTML = "Turno: O";
    }

    grid[num-1] = obj.innerHTML;

    if (isWon(grid)) {
        // mostra vincitore, termina partita e aggiorna i punti
        turnDiv.innerHTML = "Vincitore: " + obj.innerHTML;
        onWin();
    }
    else if (isDraw(grid)) {
        // termina partita per pareggio
        turnDiv.innerHTML = "Pareggio";
        finished = true;
    }

    (turn === 1) ? turn = 2 : turn = 1;  // aggiorna il turno
    turnCount++;

    if (ai && !finished) playAI();
}

// gioca la mossa stabilita dall' algoritmo
function playAI() {
    const turnDiv = document.getElementById("turn");
    if (turnCount === 1){
        // place in center
        document.getElementById("box5").innerHTML = "X";
        grid[4] = "X";
    }
    else {
        console.time('AI execution time')

        var bestMove = 10;
        if (ai === 'hard'){
            bestMove = findBestMoveHard(grid);
        } else if (ai === 'normal') {
            bestMove = findBestMoveMedium(grid);
        } else if (ai === 'easy') {
            bestMove = findBestMoveEasy(grid);
        }

        console.timeEnd('AI execution time')

        document.getElementById("box"+(bestMove+1)).innerHTML = "X";
        grid[bestMove] = "X";
    }

    if (isWon(grid)) {
        // show winner and stop game
        turnDiv.innerHTML = "Vincitore: Computer";
        onWin();
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
    turn = 1;
    turnCount++;
}


// TUTTE LE DIFFICOLTA DEGLI ALGORITMI

// trova la mossa con punteggio piu alto con funzione helper 
// time: < O(n!)
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

// implementazione ricorsiva di un algoritmo "minmax" con memoizazione
// restituisce 2 per vittoria, 1 per pareggio e 0 per sconfitta
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

// implementazione a due livelli dell'algoritmo ricorsivo, controlla sia se puo vincere X sia se puo vincere O al prossimo turno
// time: O(n*n*n*n) con n uguale al numero di caselle
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

// algoritmo che guarda solo se la mossa successiva e una vittoria per x o un  pareggio
// time: O(n*n) con n uguale al numero di caselle
function findBestMoveEasy(arr) {
    for (let i = 0; i < 9; i++){
        if (arr[i] != 0) continue;

        let newArr = [...arr];
        newArr[i] = "X";
        if (isWon(newArr) || isDraw(newArr)) return i;
    }

    //scelta casuale fra il resto delle mosse se non ci sono vittorie o pareggi
    var randomArr = []; 
    for (let i = 0; i < 9; i++){
        if (arr[i] == 0){
            randomArr.push(i);
        }
    }

    return randomArr[Math.floor(Math.random()*randomArr.length)];
}

// resetta la griglia
function onClear() {
    turnCount = 1;
    finished = false;
    grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    update();
    if (turn === 2 && ai) playAI();
}

function onReset() {
    puntiO = 0;
    puntiX = 0; 
    onClear();
}

// aggiorna griglia e turno
function update() {
    const turnDiv = document.getElementById("turn");

    if (turn === 1) {
        turnDiv.innerHTML = "Turno: O"; 
    }
    else {
        turnDiv.innerHTML = "Turno: X";
    }

    for (let i = 0; i < 9; i++){
        const box = document.getElementById("box"+(i+1));
        if (grid[i] == 0) box.innerHTML = "";
        else if (grid[i] == "O") box.innerHTML = "O";
        else box.innerHTML = "X";
    }

    document.getElementById('punti1').innerHTML = puntiO;
    document.getElementById('punti2').innerHTML = puntiX;
}

// per cambiare la modalita di gioco da 1vs1 a pc e viceversa
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



