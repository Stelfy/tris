let grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];  // rappresentazione in un array della griglia
let turn = 1;  // indica di chi e' il turno
let finished = false;  // indica se il gioco e' terminato
let ai = false;  // indica se l'ai e' attivo o se si e' in 1vs1
let turnCount = 1;  // conteggio dei turni
let puntiX = 0;  // punti dei giocatori x e o
let puntiO = 0;
let coloreUno = '#001219';  // colori dei giocatori uno e due
let coloreDue = '#9b2226';
let lang = "it"  // lingua del sito
let formaUno = "O";  // forme di gioco dei giocatori uno e due
let formaDue = "X";

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

window.onload = function() {
    loadVars();
    loadEventListeners();
    updateLang();
    updateColor();
    updateForma();
};

function loadVars() {
    if (localStorage.getItem('ai'))
        ai = localStorage.getItem('ai');
    if (localStorage.getItem('coloreUno'))
        coloreUno = localStorage.getItem('coloreUno');
    if (localStorage.getItem('coloreDue'))
        coloreDue = localStorage.getItem('coloreDue');
    if (localStorage.getItem('formaUno'))
        formaUno = localStorage.getItem('formaUno');
    if (localStorage.getItem('formaDue'))
        formaDue = localStorage.getItem('formaDue');
    if (localStorage.getItem('lang'))
        lang = localStorage.getItem('lang');
}

function loadEventListeners() {
    if (document.getElementById('input-colore-uno')) document.getElementById('input-colore-uno').addEventListener('change', onColorChange, false);
    if (document.getElementById('input-colore-due')) document.getElementById('input-colore-due').addEventListener('change', onColorChange, false);
    if (document.getElementById('input-forma-uno')) document.getElementById('input-forma-uno').addEventListener('change', onFormaChange, false);
    if (document.getElementById('input-forma-due')) document.getElementById('input-forma-due').addEventListener('change', onFormaChange, false);
    if (document.getElementById('input-lingua')) document.getElementById('input-lingua').addEventListener('change', changeLang, false);
}

function updateLang() {
    const elements = document.getElementsByTagName('*');
    for (obj of elements){
        if (obj.dataset[lang]){
            obj.textContent = obj.dataset[lang];
        }
    }
}

function updateForma() {
    const formaInputs = document.querySelectorAll(".contenitore-armadietto select");
    if (!formaInputs) return;
    for (obj of formaInputs){
        if (obj.id == 'input-forma-uno'){
            obj.value = formaUno;
        } else if (obj.id == 'input-forma-due'){
            obj.value = formaDue;
        }
    }
    const turno = document.getElementById("turn");
    if (turno) turno.textContent = "Turno: " + formaUno;
}

function updateColor() {
    const colorInputs = document.querySelectorAll("input[type='color']");
    if (!colorInputs) return;
    for (obj of colorInputs){
        if (obj.id == 'input-colore-uno'){
            obj.value = coloreUno;
            document.getElementById('armadietto-titolo-uno').style.color = coloreUno;
        } else if (obj.id == 'input-colore-due'){
            obj.value = coloreDue;
            document.getElementById('armadietto-titolo-due').style.color = coloreDue;
        }
    }
    const labelPunti1 = document.getElementById('g1');
    const labelPunti2 = document.getElementById('g2');
    if (labelPunti1) labelPunti1.style.color = coloreUno;
    if (labelPunti2) labelPunti2.style.color = coloreDue;
}

// controllo se il gioco e' vinto
function isWon(gameGrid, isReal) {
    for (let i = 0; i < winningPatterns.length; i++){
        const arr = winningPatterns[i];
        if (gameGrid[arr[0]] != 0 && gameGrid[arr[0]] == gameGrid[arr[1]] && gameGrid[arr[1]] == gameGrid [arr[2]]){
            if (isReal){
                for (let j = 0; j < 3; j++)
                    document.getElementById('box'+(arr[j]+1)).classList.add('vinto');
            }
            return true;
        } 
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
        obj.style.color = `${coloreUno}`;
        obj.innerHTML = formaUno;
        turnDiv.innerHTML = "Turno: " + formaDue; 
    }
    else {
        obj.style.color = `${coloreDue}`;
        obj.innerHTML = formaDue;
        turnDiv.innerHTML = "Turno: " + formaUno;
    }

    grid[num-1] = (turn == 1) ? "O" : "X";

    if (isWon(grid, true)) {
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
        const box = document.getElementById("box5");
        box.innerHTML = formaDue;
        box.style.color = `${coloreDue}`
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

        const box = document.getElementById("box"+(bestMove+1));
        box.innerHTML = formaDue;
        box.style.color = `${coloreDue}`
        grid[bestMove] = "X";
    }

    if (isWon(grid, true)) {
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
        turnDiv.innerHTML = "Turno: " + formaUno;
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
        turnDiv.innerHTML = "Turno: " + formaUno; 
    }
    else {
        turnDiv.innerHTML = "Turno: " + formaDue;
    }

    for (let i = 0; i < 9; i++){
        const box = document.getElementById("box"+(i+1));
        if (grid[i] == 0) box.innerHTML = "";
        else if (grid[i] == "O") box.innerHTML = formaUno;
        else if (grid[i] == "X") box.innerHTML = formaDue;
        box.classList.remove('vinto');
    }

    document.getElementById('punti1').innerHTML = puntiO;
    document.getElementById('punti2').innerHTML = puntiX;
}


// PAGINA GIOCO

function onPcClick() {
    document.getElementById('wrapper-bottoni-gioco').style.display = "none";
    document.getElementById('wrapper-bottoni-difficolta').style.display = "block";
}

function onDiffChoice(obj) {
    localStorage.setItem('ai', obj.value);
    window.location.href = "./tris.html";
}


// PAGINA ARMADIETTO

function onFormaChange(event) {
    const forma = event.target.value;
    if (event.target.id === 'input-forma-uno'){
        localStorage.setItem('formaUno', forma);
        formaUno = forma;
    } else if (event.target.id === 'input-forma-due'){
        localStorage.setItem('formaDue', forma);
        formaDue = forma;
    }
}

function onColorChange(event) {
    const color = event.target.value;
    if (event.target.id === 'input-colore-uno'){
        document.getElementById('armadietto-titolo-uno').style.color = `${color}`;
        localStorage.setItem('coloreUno', color);
        coloreUno = color;
    } else if (event.target.id === 'input-colore-due'){
        document.getElementById('armadietto-titolo-due').style.color = `${color}`;
        localStorage.setItem('coloreDue', color);
        coloreDue = color;
    }
}


// PAGINA IMPOSTAZIONI

function changeLang(event) {
    const language = event.target.value;
    localStorage.setItem('lang', language);
    const elements = document.getElementsByTagName('*');
    for (obj of elements){
        if (obj.dataset[language]){
            obj.textContent = obj.dataset[language];
        }
    }
}

function showNames() {
    const names = document.getElementById('contenitore-nomi');
    if (names.style.visibility === 'hidden') names.style.visibility = 'visible';
    else names.style.visibility = 'hidden';
}


// MUSICA

const audio = new Audio('./canzone-tris.mp3');
audio.volume = 0.5;
function onToggleMusic() {
    const audioButton = document.getElementById('bottone-musica');
    if (audio.paused){
        audioButton.classList.add('playing')
        audio.play();
    } else {
        audioButton.classList.remove('playing')
        audio.pause();
    }    
}