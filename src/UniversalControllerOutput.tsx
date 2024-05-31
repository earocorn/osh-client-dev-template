export interface ComponentRecord {
    componentName: string,
    componentValue: number,
}

export interface GamepadRecord {
    gamepadName: string,
    isPrimaryController: boolean,
    numComponents: number,
    gamepadComponents: ComponentRecord[],
}

export default interface UniversalControllerOutput {
    primaryControlStreamIndex: number,
    numControlStreams: number,
    primaryControllerIndex: number,
    numGamepads: number,
    gamepads: GamepadRecord[],
}