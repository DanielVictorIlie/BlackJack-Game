const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const suits = ["C", "D", "H", "S"]

let allDecks = [];
let dealerHand = [];
let playerHand = [];
let balance = 0;
let firstPlayerCards;
let firstDealerCards;
let firstDealerCard;
let bet = 0;
let totalBet = 0;
let lastWin = 0;
let numberOfDecks;
let firstRound = false;

const cardModel = document.createElement('img');
cardModel.classList.add('card');

const dealer = document.getElementById("dealer");
const dealerTotal = document.getElementById("dealer-total");
const player = document.getElementById("player");
const playerTotal = document.getElementById("player-total");
const hit = document.getElementById("hit");
const doubleDownBtn = document.getElementById("double-down");
const pass = document.getElementById("pass");
const buttonContainer = document.getElementById("button-container");
const notice = document.getElementById("notice");
const nextHand = document.getElementById("next-hand");
const betBtns = document.querySelectorAll("button.bet");
const addMoneyBtn = document.getElementById("add-money");
const infoNoticeDiv = document.getElementById("info-notice");
const balanceDisplay = document.getElementById("balance");
const totalBetDisplay = document.getElementById("total-bet");
const lastWinDisplay = document.getElementById("last-win");
const winningDisplay = document.getElementById("conclusion-text");
let text = `
<div id='welcome'>
<h5 >Welcome to the BlackJack table!</h5>
<h5 >Please place your bets to start the game.</h5>
<h5 >Good Luck!</h5>
</div>
`;
let message = '';

const balanceFromLocalStorage = JSON.parse(localStorage.getItem('balance'));

const createDeck = () => {
    const deck = [];
    suits.forEach((suit) => {
        values.forEach((value) => {
            const card = value + '-' + suit;
            deck.push(card)
        })
    })
    return deck;
}

const shuffleDecks = (num) => {
    for (let i = 0; i < num; i++) {
        const newDeck = createDeck();
        allDecks = [...allDecks, ...newDeck];
        numberOfDecks = num * 52;
    }
}

const chooseRandomCard = () => {
    const totalCards = allDecks.length;
    let randomNumber = Math.floor(Math.random() * totalCards);
    const randomCard = allDecks[randomNumber];
    allDecks.splice(randomNumber, 1)
    return randomCard;
}
const showNotice = (text) => {
    totalBet = 0;
    showBalanceAndBet(balance, totalBet);
    winningDisplay.innerHTML = text;
    winningDisplay.style.display = "flex";
    notice.style.display = "flex";
    buttonContainer.style.display = "none";
    totalBetDisplay.style.display = "none";
}

const infoFadeAway = (text) => {
    infoNoticeDiv.style.display = "flex";
    infoNoticeDiv.innerHTML = text;
    setTimeout(() => infoNoticeDiv.style.display = "none", '4000')
}

const showScore = (playerScore, dealerScore) => {
    playerTotal.innerHTML = ' Player Hand: ' + playerScore;
    dealerTotal.innerHTML = ' Dealer Hand: ' + dealerScore;
}
const showBalanceAndBet = (balanceShow, totalBetShow) => {
    balanceDisplay.innerHTML = ' Balance : $' + balanceShow;
    totalBetDisplay.innerHTML = 'Bet : $' + totalBetShow;
}
const dealHandsAndCheckScore = async () => {

    dealerHand = [await chooseRandomCard(), await chooseRandomCard()];
    playerHand = [await chooseRandomCard(), await chooseRandomCard()];
    firstRound = true;
    firstPlayerCards = await calcHandValue(playerHand)
    firstDealerCards = await calcHandValue(dealerHand)
    firstDealerCard = await calcHandValue([dealerHand[1]])
    showScore(firstPlayerCards, firstDealerCard)
    if (firstPlayerCards === 21 || (firstDealerCards === 21 && dealerHand[1].includes('A'))) {
        determineWinner()
    }
    return { dealerHand, playerHand, firstPlayerCards, firstDealerCards, firstDealerCard }

}

const calcHandValue = async (hand) => {
    let value = 0;
    let hasAce = 0;
    hand.forEach((card) => {
        let data = card.split("-");
        let cardValue = data[0];
        if (cardValue === 'A') {
            value += 11;
            hasAce += 1;
        } else if (isNaN(cardValue)) value += 10;
        else value += Number(cardValue);
    })
    while (value > 21 && hasAce > 0) {
        value -= 10;
        hasAce -= 1;
    }
    return value;
}

const determineWinner = async () => {
    let playerValue = await calcHandValue(playerHand);
    let dealerValue = await calcHandValue(dealerHand);
    if (firstPlayerCards === 21 && firstDealerCards !== 21) {
        text = `BlackJack! You Win $${((totalBet * 2) + (totalBet / 2))}`
        balance += (totalBet * 2) + (totalBet / 2);
        lastWin = (totalBet * 2) + (totalBet / 2);
    } else if (firstDealerCards === 21 && firstPlayerCards !== 21) {
        text = 'Better Luck Next Round!';
    } else if (playerValue > 21) {
        text = 'Better Luck in the Next Round!';
    } else if (dealerValue > 21) {
        text = `You Win! $${totalBet * 2}`;
        balance += (totalBet * 2);
        lastWin = (totalBet * 2);
    } else if (playerValue === dealerValue) {
        text = 'Push!';
        balance += totalBet;
        lastWin = totalBet;
    } else if (playerValue < dealerValue) {
        text = 'Better Luck in the Next Round!';
    } else {
        text = `You Win! $${totalBet * 2}`;
        balance += (totalBet * 2);
        lastWin = (totalBet * 2)
    }
    lastWinDisplay.innerHTML = 'Last Win: $' + lastWin
    localStorage.setItem('balance', JSON.stringify(balance));
    showScore(playerValue, dealerValue);
    showDealerHiddenCard();
    showNotice(text);
}
const showDealerHiddenCard = () => {
    const hiddenCard = dealer.children[0];
    hiddenCard.classList.remove('back');
    hiddenCard.src = "./cards/" + dealerHand[0] + ".png";
}
const hitDealer = async () => {
    showDealerHiddenCard();
    const handValue = await calcHandValue(dealerHand);

    if (handValue < 17) {
        const card = await chooseRandomCard();
        dealerHand.push(card)
        const newCard = cardModel.cloneNode(true);
        newCard.src = "./cards/" + card + ".png";
        dealer.append(newCard);
        hitDealer();
    } else {
        determineWinner();
    }
}

const hitPlayer = async () => {
    doubleDownBtn.style.display = 'none';
    const card = await chooseRandomCard();
    playerHand.push(card);
    const newCard = cardModel.cloneNode(true);
    newCard.src = "./cards/" + card + ".png";
    newCard.classList.add('cards');
    player.append(newCard);
    let handValue = await calcHandValue(playerHand);
    if (handValue < 21) {

    } else if (handValue > 21) {
        determineWinner();
    } else {
        hitDealer()
    }
    showScore(handValue, firstDealerCard)
}

const doubleDownPlayer = async () => {
    if ((balance >= (totalBet * 2)) && playerHand.length === 2) {
        balance -= totalBet;
        totalBet *= 2;
        const card = await chooseRandomCard();
        playerHand.push(card);
        const newCard = cardModel.cloneNode(true);
        newCard.src = "./cards/" + card + ".png";
        player.append(newCard);
        let handValue = await calcHandValue(playerHand);
        handValue > 21 ? determineWinner() : hitDealer();
        showScore(handValue, '')
    } else if (playerHand.length > 2) {
        infoFadeAway("Dowble Down it's posible only in initial hand!");
    } else {
        infoFadeAway('Insuficient founds to Double Down');
    }
}

const clearHands = () => {
    while (dealer.children.length > 0) {
        dealer.children[0].remove()
    }
    while (player.children.length > 0) {
        player.children[0].remove()
    }
    showScore('', '')
    return true;
}

const play = async () => {
    if (allDecks.length <= (numberOfDecks / 2)) {
        allDecks = [];
        shuffleDecks(6);
        infoFadeAway('We just changed the shoe!')
    }
    balance <= 50 ? addMoneyBtn.style.display = "flex" : addMoneyBtn.style.display = 'none';

    if (bet > 0) {
        clearHands()
        bet = 0;
        const { dealerHand, playerHand } = await dealHandsAndCheckScore();
        dealerHand.forEach((card, index) => {
            const newCard = cardModel.cloneNode(true);
            index === 0 ? newCard.classList.add('back') : newCard.src = "./cards/" + card + ".png";
            dealer.append(newCard);
        })
        playerHand.forEach((card) => {
            const newCard = cardModel.cloneNode(true);
            newCard.src = "./cards/" + card + ".png";
            player.append(newCard);
        })
        winningDisplay.style.display = "none";
        notice.style.display = "none";
        buttonContainer.style.display = "flex";
        doubleDownBtn.style.display = 'flex';
    }
}


const placeBet = (evt) => {
    bet = +evt.target.innerHTML.replace('$', '');
    if (balance > 0 && bet <= balance) {
        balance -= bet;
        totalBet += bet;
        if (firstRound === false) {
            winningDisplay.style.display = "flex";
            totalBetDisplay.style.display = 'flex';
        } else {
            winningDisplay.style.display = "none";
            totalBetDisplay.style.display = 'flex';
        }
    } else if (bet > balance && balance > 0) {
        totalBet += balance;
        balance = 0;
    } else {
        totalBet > 0 ? totalBet : bet = 0;
        infoFadeAway('Not enough money!')
    }
    showBalanceAndBet(balance, totalBet);
    return { bet, balance, totalBet }
}

const checkLocalStorageBalance = () => {
    if (balanceFromLocalStorage) {
        balance = balanceFromLocalStorage;
        play();
    } else {
        balance = 5000;
        play();
    }
    return showBalanceAndBet(balance, '0');

}

const addMoney = () => {
    balance += 10000
    return showBalanceAndBet(balance, totalBet);

}

for (i of betBtns) {
    i.addEventListener('click', placeBet)
}

const noticeToPlaceBet = () => {
    infoFadeAway('Please place your bets first!')
}

hit.addEventListener('click', hitPlayer);
doubleDownBtn.addEventListener('click', doubleDownPlayer);
addMoneyBtn.addEventListener('click', addMoney);
pass.addEventListener('click', hitDealer);
nextHand.addEventListener('click', play);
nextHand.addEventListener('dblclick', noticeToPlaceBet);

showNotice(text)
shuffleDecks(6)
checkLocalStorageBalance()