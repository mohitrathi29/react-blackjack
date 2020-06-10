import React from 'react';
import GameSetup from './GameSetup.jsx';
import Hand from './Hand.jsx';

class Game extends React.Component {
	constructor() {
		super();

		this.state = {
			deck: [],
			winner: '',
			players: {
				player: {
					name: 'You',
					hand: {
						'cards': [],
						'total': 0
					}
				},
				computer: {
					name: 'Dealer',
					hand: {
						'cards': [],
						'total': 0
					}
				}
			}
		};

	}

	// Generate the deck
	createDeck() {
		let generatedDeck = [];

		for ( let i = 1; i <= 4; i++ ) {
			for ( let x = 1; x <= 13; x++ ) {
				generatedDeck.push(
					{
						number: x,
						suit: i
					}
				);
			}
		}

		this.state.deck = generatedDeck;
		this.setState({deck: this.state.deck});
	}

	// Restore hand scores back to 0
	resetHands() {
		for ( let player in this.state.players ) {
			this.state.players[player].hand = {
				'cards': [],
				'total': 0
			};
		}
	}

	// Starts the game
	startGame() {
		this.resetHands();
		this.createDeck();

		// Deals the starting cards
		this.addCard('player', 2);
		this.addCard('computer', 1, true);
		this.addCard('computer', 1);
	}

	componentDidMount() {
		this.startGame();
	}

	// Adds a card to a specific hand
	addCard( hand, quantity = 1, hidden = false ) {
		for ( let i = 0; i < quantity; i++ ) {
			// Select a rnadom card from the deck
			let randomNumber = Math.floor((Math.random() * this.state.deck.length - 1) + 1);

			// remove the card from the deck
			let card = this.state.deck.splice( randomNumber, 1 );

			// Add the card to the player's hand
			card.hidden = hidden;
			this.state.players[hand].hand.cards.push(card);
			this.setState({ deck: this.state.deck });
			this.setState({ players: this.state.players });

		}

		// Set the new value of the hand
		this.getHandValue(hand);
	}

	// Gets the value/score of a card
	getCardValue(number) {
		if ( number == 11 || number == 12 || number == 13 ) {
			// Face cards are worth 10
			return 10;
		} else if ( number == 1 ) {
			// Aces are worth 11 or 1, set to 11 for now
			return 11;
		} else {
			return number;
		}
	}

	// Gets the total value for a hand
	getHandValue(hand) {
		let aces = 0;

		// Retrive the card values for each card & count the aces
		let values = this.state.players[hand].hand.cards.map(function(item) {
			if (item[0]) {
				let number = item[0].number;

				if ( this.getCardValue(number) == 11 ) {
					aces++;
				}

				return this.getCardValue(number);
			}

		}.bind(this));

		// Add the card values together to get the hand value
		let total = values.reduce((first, second) => first + second, 0);

		// If we have an ace, check if 1 would be better than 11
		while( aces > 0 ) {
			aces--;

			if ( total > 21 ) {
				total -= 10;
			}
		}

		// Update the hand total in state
		this.state.players[hand].hand.total = total;
		this.setState({players: this.state.players});
	}

	// Handles Hit button
	handleHit() {
		this.addCard('player');

		let playerTotal = this.state.players.player.hand.total; 

		// Hit Win logic
		if ( playerTotal == 21 ) {
			this.setState({winner: 'player'});
			this.revealDealer();
		} else if ( playerTotal > 21 ) {
			this.setState({winner: 'computer'});
			this.revealDealer();
		}
	}

	// Handles Stand button
	handleStand() {
		let playerTotal = this.state.players.player.hand.total, 
			computerTotal = this.state.players.computer.hand.total; 

		// Continues to deal for itself while the card value is < 17
		while ( computerTotal < 17 ) {
			this.addCard('computer');
			computerTotal = this.state.players.computer.hand.total; 
		}

		// Stand win logic
		if ( computerTotal > 21 ) {
			this.setState({winner: 'player'});
		} else if ( computerTotal < 21  && computerTotal < playerTotal ) {
			this.setState({winner: 'player'});
		} else if ( computerTotal <= 21 && playerTotal == computerTotal ) {
			this.setState({winner: 'draw'});
		} else if ( playerTotal < 21 && playerTotal < computerTotal ) {
			this.setState({winner: 'computer'});
		}

		this.revealDealer();
	}

	// Restarts the game
	handleRestart() {
		this.setState({winner: ''});
		this.startGame();
	}

	// Shows dealer's hidden card
	revealDealer() {
		this.state.players.computer.hand.cards.forEach(function(card){
			card.hidden = false;
		});

		this.setState({players: this.state.players});
	}

	// Sets the player's name in state
	setPlayerName(playerName) {
		this.state.players.player.name = playerName;
		this.setState({players: this.state.players});
	}

	render() {
		let winBox,
			playerTotal = this.state.players.player.hand.total,
			computerTotal = this.state.players.computer.hand.total; 

		// When we have a winner, show dealer score and winner name
		if ( this.state.winner != '' ) {
			let winText;

			if ( this.state.winner == 'draw' ) {
				winText = 'Game was a draw!';
			} else {
				winText = this.state.players[this.state.winner].name + ' wins!';
			}

			winBox = (
				<div>
					<h3>{this.state.players.computer.name}</h3> {this.state.players.computer.hand.total}
					<div className="game__scores__win-text">{winText}</div>
				</div>
			);
		}

		// If the player hasn't entered a name, show the setup screen
		if ( this.state.players.player.name == 'You' ) {
			return <GameSetup setPlayerName={this.setPlayerName.bind(this)} />;
		} else {
			return (
				<div>
					<div className="game">
						<div className="game__hands">
							<Hand cards={this.state.players.computer.hand.cards} title={this.state.players.computer.name} />
							<Hand cards={this.state.players.player.hand.cards} title={this.state.players.player.name}/>
						</div>
						<div className="game__scores">
							<h2>Scores</h2>
							<h3>{this.state.players.player.name}</h3> {this.state.players.player.hand.total}
							{winBox}
						</div>
						<div className="game__controls">
							<button onClick={this.handleRestart.bind(this)}>Restart</button>
							<button onClick={this.handleHit.bind(this)} disabled={this.state.winner != ''}>Hit</button>
							<button onClick={this.handleStand.bind(this)} disabled={this.state.winner != ''}>Stand</button>
						</div>
					</div>
				</div>
			);
		}
	}
}

export default Game;
