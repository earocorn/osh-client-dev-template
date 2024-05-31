import React from "react"
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import UniversalControllerOutput from "./UniversalControllerOutput";

export default function ControllerData(props: UniversalControllerOutput) {

    return (<>
        <Card className="d-flex m-3" style={{ width: '18rem' }}>
            <ListGroup variant="flush">
                <ListGroup.Item># of Control Streams : {props.numControlStreams}</ListGroup.Item>
                <ListGroup.Item>Primary Control Stream : {props.primaryControlStreamIndex}</ListGroup.Item>
                <ListGroup.Item># of Controllers : {props.numGamepads}</ListGroup.Item>
                <ListGroup.Item>Primary Controller : {props.primaryControllerIndex}</ListGroup.Item>
            </ListGroup>
        </Card>
    </>)
}