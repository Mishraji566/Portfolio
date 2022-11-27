let canvas = document.querySelector('canvas');
let wrapper = document.querySelector('.wrapper');
let resetGameBtn = document.querySelector('#reset');
let diceDisplay = document.querySelector('#diceThrow');
let playerDisplay = document.querySelector('.playerName');
let message = document.querySelector('.message');
let ctx = canvas.getContext('2d');
let height = 500;
let width = 500;
let gridSize = 50;
let gridMid = 25;
let walking, walkSpeed = 450;
let locked = false;
let slideSpeed = .5;
let rolled = '', rolling, rollCount, rollMax, rollSpeed=85;

let player1 = {current:0, target:0, x:0, y:0, colour:'#f36d', id:'You'};
let player2 = {current:0, target:0, x:0, y:0, colour:'#8a2d', id:'AutoBot'};
let activePlayer = player1;

const obstacles = [
	{type:'snake', start:97, end:78},
	{type:'snake', start:95, end:56},
	{type:'snake', start:88, end:24}, 
	{type:'snake', start:62, end:18},
	{type:'snake', start:48, end:26},
	{type:'snake', start:36, end:6}, 
	{type:'snake', start:32, end:10},
	{type:'ladder', start:1, end:38},
	{type:'ladder', start:4, end:14},
	{type:'ladder', start:8, end:30},
	{type:'ladder', start:21, end:42},
	{type:'ladder', start:28, end:76},
	{type:'ladder', start:50, end:67},
	{type:'ladder', start:71, end:92},
	{type:'ladder', start:80, end:99}
];

canvas.width = width;
canvas.height = height;
wrapper.style.width = `${width}px`;
ctx.strokeStyle = '#555';
ctx.lineWidth = 2;

const setLocked = (tf) => {
	locked = tf;
}

const boustrophedonWalk = (cols, rows) => {
	let temp = [];
	for(let row=0; row<rows; row++){
		let t = Array.apply(null, Array(cols)).map((x, col) => {
			return {id:col+row*cols, y:height - gridSize - row*gridSize, x:col*gridSize};
		});
		t = row % 2 ? t.reverse() : t;
		temp = [...temp, ...t];
	}
	return temp;
}

const drawPlayers = () => {
	ctx.clearRect(0, 0, width, height);
	if(player1.current > 0) {
		ctx.fillStyle = player1.colour;
		ctx.beginPath();
		ctx.arc(player1.x+gridMid, player1.y+gridMid, 16, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}
	if(player2.current > 0) {
		ctx.fillStyle = player2.colour;
		ctx.beginPath();
		if(player2.current === player1.current){
			ctx.arc(player2.x+gridMid, player2.y+gridMid, 16, 45, Math.PI + 45);
		} 
		else {
			ctx.arc(player2.x+gridMid, player2.y+gridMid, 16, 0, 2 * Math.PI);
		}
		ctx.fill();
		ctx.stroke();
	}
}

const walk = () => {
	let activeCounter = activePlayer.current++;
	let sliding = false;
	activePlayer.x = walkSequence[activeCounter].x;
	activePlayer.y = walkSequence[activeCounter].y;
	drawPlayers();
	
	if(activeCounter === 99){
		clearInterval(walking);
		showWinner();
		return;
	}
	
	if(activePlayer.current >= activePlayer.target){
		clearInterval(walking);
		
		// check obstacles
		for(let i=0; i < obstacles.length; i++){
			if(obstacles[i].start === activePlayer.target){
				let endSquare = obstacles[i].end;
				activePlayer.target = obstacles[i].end;
				sliding = true;
				slide(activePlayer, walkSequence[endSquare-1].x, walkSequence[endSquare-1].y, slideSpeed);
				break;
			}
		}
		if(!sliding){
			resetTurn();
			togglePlayer();
		}
	}
}

const showWinner = () => {
	setPlayerID('is the winner!');
	resetGameBtn.classList.remove('hidden');
}

const setPlayerID = (msg='') => {
	playerDisplay.innerHTML = `${activePlayer.id} ${msg}`;
	message.innerHTML = "Click dice to play";
	document.body.classList = `player${activePlayer.id}`;
}

const resetTurn = () => {
	setLocked(false);
}

const slide = (element, dX, dY, dur=1) => {
	gsap.to(element, {x:dX, y:dY, duration:dur, delay: 0.25, onUpdate:doOnUpdate, onComplete:doOnComplete});
}
const doOnUpdate = () => {
	drawPlayers();
}
const doOnComplete = () => {
	activePlayer.current = activePlayer.target;
	drawPlayers();
	resetTurn();
	togglePlayer();
}

const togglePlayer = () => {
	activePlayer = activePlayer.id === player1.id ? player2 : player1;
	setPlayerID();
	
	if(activePlayer === player2){
		rollDice();
	}
}

const rollDice = (evt) => {
	if(evt) evt.preventDefault();
	if (locked) return;
	setLocked(true);
	
	message.innerHTML = activePlayer === player1 ? "Rolling..." : 'Auto rolling...';
	
	rollCount = 0;
	rollMax = Math.random()*10 + 15;
	rolling = setInterval(doRoll, rollSpeed);
}

const doRoll = () => {
	rolled = Math.floor(Math.random() * 6 + 1);
	diceRollDisplay(rolled);
	if(rollCount++ >= rollMax){
		clearInterval(rolling);
		message.innerHTML = "Moving...";
		activePlayer.target += rolled;
		walking = setInterval(walk, walkSpeed);
	}
}

const diceRollDisplay = (spots) => {
	diceDisplay.classList = `s${spots}`
}

const resetGame = () => {
	player1.current = 0;
	player1.target = 0;
	player1.x = 0;
	player1.y = 0;
	player2.current = 0;
	player2.target = 0;
	player2.x = 0;
	player2.y = 0;
	activePlayer = player1;
	locked = false;
	diceRollDisplay('');
	setPlayerID();
	
	drawPlayers();
	
	resetGameBtn.classList.add('hidden');
}

diceDisplay.addEventListener('click', rollDice);
resetGameBtn.addEventListener('click', resetGame);

let walkSequence = boustrophedonWalk(10, 10);
setPlayerID();

// Test method to show obstacles
const drawObstacles = () => {
	ctx.clearRect(0, 0, width, height);
	for(let i=0; i < obstacles.length; i++){
		let ob = obstacles[i];
		ctx.strokeStyle = ob.type === 'snake' ? '#d00' : '#0d0';
		ctx.beginPath();
		ctx.moveTo(walkSequence[ob.start-1].x+gridSize*.5, walkSequence[ob.start-1].y+gridSize*.5);
		ctx.lineTo(walkSequence[ob.end-1].x+gridSize*.5, walkSequence[ob.end-1].y+gridSize*.5);
		ctx.stroke();
		ctx.closePath();
	}
}
// drawObstacles();