import _gameData from '#game-data/i-guess-this-is-it';
import { componentNames } from '#lib/components';
import { addGamePlayers, isValidGameUser, removeGamePlayers } from '#lib/database';
import { playersToMentions, shuffle } from '#lib/utils';
import { codeBlock, hyperlink } from '@discordjs/builders';
import type { Game } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Command, CommandOptions } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { oneLine, oneLineCommaLists, stripIndents } from 'common-tags';
import type { GuildMember, Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';

const gameData: IGuessThisIsItGameData = _gameData;

@ApplyOptions<CommandOptions>({
	name: 'IGuessThisIsIt',
	aliases: ['i-guess-this-is-it', 'igtii'],
	description: 'A two-player game about saying goodbye.'
})
export class IGuessThisIsItCommand extends Command {
	/**
	 * The shortest command with the default bot prefix.
	 */
	public command = `${this.container.client.options.defaultPrefix}igtii`;

	/**
	 * Master router for all I Guess This Is It actions.
	 *
	 *  Example command:
	 *    %igtii [GAMEID] ACTION [PLAYERS] [OPTIONS]
	 */
	public override async messageRun(message: Message, args: Args): Promise<Message> {
		this.container.logger.info(message.content);
		const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');
		const game = await this.container.prisma.game.findUnique({ where: { id: gameId } });

		if (gameData.private.storyCards.length < 16) {
			return reply(message, `I Guess This Is It does not have 16 Story cards defined.`);
		}

		if (game === null && action !== 'start' && action !== 'help') {
			return reply(message, `I Guess This Is It \`${action}\` requires a valid game ID: \`${this.command} GAMEID ${action} [OPTIONS]\`.`);
		}

		if (game !== null && game.command !== 'i-guess-this-is-ist') {
			return reply(message, `Game ID #${gameId} does not belong to I Guess This Is It.`);
		}

		if (game !== null && !isValidGameUser(game, message.member!.id)) {
			return reply(message, `Only valid owners or players may interact with this game.`);
		}

		switch (action) {
			case 'start':
			case 'reroll': {
				const players = await args.repeat('member').catch(() => [message.member]);
				return this.start(game, players, message);
			}

			case 'draw': {
				const numberToDraw = await args.pick('number').catch(() => 1);
				return this.draw(game!, numberToDraw, message);
			}
		}

		return reply(message, `See ${process.env.README_I_GUESS_THIS_IS_IT}`);
	}

	/**
	 * Start a game.
	 *
	 * Example commands:
	 *   %igtii start @PLAYER1 @PLAYER2
	 *
	 * @see reroll()
	 */
	public async start(game: Game | null, players: (GuildMember | null)[], message: Message): Promise<Message> {
		const relationship = shuffle(shuffle(gameData.public.relationships).shift());
		const reasonForSayingGoodbye = shuffle(gameData.public.reasonsForSayingGoodbye).shift();
		const location = shuffle(gameData.public.locations).shift();
		const deck = shuffle(gameData.private.storyCards);
		players = shuffle(players);

		if (players.length !== 2) {
			return game === null
				? reply(message, `I Guess This Is It requires two players: \`${this.command} start @PLAYER1 @PLAYER2\`.`)
				: reply(message, `I Guess This Is It requires two players: \`${this.command} ${game.id} reroll @PLAYER1 @PLAYER2\`.`);
		}

		if (game !== null) {
			const state: IGuessThisIsItGameState = JSON.parse(game.state);
			if (!state.canReroll) {
				return reply(message, 'This game has already started and can no longer be rerolled.');
			}
		}

		const state: IGuessThisIsItGameState = {
			canReroll: true,
			turn: 1,
			step: 1,
			players: [
				{
					id: players[0]!.id,
					relationship: relationship.shift(),
					reasonForSayingGoodbye,
					hand: [deck.shift()]
				},
				{
					id: players[1]!.id,
					relationship: relationship.shift(),
					hand: [deck.shift()]
				}
			],
			logs: [],
			location,
			grid: deck.splice(0, 12),
			goodbyePile: deck.splice(0, 2)
		};

		game = await this.container.prisma.game.upsert({
			where: { id: game ? game.id : 0 },
			update: {
				currentPlayerId: state.players[0].id,
				state: JSON.stringify(state)
			},
			create: {
				guildId: message.guildId!,
				channelId: message.channelId!,
				authorId: message.author.id,
				message: message.content,
				command: 'i-guess-this-is-it',
				currentPlayerId: state.players[0].id,
				state: JSON.stringify(state)
			}
		});

		// Rerolls might change players.
		await removeGamePlayers(game);
		await addGamePlayers(game, players);

		const embed = this.embedStarter(game)
			.setDescription(
				stripIndents`${oneLine`
					*Game setup is complete. Story cards are identified by their first few letters.
					If the randomized prompts create an uncomfortable or unwanted setup, reroll with
					\`${this.command} ${game.id} reroll @PLAYER1 @PLAYER2\`.
					${hyperlink('Read more »', process.env.README_I_GUESS_THIS_IS_IT!)}*
				`}`
			)
			.addField(
				players[0]!.displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.players[0].relationship} saying
					goodbye because ${state.players[0].reasonForSayingGoodbye}.
					Your hand contains ${oneLineCommaLists`${componentNames(state.players[0].hand)}`}.
				`}`,
				true
			)
			.addField(
				players[1]!.displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.players[1].relationship} who is staying.
					Your hand contains ${oneLineCommaLists`${componentNames(state.players[1].hand)}`}.
				`}`,
				true
			)
			.addField('Location', state.location, true)
			.addField('Grid', this.renderGrid(state), true)
			.addField('Goodbye pile (`bye`)', oneLineCommaLists`${componentNames(state.goodbyePile)}`, true)
			.addField(
				`${players[0]!.displayName}, it is your turn!`,
				`Draw 1 or 2 Story cards from the grid with \`${this.command} ${game.id} draw NUMBER\`.`
			);

		return reply(message, { content: oneLineCommaLists`${playersToMentions(state.players)}`, embeds: [embed] });
	}

	/**
	 * Draw 1 or 2 Story cards from the grid.
	 *
	 * Example commands:
	 *   %igtii GAMEID draw NUMBER
	 */
	public async draw(game: Game, numberToDraw: number, message: Message): Promise<Message> {
		if (numberToDraw < 1 || numberToDraw > 2) {
			return reply(message, 'Players may only draw 1 or 2 Story cards from the grid.');
		}

		if (game.currentPlayerId !== message.author.id) {
			return reply(message, `It is <@${game.currentPlayerId}>'s turn. Patience, human!`);
		}

		const state: IGuessThisIsItGameState = JSON.parse(game.state);

		if (state.step !== 1) {
			return reply(message, `The current turn is on step ${state.step}, not step 1.`);
		}

		state.logs.push({
			turn: state.turn,
			step: 1,
			created: message.createdTimestamp,
			authorId: message.author.id,
			message: message.content
		});

		state.canReroll = false; // A turn has started, so no more rerolls.
		state.step = 2; // After drawing comes step 2: play a Story card.

		// Move 1 or 2 Story cards from the grid to the player's hand.
		const playerIndex = state.players.findIndex((player: IGuessThisIsItPlayer) => (player.id = message.author.id));
		const drawnCards = state.grid.splice(0, numberToDraw);
		state.players[playerIndex].hand.push(...drawnCards);

		// Save game state without changing the current player.
		game = await this.container.prisma.game.update({ where: { id: game.id }, data: { state: JSON.stringify(state) } });

		const embed = this.embedStarter(game)
			.setDescription(
				stripIndents`${oneLine`
					*${message.member!.displayName} drew ${oneLineCommaLists`${componentNames(drawnCards)}`}
					from the grid into their hand (${oneLineCommaLists`${componentNames(state.players[playerIndex].hand)}`}).
					That completes the draw step of this turn. ${hyperlink('Read more »', process.env.README_I_GUESS_THIS_IS_IT!)}*
				`}`
			)
			.addField('Grid', this.renderGrid(state), true)
			.addField('Goodbye pile (`bye`)', oneLineCommaLists`${componentNames(state.goodbyePile)}`, true)
			.addField(
				`${message.member!.displayName}, it is still your turn!`,
				stripIndents`${oneLine`
					Play a Story card with \`${this.command} ${game.id} play CARD on LINKTYPE\`
					where \`LINKTYPE\` is one of  \`memory\`, \`wish\`, \`apology\`, or \`recognition\`.
					Note that I am unable to tell if Story cards are overlapping (2.3) and can't
					rewind the game if a mistake has been made. Be careful, human!
				`}`
			);

		return reply(message, { content: oneLineCommaLists`${playersToMentions(state.players)}`, embeds: [embed] });
	}

	/**
	 * Start a game embed with the proper image, title, and color.
	 *
	 * Example commands:
	 *   %igtii GAMEID draw NUMBER
	 */
	public embedStarter(game: Game): MessageEmbed {
		return new MessageEmbed()
			.setColor('#d8d2cd')
			.setTitle(`I Guess This Is It (#${game.id})`)
			.setThumbnail('https://github.com/morbus/button-shy-games-play-bot/raw/main/docs/assets/i-guess-this-is-it--cover.png');
	}

	/**
	 * Render a 12-cell grid with Story cards, spaces, and a Goodbye pile.
	 */
	public renderGrid(state: IGuessThisIsItGameState): string {
		let constructedGrid;

		// 12 Story cards is a new game.
		if (state.grid.length === 12) {
			constructedGrid = state.grid;
		} else {
			// Construct a grid with spaces for drawn cards and the goodbye pile.
			// const goodbyePilePosition = Math.abs(-12 + (state.goodbyePile.length - 2));
			// const storyCardsAndGoodbye = state.grid.length + (state.goodbyePile.length - 2);
			const storyCardsDrawnFromGrid = 12 - state.grid.length;

			// Fill the grid with empty spaces for drawn cards...
			constructedGrid = Array(storyCardsDrawnFromGrid).fill({ publicName: '···' });

			// then the remaining Story cards...
			constructedGrid.push(...state.grid);

			// @todo then the Goodbye pile...

			// @todo and then any empty spaces behind the Goodbye pile.
			// constructedGrid.fill({ publicName: '···' }, constructedGrid.length, 11);
		}

		return codeBlock(
			stripIndents`
				${constructedGrid[3].publicName}  ${constructedGrid[4].publicName}  ${constructedGrid[11].publicName}
				${constructedGrid[2].publicName}  ${constructedGrid[5].publicName}  ${constructedGrid[10].publicName}
				${constructedGrid[1].publicName}  ${constructedGrid[6].publicName}  ${constructedGrid[9].publicName}
				${constructedGrid[0].publicName}  ${constructedGrid[7].publicName}  ${constructedGrid[8].publicName}
			`
		);
	}
}

/**
 * I Guess This Is It game data.
 */
export interface IGuessThisIsItGameData {
	/**
	 * Private game data that should never be distributed.
	 */
	readonly private: {
		readonly __WARNING__: string;

		/**
		 * The story card components.
		 */
		readonly storyCards: IGuessThisIsItStoryCardComponent[];
	};
	/**
	 * Private game data that can be distributed.
	 */
	readonly public: {
		/**
		 * Relationship types for each player, formatted to fit into
		 * "Roleplay as [relationship] saying goodbye because [reason]".
		 */
		readonly relationships: string[][];

		/**
		 * Reasons the players are saying goodbye, formatted to fit into
		 * "Roleplay as [relationship] saying goodbye because [reason]".
		 */
		readonly reasonsForSayingGoodbye: string[];

		/**
		 * Locations where the goodbye is taking place.
		 */
		readonly locations: string[];
	};
}

/**
 * I Guess This Is It game state.
 */
export interface IGuessThisIsItGameState {
	/**
	 * A boolean indicating whether the game can be rerolled.
	 */
	canReroll: boolean;

	/**
	 * The turn number.
	 */
	turn: number;

	/**
	 * The step number of the current turn.
	 */
	step: number;

	/**
	 * The players and their play data.
	 */
	players: IGuessThisIsItPlayer[];

	/**
	 * Log entries that players can read to refresh their memories.
	 */
	logs: [
		{
			/**
			 * The turn number when this log was created.
			 */
			turn: number;

			/**
			 * The step number of the turn when this log was created.
			 */
			step: number;

			/**
			 * The timestamp of the message that created this log.
			 */
			created: number;

			/**
			 * The unique ID of the Discord user who sent the message.
			 */
			authorId: string;

			/**
			 * The authorId's Discord message that created this log entry.
			 */
			message: string;
		}?
	];

	/**
	 * The location where the goodbye is taking place.
	 */
	location: string;

	/**
	 * The grid of story card components.
	 */
	grid: IGuessThisIsItStoryCardComponent[];

	/**
	 * The goodbye pile of story card components.
	 */
	goodbyePile: IGuessThisIsItStoryCardComponent[];
}

/**
 * I Guess This Is It player data.
 */
export interface IGuessThisIsItPlayer {
	/**
	 * The unique ID of a Discord user.
	 */
	id: string;

	/**
	 * The relationship type of the player.
	 */
	relationship: string;

	/**
	 * The reason why this player character is saying goodbye.
	 */
	reasonForSayingGoodbye?: string;

	/**
	 * Story card component the player has in hand.
	 */
	hand: IGuessThisIsItStoryCardComponent[];
}

/**
 * I Guess This Is It story card game component.
 */
export interface IGuessThisIsItStoryCardComponent {
	/**
	 * The unique ID of the component.
	 */
	readonly id: string;

	/**
	 * The core or expansion set ID this component belongs to.
	 */
	readonly setId: string;

	/**
	 * The public name that represents this component.
	 */
	readonly publicName: string;

	/**
	 * The private name that represents this component.
	 */
	readonly privateName: string;

	/**
	 * The link type on the top of the story card.
	 */
	readonly top: string;

	/**
	 * The link type on the right of the story card.
	 */
	readonly right: string;

	/**
	 * The link type on the bottom of the story card.
	 */
	readonly bottom: string;

	/**
	 * The link type on the left of the story card.
	 */
	readonly left: string;
}
