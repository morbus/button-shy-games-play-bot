import _gameData from '#game-data/i-guess-this-is-it';
import { componentNames } from '#lib/components';
import { addGamePlayers, removeGamePlayers } from '#lib/database';
import { shuffle } from '#lib/utils';
import { codeBlock, hyperlink } from '@discordjs/builders';
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
	 * Master router for all I Guess This Is It actions.
	 *
	 *  Example command:
	 *    %igtii [GAMEID] ACTION [PLAYERS] [OPTIONS]
	 */
	public override async messageRun(message: Message, args: Args): Promise<Message> {
		this.container.logger.info(message.content);
		const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');
		const players = await args.repeat('member').catch(() => [message.member]);

		if (gameData.private.storyCards.length < 16) {
			return reply(message, `I Guess This Is It does not have 16 Story cards defined.`);
		}

		switch (action) {
			case 'start': {
				return this.start(gameId, players, message);
			}

			case 'reroll': {
				return this.reroll(gameId, players, message);
			}

			case 'draw': {
				const numberToDraw = await args.pick('number').catch(() => 1);
				return this.draw(gameId, numberToDraw, message);
			}
		}

		return reply(message, `See ${process.env.README_I_GUESS_THIS_IS_IT!}`);
	}

	/**
	 * Start a game.
	 *
	 * Example commands:
	 *   %igtii start @PLAYER1 @PLAYER2
	 *
	 * @see reroll()
	 */
	public async start(gameId: number, players: (GuildMember | null)[], message: Message): Promise<Message> {
		const command = `${this.container.client.options.defaultPrefix}igtii`;
		const relationship = shuffle(shuffle(gameData.public.relationships).shift());
		const reasonForSayingGoodbye = shuffle(gameData.public.reasonsForSayingGoodbye).shift();
		const location = shuffle(gameData.public.locations).shift();
		const deck = shuffle(gameData.private.storyCards);
		players = shuffle(players);

		if (players.length !== 2) {
			return gameId === 0
				? reply(message, `I Guess This Is It requires two players: \`${command} start @PLAYER1 @PLAYER2\`.`)
				: reply(message, `I Guess This Is It requires two players: \`${command} ${gameId} reroll @PLAYER1 @PLAYER2\`.`);
		}

		const state: IGuessThisIsItState = {
			location,
			players: [
				{
					id: players[0]!.id,
					displayName: players[0]!.displayName,
					relationship: relationship.shift(),
					reasonForSayingGoodbye,
					hand: [deck.shift()]
				},
				{
					id: players[1]!.id,
					displayName: players[1]!.displayName,
					relationship: relationship.shift(),
					hand: [deck.shift()]
				}
			],
			grid: deck.splice(0, 12),
			goodbyePile: deck.splice(0, 2)
		};

		const game = await this.container.prisma.game.upsert({
			where: { id: gameId },
			update: {
				waitingOnUserId: state.players[0].id,
				state: JSON.stringify(state)
			},
			create: {
				guildId: message.guildId!,
				channelId: message.channelId!,
				authorUserId: message.author.id,
				message: message.content,
				command: 'i-guess-this-is-it',
				waitingOnUserId: state.players[0].id,
				state: JSON.stringify(state)
			}
		});

		// Rerolls might change the players.
		await removeGamePlayers(game);
		await addGamePlayers(game, players);

		const embed = new MessageEmbed()
			.setColor('#d8d2cd')
			.setTitle(`I Guess This Is It (#${game.id})`)
			.setThumbnail('https://github.com/morbus/button-shy-games-play-bot/raw/main/docs/assets/i-guess-this-is-it--cover.png')
			.setDescription(
				stripIndents`${oneLine`
					*Game setup is complete. Story cards are identified by their first few letters.
					If the randomized prompts create an uncomfortable or unwanted setup, reroll with
					\`${command} ${game.id} reroll @PLAYER1 @PLAYER2\`.
					${hyperlink('Read more »', process.env.README_I_GUESS_THIS_IS_IT!)}*
				`}`
			)
			.addField(
				state.players[0].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.players[0].relationship} saying
					goodbye because ${state.players[0].reasonForSayingGoodbye}.
					Your starting hand is ${oneLineCommaLists`${componentNames(state.players[0].hand)}`}.
				`}`,
				true
			)
			.addField(
				state.players[1].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.players[1].relationship} who is staying.
					Your starting hand is ${oneLineCommaLists`${componentNames(state.players[1].hand)}`}.
				`}`,
				true
			)
			.addField('Location', state.location, true)
			.addField('Grid', this.renderGrid(state), true)
			.addField('Goodbye pile', `${oneLineCommaLists`${componentNames(state.goodbyePile)}`}`, true)
			.addField(
				`${state.players[0].displayName}, it is your turn!`,
				stripIndents`${oneLine`Draw 1 or 2 Story cards from the grid with \`${command} ${game.id} draw NUMBER\`.`}`
			);
		return reply(message, { content: `<@${state.players[0].id}> <@${state.players[1].id}>`, embeds: [embed] });
	}

	/**
	 * Reroll (regenerate, re-setup, etc.) an already-setup game.
	 *
	 * This is all handled by start() when given a non-zero gameId.
	 *
	 * Example commands:
	 *   %igtii GAMEID reroll @PLAYER1 @PLAYER2
	 *
	 * @see start()
	 */
	public async reroll(gameId: number, players: (GuildMember | null)[], message: Message): Promise<Message> {
		const command = `${this.container.client.options.defaultPrefix}igtii`;

		if (gameId === 0) {
			return reply(message, `I Guess This Is It \`reroll\` requires a game ID: \`${command} GAMEID reroll @PLAYER1 @PLAYER2\`.`);
		}

		return this.start(gameId, players, message);
	}

	/**
	 * Draw 1 or 2 Story cards from the grid.
	 *
	 * Example commands:
	 *   %igtii GAMEID draw NUMBER
	 */
	public async draw(gameId: number, numberToDraw: number, message: Message): Promise<Message> {
		console.dir(gameId);
		console.dir(numberToDraw);
		console.dir(message);
		return reply(message, 'inside draw');
	}

	/**
	 * Render a 12-cell grid with Story cards, spaces, and a Goodbye pile.
	 */
	public renderGrid(state: IGuessThisIsItState): string {
		let constructedGrid: IGuessThisIsItStoryCardComponent[] | { publicName: string }[] = [];

		// 12 Story cards is a new game.
		if (state.grid.length === 12) {
			constructedGrid = state.grid;
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
export interface IGuessThisIsItState {
	/**
	 * The location where the goodbye is taking place.
	 */
	location: string;

	/**
	 * The players and their play data.
	 */
	players: {
		/**
		 * The unique ID of a Discord user.
		 */
		id: string;

		/**
		 * The display name of a Discord user.
		 */
		displayName: string;

		/**
		 * The relationship type of the player.
		 */
		relationship: string;

		/**
		 * The reason why this player character is saying goodbye.
		 */
		reasonForSayingGoodbye?: string;

		/**
		 * Story card component IDs the player has in hand.
		 */
		hand: IGuessThisIsItStoryCardComponent[];
	}[];

	/**
	 * The grid of story card component IDs or empty spaces.
	 */
	grid: IGuessThisIsItStoryCardComponent[];

	/**
	 * The goodbye pile of story card component IDs.
	 */
	goodbyePile: IGuessThisIsItStoryCardComponent[];
}
