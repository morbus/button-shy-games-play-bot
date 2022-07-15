/**
 * Returns an array of game component public names.
 */
export function componentNames(components: any[], inlineCode = true): string[] {
	return components.map((component) => {
		return inlineCode ? `\`${component.publicName}\`` : component.publicName;
	});
}
