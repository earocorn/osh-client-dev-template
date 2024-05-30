import React from "react"
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

interface UniversalControllerOutput {
    primaryControlStreamIndex: number,
    numControlStreams: number,
    primaryControllerIndex: number,
    numGamepads: number,
    gamepads: any[],
}

export default function ControllerData(props: UniversalControllerOutput) {

    return (<>
        <Card className="d-flex m-3" style={{ width: '18rem' }}>
            <ListGroup variant="flush">
                <ListGroup.Item>Cras justo odio</ListGroup.Item>
                <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
                <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
            </ListGroup>
        </Card>
    </>)
}