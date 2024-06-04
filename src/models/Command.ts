
export interface Command {
    commandItems: CommandItem[],
}

export interface CommandItem {
    name: string,
    value: number,
}