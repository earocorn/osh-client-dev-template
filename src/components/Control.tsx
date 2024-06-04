import React, { ReactElement } from "react";
import Card from "react-bootstrap/Card";
import { Command } from "../models/Command";
import Stack from "react-bootstrap/Stack";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form"

interface ControlProps {
    title: string,
    command: Command,
    option: ReactElement
}

export default function Control(props: ControlProps) {

    return (<>
        <Card className="w-50 text-center">
            <Card.Header>{props.title}</Card.Header>
            <Card.Body>
                <Stack direction="horizontal">
                    {props.option}
                    <Container className="w-50" style={{ display:"flex", justifyContent:"end"}}>
                        <ListGroup>
                            {props.command.commandItems.map((cmd) => {
                                return (
                                <ListGroup.Item>
                                    <InputGroup size="sm" key={cmd.name}>
                                        <InputGroup.Text>{cmd.name}</InputGroup.Text>
                                        <Form.Control placeholder="0" type="number"/>
                                    </InputGroup>
                                </ListGroup.Item>)
                            })}
                        </ListGroup>
                    </Container>
                </Stack>
            </Card.Body>
        </Card>
    </>)
}