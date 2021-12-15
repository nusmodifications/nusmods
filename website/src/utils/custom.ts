import { Module } from "types/modules";

const CUSTOM_IDENTIFIER = "custom=";

export function appendCustomIdentifier(moduleCode: string): string {
    return `${CUSTOM_IDENTIFIER}${moduleCode}`;
}

export function removeCustomIdentifier(customModuleCode: string): string {
    return customModuleCode.replace(CUSTOM_IDENTIFIER, '');
}

export function cretaeCustomModule(customModuleCode: string, title: string): Module {
    return {
        moduleCode: customModuleCode, 
        title: title, 
        isCustom: true,
        acadYear: '',
        moduleCredit: '0',
        department: '',
        faculty: '',
        semesterData: [],
        timestamp: 0,
    }
}
