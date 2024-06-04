import React from "react";
import Control from "./Control";
import { Command } from "../models/Command";
import Stack from "react-bootstrap/Stack";


export default function ControlCard() {

    const ptzCommand: Command = {
        commandItems: [
            {name: "Pan", value: 0},
            {name: "Tilt", value: 0},
            {name: "Zoom", value: 0},
        ]
    }

    const llaCommand: Command = {
        commandItems: [
            {name: "Lat", value: 0},
            {name: "Long", value: 0},
            {name: "Alt", value: 0},
        ]
    }
    
    return (
    <Stack className="" direction="horizontal" gap={3}>
        <Control title={"Location"} command={llaCommand} option={<>LLA SOURCE, blah other stuff</>}/>
        <Control title={"Direct"} command={ptzCommand} option={<>Joystick</>}/>
    </Stack>
    )
}