import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { inlineCode, italic } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { oneLine, oneLineInlineLists, stripIndents } from 'common-tags';
import { reply } from '@sapphire/plugin-editable-commands';
import { addGamePlayers, shuffle } from '#lib/utils';
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
		this.container.logger.debug(message.content);
		// const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');
		const players = await args.repeat('member').catch(() => [message.member]);

		// @todo Check for private data definitions.

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
		players = shuffle(players);

		if (players.length !== 2) {
			return reply(message, `:x: I Guess This Is It requires two players: ${inlineCode('IGTII start @PLAYER1 @PLAYER2')}.`);
		}

		const state = {
			initial: {
				location,
				players: [
					{
						id: players[0]!.id,
						displayName: players[0]!.displayName,
						relationship: relationship.shift(),
						reasonForSayingGoodbye
					},
					{
						id: players[1]!.id,
						displayName: players[1]!.displayName,
						relationship: relationship.shift()
					}
				]
			}
		};

		const createGame = await this.container.prisma.game.create({
			data: {
				guildId: message.guildId!,
				channelId: message.channelId!,
				authorUserId: message.author.id,
				message: message.content,
				command: 'i-guess-this-is-it',
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
				state.initial.players[0].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.initial.players[0].relationship} saying
					goodbye because ${state.initial.players[0].reasonForSayingGoodbye}.
				`}`,
				true
			)
			.addField(
				state.initial.players[1].displayName,
				stripIndents`${oneLine`
					Roleplay as ${state.initial.players[1].relationship} who is staying.
				`}`,
				true
			)
			.addField('Location', location, true);

		return reply(message, { content: oneLineInlineLists`${players}`, embeds: [embed] });
	}
}
