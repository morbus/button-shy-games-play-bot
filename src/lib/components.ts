/**
 * Returns an array of game component IDs.
 */
export function componentIds(components: any[]): string[] {
	return components.map((componentId) => componentId.id);
}

/**
 * Returns an array of component public names from their IDs.
 */
export function componentNames(componentIds: string[], componentData: any[], inlineCode = true): any[] {
	return componentIds.map((componentId) => {
		const component = componentData.find(({ id }) => id === componentId);
		return inlineCode ? `\`${component.publicName}\`` : component.publicName;
	});
}
