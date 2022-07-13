import gameData from '#game-data/i-guess-this-is-it';
import { addGamePlayers, removeGamePlayers } from '#lib/database';
import { componentsNameInlineCode, shuffle } from '#lib/utils';
import { codeBlock, hyperlink } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Command, CommandOptions } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { oneLine, oneLineCommaLists, stripIndents } from 'common-tags';
import type { GuildMember, Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';

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

		if (gameData.private.base.storyCards.length !== 16) {
			return reply(message, `:thumbsdown: I Guess This Is It does not have 16 base Story cards defined.`);
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
		const command = `${this.container.client.options.defaultPrefix}IGTII`;
		const relationship = shuffle(shuffle(gameData.public.relationships).shift());
		const reasonForSayingGoodbye = shuffle(gameData.public.reasonsForSayingGoodbye).shift();
		const location = shuffle(gameData.public.locations).shift();
		const deck = shuffle(gameData.private.base.storyCards);
		players = shuffle(players);

		if (players.length !== 2) {
			return gameId === 0
				? reply(message, `:thumbsdown: I Guess This Is It requires two players: \`${command} start @PLAYER1 @PLAYER2\`.`)
				: reply(message, `:thumbsdown: I Guess This Is It requires two players: \`${command} ${gameId} reroll @PLAYER1 @PLAYER2\`.`);
		}

		const state: Record<string, any> = {
			starting: {
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
				goodbyePile: deck
			}
		};

		// "starting" state allows duplicates of the game later.
		// "current" state always represents the in-progress game state.
		state.current = state.starting;

		const createGame = await this.container.prisma.game.upsert({
			where: { id: gameId },
			update: {
				waitingOnUserId: state.starting.players[0].id,
				state: JSON.stringify(state)
			},
			create: {
				guildId: message.guildId!,
				channelId: message.channelId!,
				authorUserId: message.author.id,
				message: message.content,
				command: 'i-guess-this-is-it',
				waitingOnUserId: state.starting.players[0].id,
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
					*Game setup is complete. Story cards are identified by their first three letters.
					If the randomized prompts create an uncomfortable or unwanted setup, reroll with
					\`${command} ${createGame.id} reroll @PLAYER1 @PLAYER2\`.
					${hyperlink('Read more »', process.env.README_I_GUESS_THIS_IS_IT!)}*
				`}`
			)
			.addField(
				state.starting.players[0].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.starting.players[0].relationship} saying
					goodbye because ${state.starting.players[0].reasonForSayingGoodbye}.
					Your starting hand is ${oneLineCommaLists`${componentsNameInlineCode(state.starting.players[0].hand)}`}.
				`}`,
				true
			)
			.addField(
				state.starting.players[1].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.starting.players[1].relationship} who is staying.
					Your starting hand is ${oneLineCommaLists`${componentsNameInlineCode(state.starting.players[1].hand)}`}.
				`}`,
				true
			)
			.addField('Location', state.starting.location, true)
			.addField(
				'Grid',
				codeBlock(
					stripIndents`
						${state.starting.grid[3].publicName}  ${state.starting.grid[4].publicName}  ${state.starting.grid[11].publicName}
						${state.starting.grid[2].publicName}  ${state.starting.grid[5].publicName}  ${state.starting.grid[10].publicName}
						${state.starting.grid[1].publicName}  ${state.starting.grid[6].publicName}  ${state.starting.grid[9].publicName}
						${state.starting.grid[0].publicName}  ${state.starting.grid[7].publicName}  ${state.starting.grid[8].publicName} 
					`
				),
				true
			)
			.addField('Goodbye pile', `${oneLineCommaLists`${componentsNameInlineCode(state.starting.goodbyePile)}`}`, true);

		return reply(message, { content: `<@${state.starting.players[0].id}> <@${state.starting.players[1].id}>`, embeds: [embed] });
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
