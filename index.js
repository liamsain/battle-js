//
// var jsStr = 'alert('hi');console.log('what')
// var f = new Function(jsStr)
// f()
//var func = new Function("return " + "function (obj) { console.log(obj) }")();

// roundData: { round: 1, previousGuesses: [17, 18, 18, 20] }
let previousGuesses = [];
let guesses = [];
let round = 1;
const maxRounds = 100;
const roundIntervalLength = 1000;

console.clear();
const executeLiam = roundData => {
  return 20;
};

const executeFlipBot = roundData => {
  if (roundData.round % 2 == 0) {
    return 20;
  } else {
    return 19;
  }
}
const executeRandomBot = () => {
  return Math.floor(Math.random() * 20) + 1;
};
const players = [
  {
    name: 'liam',
    execute: executeLiam,
    points: 0,
    guess: 0
  },
  {
    name: 'flip bot',
    execute: executeFlipBot,
    points: 0,
    guess: 0
  },
  {
    name: 'rando bot',
    execute: executeRandomBot,
    points: 0,
    guess: 0
  },
  {
    name: 'sniper bot',
    execute: roundData => {
      const prevHighest = Math.max(...roundData.previousGuesses);
      return prevHighest
    },
    points: 0,
    guess: 0
  }
];

function playRound(roundNumber) {
  let roundGuesses = players.forEach(p => {
    const guess = p.execute({
      round: roundNumber,
      previousGuesses
    })
    if (guess > 0 && guess <= 21) {
      guesses.push(guess);
      p.guess = guess;
    }
  });
  players.forEach(p => {
    const sameNumber = guesses.filter(x => x === p.guess);
    if (sameNumber.length === 1) {
      p.points += p.guess;
    }
  });
  previousGuesses = guesses;
  guesses = [];
}

let myInterval = setInterval(() => {
  console.clear();
  playRound(round);
  console.log(`=== Round ${round}/${maxRounds} ===`);
  console.log(players.sort((a, b) => b.points - a.points).map(p => `${p.name}: ${p.points}`).join('\n'))
  round += 1;
  if (round > maxRounds) {
    clearInterval(myInterval);
  }
}, roundIntervalLength)


