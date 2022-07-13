import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'ping',
	description: 'Display bot and API latency.'
})
export class PingCommand extends Command {
	/**
	 * Example command:
	 *   @BOTNAME ping
	 */
	public override async messageRun(message: Message) {
		const msg = await send(message, 'Ping?');

		const content = `Pong! Bot latency ${Math.round(this.container.client.ws.ping)}ms. API latency ${
			(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
		}ms.`;

		return send(message, content);
	}
}
