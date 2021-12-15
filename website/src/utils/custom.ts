const CUSTOM_IDENTIFIER = "custom=";

export function appendCustomIdentifier(moduleCode: string): string {
    return `${CUSTOM_IDENTIFIER}${moduleCode}`;
}

export function removeCustomIdentifier(customModuleCode: string): string {
    return customModuleCode.replace(CUSTOM_IDENTIFIER, '');
}
