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
	 * Master router for all "IGuessThisIsIt" actions.
	 *
	 *  Example command:
	 *    @BOTNAME IGuessThisIsIt [GAMEID] ACTION [PLAYERS] [OPTIONS]
	 */
	public override async messageRun(message: Message, args: Args) {
		this.container.logger.info(message.content);
		const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');
		const players = await args.repeat('member').catch(() => [message.member]);

		if (gameData.private.storyCards.length < 16) {
			return reply(message, `:thumbsdown: I Guess This Is It does not have 16 Story cards defined.`);
		}

		switch (action) {
			case 'start': {
				return this.start(message, players, gameId);
			}

			case 'reroll': {
				return this.reroll(message, players, gameId);
			}
		}

		return null;
	}

	/**
	 * Start a game.
	 *
	 * Example commands:
	 *   @BOTNAME IGuessThisIsIt start @PLAYER1 @PLAYER2
	 *
	 * @see reroll()
	 */
	public async start(message: Message, players: (GuildMember | null)[], gameId: number) {
		const command = `${this.container.client.options.defaultPrefix}igtii`;
		const relationship = shuffle(shuffle(gameData.public.relationships).shift());
		const reasonForSayingGoodbye = shuffle(gameData.public.reasonsForSayingGoodbye).shift();
		const location = shuffle(gameData.public.locations).shift();
		const deck = shuffle(gameData.private.storyCards);
		players = shuffle(players);

		if (players.length !== 2) {
			return gameId === 0
				? reply(message, `:thumbsdown: I Guess This Is It requires two players: \`${command} start @PLAYER1 @PLAYER2\`.`)
				: reply(message, `:thumbsdown: I Guess This Is It requires two players: \`${command} ${gameId} reroll @PLAYER1 @PLAYER2\`.`);
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

		const createGame = await this.container.prisma.game.upsert({
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
		await removeGamePlayers(createGame.id);
		await addGamePlayers(createGame.id, players);

		const embed = new MessageEmbed()
			.setColor('#d8d2cd')
			.setTitle(`I Guess This Is It (#${createGame.id})`)
			.setThumbnail('https://github.com/morbus/button-shy-games-play-bot/raw/main/docs/assets/i-guess-this-is-it--cover.png')
			.setDescription(
				stripIndents`${oneLine`
					*Game setup is complete. Story cards are identified by their first few letters.
					If the randomized prompts create an uncomfortable or unwanted setup, reroll with
					\`${command} ${createGame.id} reroll @PLAYER1 @PLAYER2\`.
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
			.addField(
				'Grid',
				codeBlock(
					stripIndents`
						${state.grid[3].publicName}  ${state.grid[4].publicName}  ${state.grid[11].publicName}
						${state.grid[2].publicName}  ${state.grid[5].publicName}  ${state.grid[10].publicName}
						${state.grid[1].publicName}  ${state.grid[6].publicName}  ${state.grid[9].publicName}
						${state.grid[0].publicName}  ${state.grid[7].publicName}  ${state.grid[8].publicName}
					`
				),
				true
			)
			.addField('Goodbye pile', `${oneLineCommaLists`${componentNames(state.goodbyePile)}`}`, true)
			.addField(
				`${state.players[0].displayName}, it is your turn!`,
				stripIndents`${oneLine`Draw 1 or 2 Story cards from the grid with \`${command} ${createGame.id} draw NUMBER\`.`}`
			);
		return reply(message, { content: `<@${state.players[0].id}> <@${state.players[1].id}>`, embeds: [embed] });
	}

	/**
	 * Reroll (regenerate, re-setup, etc.) an already-setup game.
	 *
	 * This is all handled by start() when given a non-zero gameId.
	 *
	 * Example commands:
	 *   @BOTNAME IGuessThisIsIt GAMEID reroll @PLAYER1 @PLAYER2
	 *
	 * @see start()
	 */
	public async reroll(message: Message, players: (GuildMember | null)[], gameId: number) {
		const command = `${this.container.client.options.defaultPrefix}IGTII`;

		if (gameId === 0) {
			return reply(message, `:thumbsdown: I Guess This Is It \`reroll\` requires a game ID: \`${command} GAMEID reroll @PLAYER1 @PLAYER2\`.`);
		}

		return this.start(message, players, gameId);
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
