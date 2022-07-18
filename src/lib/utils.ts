/**
 * Turn an array of players into an array of user mentions.
 */
export function playersToMentions(players: any[]): string[] {
	return players.map((player) => `<@${player.id}>`);
}

/**
 * Shuffle an array using the Durstenfeld algorithm, based on Fisher–Yates.
 *
 * Copied from https://github.com/sindresorhus/array-shuffle so we needn't
 * deal with "[ERR_REQUIRE_ESM]: require() of ES Module is not supported".
 */
export function shuffle(array: any[]): any[] {
	array = [...array];

	for (let index = array.length - 1; index > 0; index--) {
		const newIndex = Math.floor(Math.random() * (index + 1));
		[array[index], array[newIndex]] = [array[newIndex], array[index]];
	}

	return array;
}
