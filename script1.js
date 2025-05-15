// COMMIT: Initialize game variables and UI references
const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const width = 8;
let squares = [];
const candyColors = [
  'url(images/confused.png)',
  'url(images/emoji.png)',
  'url(images/happy.png)',
  'url(images/sad.png)',
  'url(images/smile.png)',
  'url(images/smile11.png)',
];

let score = 0;
let timeLeft = 60;
let timerInterval;
let logicInterval;

const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');

restartButton.style.display = 'none';

// Attach one clean event listener to start game
startButton.addEventListener('click', startGame);

// Main game function
function startGame() {
  startButton.style.display = 'none';
  restartButton.style.display = 'none';
  score = 0;
  timeLeft = 60;
  scoreDisplay.innerText = 0;
  timerDisplay.innerText = 60;
  grid.innerHTML = "";
  squares.length = 0;

  createBoard();

  // Start timer
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = timeLeft;

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      clearInterval(logicInterval);

      const scoreValue = score;
      const message = `🎉 Well done! Your final score is ${scoreValue}. Want to play again or exit?`;
      document.getElementById("finalScoreMessage").innerText = message;

      const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
      modal.show();
    }
  }, 1000);

  // Start game logic
  logicInterval = setInterval(() => {
    moveDown();
    checkRowForThree();
    checkColumnForThree();
  }, 100);

  // Enable drag-and-drop after a short delay
  setTimeout(() => {
    squares.forEach(square => square.addEventListener('dragstart', dragStart));
    squares.forEach(square => square.addEventListener('dragend', dragEnd));
    squares.forEach(square => square.addEventListener('dragover', e => e.preventDefault()));
    squares.forEach(square => square.addEventListener('dragenter', e => e.preventDefault()));
    squares.forEach(square => square.addEventListener('drop', dragDrop));
  }, 200);
}

// COMMIT: Create board of draggable squares with random emojis
function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const square = document.createElement('div');
    square.setAttribute('draggable', true);
    square.setAttribute('id', i);
    let randomColor = Math.floor(Math.random() * candyColors.length);
    square.style.backgroundImage = candyColors[randomColor];
    grid.appendChild(square);
    squares.push(square);
  }
}

// COMMIT: Drag and drop functionality
let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

function dragStart() {
  colorBeingDragged = this.style.backgroundImage;
  squareIdBeingDragged = parseInt(this.id);
}

function dragDrop() {
  colorBeingReplaced = this.style.backgroundImage;
  squareIdBeingReplaced = parseInt(this.id);
  squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
  squares[squareIdBeingReplaced].style.backgroundImage = colorBeingDragged;
}

function dragEnd() {
  let validMoves = [
    squareIdBeingDragged - 1,
    squareIdBeingDragged - width,
    squareIdBeingDragged + 1,
    squareIdBeingDragged + width
  ];
  let validMove = validMoves.includes(squareIdBeingReplaced);

  if (squareIdBeingReplaced && validMove) {
    squareIdBeingReplaced = null;
  } else {
    squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
    squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
  }
}

// COMMIT: Check and clear rows and columns of 3
function checkRowForThree() {
  for (let i = 0; i < 62; i++) {
    let rowOfThree = [i, i+1, i+2];
    let decidedColor = squares[i].style.backgroundImage;
    const isBlank = decidedColor === '';
    if (rowOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
      score += 3;
      scoreDisplay.innerHTML = score;
      rowOfThree.forEach(index => squares[index].style.backgroundImage = '');
    }
  }
}

function checkColumnForThree() {
  for (let i = 0; i < 47; i++) {
    let columnOfThree = [i, i+width, i+width*2];
    let decidedColor = squares[i].style.backgroundImage;
    const isBlank = decidedColor === '';
    if (columnOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
      score += 3;
      scoreDisplay.innerHTML = score;
      columnOfThree.forEach(index => squares[index].style.backgroundImage = '');
    }
  }
}

// COMMIT: Move emojis down and refill blank spots
function moveDown() {
  for (let i = 0; i < 56; i++) {
    if (squares[i + width].style.backgroundImage === '') {
      squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
      squares[i].style.backgroundImage = '';
    }
  }

  for (let i = 0; i < 8; i++) {
    if (squares[i].style.backgroundImage === '') {
      let randomColor = Math.floor(Math.random() * candyColors.length);
      squares[i].style.backgroundImage = candyColors[randomColor];
    }
  }
}

// COMMIT: Display player's name
const playerName = sessionStorage.getItem('playerName');
if (playerName) {
  const nameDisplay = document.getElementById('player-name-display');
  if (nameDisplay) {
    nameDisplay.textContent = `🎉 Player: ${playerName}`;
  }
}

// COMMIT: Restart game using dedicated button
restartButton.addEventListener('click', () => location.reload());

// COMMIT: Automatically start game if flag is set
if (sessionStorage.getItem('startImmediately') === 'true') {
  sessionStorage.removeItem('startImmediately');
  window.addEventListener('load', startGame);
}

//COMMIT: Functions for modal buttons
function restartGame() {
  // 👇 Close the Bootstrap modal first
  const modalElement = document.getElementById('gameOverModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide(); //  hide the modal manually
  }

  // 🧹 Clear intervals
  clearInterval(timerInterval);
  clearInterval(logicInterval);

  // Reset variables
  score = 0;
  timeLeft = 60;
  scoreDisplay.innerText = 0;
  timerDisplay.innerText = 60;
  grid.innerHTML = "";
  squares.length = 0;

  //  Display player name again
  const name = sessionStorage.getItem("playerName");
  if (name) {
    document.getElementById("player-name-display").innerText = `🎉 Player: ${name}`;
  }

  // Rebuild board
  createBoard();

  //Restart timer
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = timeLeft;

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      clearInterval(logicInterval);
      const scoreValue = score;
      const message = `🎉 Well done! Your final score is ${scoreValue}. Want to play again or exit?`;
      document.getElementById("finalScoreMessage").innerText = message;

      const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
      modal.show();
    }
  }, 1000);

  // Restart logic loop
  logicInterval = setInterval(() => {
    moveDown();
    checkRowForThree();
    checkColumnForThree();
  }, 100);

  // Reattach drag-and-drop
  setTimeout(() => {
    squares.forEach(square => square.addEventListener('dragstart', dragStart));
    squares.forEach(square => square.addEventListener('dragend', dragEnd));
    squares.forEach(square => square.addEventListener('dragover', e => e.preventDefault()));
    squares.forEach(square => square.addEventListener('dragenter', e => e.preventDefault()));
    squares.forEach(square => square.addEventListener('drop', dragDrop));
  }, 200);
}


function showWelcome() {
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('welcomeScreen').style.display = 'block';

  clearInterval(timerInterval); // stop timer
  clearInterval(logicInterval); //stop logic

  grid.innerHTML = ""; // ✅ clear board
  squares = [];
  sessionStorage.clear(); // ✅ clear player name
  score = 0;
  timeLeft = 60;
  scoreDisplay.innerText = 0;
  timerDisplay.innerText = 60;
}




