/*
 * Copyright (c) 2024.  Botts Innovative Research, Inc.
 * All Rights Reserved
 *
 * opensensorhub/osh-viewer is licensed under the
 *
 * Mozilla Public License 2.0
 * Permissions of this weak copyleft license are conditioned on making available source code of licensed
 * files and modifications of those files under the same license (or in certain cases, one of the GNU licenses).
 * Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
 * However, a larger work using the licensed work may be distributed under different terms and without
 * source code for files added in the larger work.
 *
 */

import './App.css'
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Cartesian3, Ion, SceneMode, Terrain, } from "@cesium/engine";
import "@cesium/engine/Source/Widget/CesiumWidget.css";
import CesiumView from "osh-js/source/core/ui/view/map/CesiumView.js";
import DataSynchronizer from 'osh-js/source/core/timesync/DataSynchronizer';
import { Mode } from "osh-js/source/core/datasource/Mode";
import PointMarkerLayer from "osh-js/source/core/ui/layer/PointMarkerLayer";
import PolygonLayer from "osh-js/source/core/ui/layer/PolygonLayer";
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import VideoDataLayer from "osh-js/source/core/ui/layer/VideoDataLayer";
import DataLayer from "osh-js/source/core/ui/layer/DataLayer";
import VideoView from "osh-js/source/core/ui/view/video/VideoView";
import Systems from "osh-js/source/core/sweapi/system/Systems.js";
import DataStreams from "osh-js/source/core/sweapi/datastream/DataStreams.js"
import DataStream from "osh-js/source/core/sweapi/datastream/DataStream.js"
import ObservationFilter from "osh-js/source/core/sweapi/observation/ObservationFilter.js"
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Badge from 'react-bootstrap/Badge';
import ControllerData from './ControllerData';
import UniversalControllerOutput, { ComponentRecord, GamepadRecord } from './UniversalControllerOutput';
import PTZCop from './components/PTZCop';

export default function App() {
    const start = useMemo(() => new Date((Date.now() - 600000)).toISOString(), []);
    const end = "2024-12-31T23:59:59Z";

    const [host, setHost] = useState("localhost");
    const server = `${host}:8181/sensorhub/api`;

    let [datastream, setDatastream] = useState([]);
    const [currentSystemId, setCurrentSystemId] = useState('');
    const [controllerDatastreamId, setControllerDatastreamId] = useState('');
    const [sensors, setSensors] = useState([]);
    const [controllerOutput, setControllerOutput] = useState<UniversalControllerOutput | any>(null);

    const networkProperties = {
        endpointUrl: server,
        tls: false,
        connectorOpts: {
            username: 'admin',
            password: 'admin',
        }
    }

    const systems = new Systems(networkProperties);
    const datastreams = new DataStreams(networkProperties);

    async function populateUniversalControllerID() {
        let systemsCollection = await systems.searchSystems();
        let pageData = await systemsCollection.page(0);
        if(pageData instanceof Array) {
            // Get each system. need to check if system is universalcontroller
            // check if sys.properties.uid = urn:osh:sensor:universalcontroller
            let newSensors: any[] = [];
            pageData.map((sys) => newSensors.push(sys.properties));
            setSensors(newSensors);
            let output = ""
            sensors.map((sensor) => {
                output += JSON.stringify(sensor);
            });
        }
    }

    async function stopStreaming() {
        if(datastream !== null && datastream !== undefined) {
            datastream.map((ds) => ds.stream().disconnect());
        }
        setControllerOutput(null);
    }

    async function populateSensorData() {
        if(currentSystemId != '') {
            const sensorSystem = await systems.getSystemById(currentSystemId);
            const sensorDatastreamsCollection = await sensorSystem.searchDataStreams();
            const sensorDatastreamInfo = await sensorDatastreamsCollection.page(0);
            if(sensorDatastreamInfo instanceof Array) {
                const dsID = sensorDatastreamInfo[0].properties.id;
                setControllerDatastreamId(dsID);
                const sensorDatastream = await datastreams.getDataStreamById(dsID);
                await sensorDatastream.streamObservations(new ObservationFilter(), 
                (datablock: any) => {
                    const result = datablock[0].result;
                    let gamepads: GamepadRecord[] = [];
                    if(result.gamepads instanceof Array) {
                        result.gamepads.map((rec: GamepadRecord) => {
                            const gamepad: GamepadRecord = {
                                gamepadName: rec.gamepadName,
                                isPrimaryController: rec.isPrimaryController,
                                numComponents: rec.numComponents,
                                gamepadComponents: rec.gamepadComponents,
                            };
                            gamepads.push(gamepad);
                        })
                    }
                    const output: UniversalControllerOutput = {
                        primaryControlStreamIndex: result.primaryControlStreamIndex,
                        numControlStreams: result.numControlStreams,
                        primaryControllerIndex: result.primaryControllerIndex,
                        numGamepads: result.numGamepads,
                        gamepads: gamepads,
                    };

                    setControllerOutput(output);
                });
                datastream.push(sensorDatastream);
                console.log(controllerOutput)
            }
        }
    }

    async function searchNode() {
        console.log('searching')
        populateUniversalControllerID();
    }

    useEffect(() => {
            (async () => {

            })()
    }, [currentSystemId])

    const controllerDataSource = useMemo(() => new SweApi("Universal Controller", {
        protocol: "wss",
        endpointUrl: server,
        resource: `/datastreams/${controllerDatastreamId}/observations`,
        startTime: start,
        endTime: end,
        mode: Mode.REPLAY, 
        tls: false,
    }), [controllerDatastreamId]);

    const controllerDataLayer = useMemo(() => new DataLayer({
            dataSourceId: [controllerDataSource.getId()],
        }), [controllerDataSource]);

    const masterTimeController = useMemo(() => new DataSynchronizer({
        replaySpeed: 1,
        intervalRate: 5,
        dataSources: [controllerDataSource]
    }), [controllerDataSource]);

    // if(controllerDatastreamId != '') {
    //     masterTimeController.connect();
    // }

    //  * Bounded Draping Layer
    //  * 
    //  * @remarks This layer will be used by the Cesium view to display the UAV's field of regard.
    //  */
    // const boundedDrapingLayer = useMemo(() => new PolygonLayer({
    //     opacity: .5,
    //     getVertices: {
    //         dataSourceIds: [uavForDataSource.getId()],
    //         handler: function (rec: any) {
    //             return [
    //                 rec.geoRef.ulc.lon,
    //                 rec.geoRef.ulc.lat,
    //                 rec.geoRef.llc.lon,
    //                 rec.geoRef.llc.lat,
    //                 rec.geoRef.lrc.lon,
    //                 rec.geoRef.lrc.lat,
    //                 rec.geoRef.urc.lon,
    //                 rec.geoRef.urc.lat,
    //             ];
    //         }
    //     },
    // }), [uavForDataSource]);

    // /**
    //  * UAV Video Data Layer
    //  * 
    //  * @remarks This layer will be used by the video view to display the UAV's video stream.
    //  */
    // const videoDataLayer = useMemo(() => new VideoDataLayer({
    //     dataSourceId: [uavVideoDataSource.getId()],
    //     getFrameData: (rec: any) => {
    //         return rec.img
    //     },
    //     getTimestamp: (rec: any) => {
    //         return rec.timestamp
    //     }
    // }), [uavVideoDataSource]);
    // //#endregion

    // /**
    //  * Master Time Controller
    //  * 
    //  * @remarks This object will synchronize all the data sources and control the replay speed.
    //  */

    // // Set the marker ID and description for the UAV point marker
    // useEffect(() => {
    //     uavPointMarker.props.markerId = "UAV UAS";
    //     uavPointMarker.props.description = "UAV UAS";
    // }, [uavPointMarker])

    // // Create the video view with the UAV video data layer
    // useEffect(() => {
    //     const videoView = new VideoView({
    //         container: videoContainer.current.id,
    //         css: 'video-h264',
    //         name: "UAV Video",
    //         framerate: 25,
    //         showTime: false,
    //         showStats: false,
    //         layers: [videoDataLayer]
    //     });
    // }, [])

    // // Create the Cesium view with the UAV point marker and bounded draping layers
    // useEffect(() => {
    //     const cesiumView = new CesiumView({
    //         container: cesiumContainer.current.id,
    //         layers: [uavPointMarker, boundedDrapingLayer],
    //         options: {
    //             viewerProps: {
    //                 terrain: Terrain.fromWorldTerrain(),
    //                 sceneMode: SceneMode.SCENE3D,
    //                 // infoBox: false,
    //                 // geocoder: false,
    //                 timeline: false,
    //                 animation: false,
    //                 homeButton: false,
    //                 scene3DOnly: true,
    //                 // baseLayerPicker: false,
    //                 // sceneModePicker: false,
    //                 fullscreenButton: false,
    //                 // projectionPicker: false,
    //                 // selectionIndicator: false,
    //                 navigationHelpButton: true,
    //                 navigationInstructionsInitiallyVisible: true
    //             }
    //         }
    //     });

    //     // Set the imagery and terrain providers
    //     const baseLayerPicker = cesiumView.viewer.baseLayerPicker;

    //     const imageryProviders = baseLayerPicker.viewModel.imageryProviderViewModels;
    //     baseLayerPicker.viewModel.selectedImagery =
    //         imageryProviders.find((imageProviders: any) => imageProviders.name === "Bing Maps Aerial");

    //     const terrainProviders = baseLayerPicker.viewModel.terrainProviderViewModels;
    //     baseLayerPicker.viewModel.selectedTerrain =
    //         terrainProviders.find((terrainProviders: any) => terrainProviders.name === "Cesium World Terrain");

    //     // Center the camera on the UAV
    //     cesiumView.viewer.camera.flyTo({
    //         destination: Cartesian3.fromDegrees(-86.67128902952935, 34.70690480206765, 10000)
    //     });
    // }, [])

    // // Start streaming
    // useEffect(() => {
    //     masterTimeController.connect();
    // }, [])

    return (
    <>
    <div>
        <InputGroup className='d-flex w-50 m-3 pt-3'>
            <InputGroup.Text>Remote host</InputGroup.Text>
            <Form.Control 
            value={host}
            onChange={(e) => {setHost(e.target.value)}}
            />
            <Button variant="outline-secondary"
            onClick={() => searchNode()}>
                Search
            </Button>
        </InputGroup>

        <InputGroup className='d-flex w-50 m-3'>
            <Dropdown>
                <Dropdown.Toggle variant={sensors.length == 0 ? 'secondary' : 'success'} id="dropdown-basic">
                    Universal Controller Datasource
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {sensors.map((sensor) => {
                        return (
                        <Dropdown.Item key={sensor.id} onClick={async () => {
                            await stopStreaming();
                            setCurrentSystemId(sensor.id);
                            populateSensorData();
                            console.log(JSON.stringify(sensor.id))
                            }}>
                            {sensor.properties.uid}
                        </Dropdown.Item>)
                    })}
                </Dropdown.Menu>
            </Dropdown>
            <Badge bg={sensors.length == 0 ? 'secondary' : 'success'}>{sensors.length} Found</Badge>
        </InputGroup>

        {controllerOutput != null && (<>
            <ControllerData 
            primaryControlStreamIndex={controllerOutput.primaryControlStreamIndex} 
            numControlStreams={controllerOutput.numControlStreams} 
            primaryControllerIndex={controllerOutput.primaryControllerIndex} 
            numGamepads={controllerOutput.numGamepads} 
            gamepads={controllerOutput.gamepads}/>
        </>)}

            <Button onClick={() => {stopStreaming()}}>stop streaming</Button>
        
        
        Current System = {currentSystemId}
    </div>
    <PTZCop/>
    </>
    );
};