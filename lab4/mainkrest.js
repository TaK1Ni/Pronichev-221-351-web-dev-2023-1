'use strict';

const state = {
    
};

function showMessage (text, category = "Good") {
    let messBox = document.querySelector(".messages");
    let newMess = document.createElement('div');
    newMess.className = `message message${category}`;
    newMess.innerHTML = text;
    messBox.append(newMess);
    setTimeout(() => newMess.remove(), 2000);
}

function deadEnd (collection) {
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].innerHTML == "") return false;
    }
    return true;
}

function checkRow (collection, i) {
    let preState = collection.item(i * 3);
    if (preState.innerHTML == "") return false;
    for (let j = 1; j < collection.length / 3; j++) {
        if (preState.innerHTML != collection.item(i * 3 + j).innerHTML)
            return false;
    }
    return true;
}

function checkColumn (collection, i) {
    let preState = collection.item(i);
    if (preState.innerHTML == "") return false;
    for (let j = 1 ; j < collection.length / 3; j++) {
        if (preState.innerHTML != collection.item(j * 3 + i).innerHTML)
            return false;
    }
    return true;
}

function checkDiagMAIN (collection) {
    let preState = collection.item(0);
    if (preState.innerHTML == "") return false;
    for (let i = 0; i < collection.length / 3; i++) {
        if (preState.innerHTML != collection.item(i * 3 + i).innerHTML)
            return false;
    }
    return true;
}

function checkDiagSUB (collection) {
    let preState = collection.item(2);
    if (preState.innerHTML == "") return false;
    for (let i = 0; i < collection.length / 3; i++) {
        if (preState.innerHTML != collection.item(i * 3 + 2 - i).innerHTML)
            return false;
    }
    return true;
}

function checkWinner (collection) {
    let isWIN;
    for (let i = 0; i < collection.length / 3; i++) {
        isWIN = checkRow(collection, i);
        isWIN = isWIN || checkColumn(collection, i);
        if (isWIN) return true;
    }
    isWIN = checkDiagMAIN(collection);
    isWIN = isWIN || checkDiagSUB(collection);
    return isWIN;
}

function onCellClick (event) {
    if (state.gameOver) {
        showMessage("game is over, start new game", "Bad");
        return;
    }
    if (event.target.className == "field" && event.target.innerHTML == "") {
        event.target.innerHTML = state.move ? "O" : "X";
        state.move = !state.move;
        if (checkWinner(this.children)) { 
            
            showMessage("win " + event.target.innerHTML);

            state.gameOver = true;
            return;
        }
    }
    if (deadEnd(this.children)) {
        showMessage("draw", "Bad");
        state.gameOver = true;
        return;
    }     
}


function init () {
    state.move = false;
    state.gameOver = false;
    state.winner = null;
    let board = document.getElementById("board");
    board.addEventListener("click", onCellClick);
    board.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        board.innerHTML += "<div class=\"field\"></div>";
    }
}

function preLoad () {
    document.getElementById("btn").onclick = init;
    init();
}
