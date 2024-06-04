import React from "react"
import Container from 'react-bootstrap/Container'
import Stack from 'react-bootstrap/Stack';
import ControlCard from "./ControlCard";
import VideoStream, { VideoProps } from "./VideoStream";
import VideoStreamList, { VideoStreamListData } from "./VideoStreamList";

export default function PTZCop() {

    

    const listData: VideoProps[] = [
        {id: "source1",
        isMain: false},
        {id: "source2",
        isMain: false},
        {id: "source3",
        isMain: false},
        {id: "source4",
        isMain: false},
    ]

    return (<>
    <Container className="border border-3 p-3 m-3">
        <h3 className="text-center m-3" style={{ fontWeight: "bold"}}>PTZ Dashboard</h3>
        <hr />
        <Stack gap={3}>
            <Stack direction="horizontal" gap={3}>
                <VideoStreamList listData={listData}/>
                <VideoStream id={"mainstream"} isMain={true}/>
            </Stack>
                <ControlCard/>
        </Stack>
    </Container>
    </>)
}