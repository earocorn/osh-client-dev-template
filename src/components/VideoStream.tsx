import React from "react";
import Container from "react-bootstrap/Container"

export interface VideoProps {
    id: string,
    isMain: boolean
}

export default function VideoStream(props: VideoProps) {
    
    return (<>
    <Container className={`bg bg-black ${props.isMain ? "xl" : "xs"}`} style={ props.isMain ? { width:720, height:368, color:"black" } : { width:160, height:80, color:"black"} } id={props.id}>
        
    </Container>
    </>)
}