import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { codeBlock, inlineCode, italic } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { oneLine, oneLineCommaLists, stripIndents } from 'common-tags';
import { reply } from '@sapphire/plugin-editable-commands';
import { addGamePlayers, componentPublicNameInlineCode, shuffle } from '#lib/utils';
import gameData from '#game-data/i-guess-this-is-it';
import type { Args } from '@sapphire/framework';
import type { GuildMember, Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'IGuessThisIsIt',
	aliases: ['i-guess-this-is-it', 'igtii'],
	description: 'A two-player game about saying goodbye.'
})
export class IGuessThisIsItCommand extends Command {
	/**
	 * Example command:
	 *	@BOTNAME IGuessThisIsIt [GAMEID] ACTION [PLAYERS] [OPTIONS]
	 */
	public override async messageRun(message: Message, args: Args) {
		this.container.logger.info(message.content);
		// const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');
		const players = await args.repeat('member').catch(() => [message.member]);

		if (gameData.private.base.storyCards.length !== 16) {
			return reply(message, `:thumbsdown: I Guess This Is It does not have 16 base Story cards defined.`);
		}

		switch (action) {
			case 'start': {
				return this.start(message, players);
			}
		}

		return null;
	}

	/**
	 * Example command:
	 *	@BOTNAME IGuessThisIsIt start @PLAYER1 @PLAYER2
	 */
	public async start(message: Message, players: (GuildMember | null)[]) {
		const relationship = shuffle(shuffle(gameData.public.relationships).shift());
		const reasonForSayingGoodbye = shuffle(gameData.public.reasonsForSayingGoodbye).shift();
		const location = shuffle(gameData.public.locations).shift();
		const deck = shuffle(gameData.private.base.storyCards);
		players = shuffle(players);

		if (players.length !== 2) {
			return reply(message, `:thumbsdown: I Guess This Is It requires two players: ${inlineCode('IGTII start @PLAYER1 @PLAYER2')}.`);
		}

		const state = {
			current: {},
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

		const createGame = await this.container.prisma.game.create({
			data: {
				guildId: message.guildId!,
				channelId: message.channelId!,
				authorUserId: message.author.id,
				message: message.content,
				command: 'i-guess-this-is-it',
				waitingOnUserId: state.starting.players[0].id,
				state: JSON.stringify(state)
			}
		});

		await addGamePlayers(createGame.id, players);

		const embed = new MessageEmbed()
			.setColor('#d8d2cd')
			.setTitle(`I Guess This Is It (#${createGame.id})`)
			.setThumbnail('https://github.com/morbus/button-shy-games-play-bot/raw/main/docs/assets/i-guess-this-is-it--cover.png')
			.setDescription(italic(`@TODO HELP`))
			.addField(
				state.starting.players[0].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.starting.players[0].relationship} saying
					goodbye because ${state.starting.players[0].reasonForSayingGoodbye}.
					Your starting hand is ${oneLineCommaLists`${componentPublicNameInlineCode(state.starting.players[0].hand)}`}.
				`}`,
				true
			)
			.addField(
				state.starting.players[1].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.starting.players[1].relationship} who is staying.
					Your starting hand is ${oneLineCommaLists`${componentPublicNameInlineCode(state.starting.players[1].hand)}`}.
				`}`,
				true
			)
			.addField('Location', state.starting.location, true)
			.addField(
				'Grid',
				codeBlock(
					stripIndents`
						ABC  DEF  GHI
						ABC  DEF  GHI
						ABC  DEF  GHI
						ABC  DEF  GHI
					`
				),
				true
			)
			.addField('Goodbye pile', 'Contains ...', true);

		return reply(message, { content: `<@${state.starting.players[0].id}> <@${state.starting.players[1].id}>`, embeds: [embed] });
	}
}
