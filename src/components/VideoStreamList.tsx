import React from "react"
import VideoStream, { VideoProps } from "./VideoStream"
import Stack from "react-bootstrap/Stack"


export interface VideoStreamListData {
    listData: VideoProps[]
}

export default function VideoStreamList(props: VideoStreamListData) {

    return (<>
        <Stack gap={3}>
            {props.listData.map((vid) => {
                return (
                    <VideoStream id={vid.id} isMain={vid.isMain} key={vid.id}/>
                )
            })}
        </Stack>
    </>)
}