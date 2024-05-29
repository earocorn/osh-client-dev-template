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
import VideoView from "osh-js/source/core/ui/view/video/VideoView";
import Systems from "osh-js/source/core/sweapi/system/Systems.js";

export default function App() {
    // A Cesium Ion access token can be obtained for free from https://ion.cesium.com/.
    // Do not commit your access token to a public repository.
    // Ion.defaultAccessToken = '';

    const [host, setHost] = useState("localhost");
    const server = `${host}:8181/sensorhub/api`;

    const [data, setData] = useState('');

    const systems = new Systems({
        endpointUrl: server,
        tls: false,
        connectorOpts: {
            username: 'admin',
            password: 'admin',
        }
    });

    async function populateUniversalControllerID() {
        let systemsCollection = await systems.searchSystems();
        let pageData = await systemsCollection.page(0);
        if(pageData instanceof Array) {
            // Get each system. need to check if system is universalcontroller
            // check if sys.properties.uid = urn:osh:sensor:universalcontroller
            pageData.map((sys) => console.log("SYSTEM : " + JSON.stringify(sys.properties)))
        }
        setData(JSON.stringify(pageData[0].properties))
    }

    useEffect(() => {
            (async () => {
                populateUniversalControllerID();
                console.log("useEffect: " + JSON.stringify(await (await systems.searchSystems()).page(0)));
        })()
    }, [])

    // const start = useMemo(() => new Date((Date.now() - 600000)).toISOString(), []);
    // const end = "2024-12-31T23:59:59Z";
    // const secure = true;
    // const locationInfoDsId = "o7pce3e60s0ie";
    // const attitudeInfoDsId = "mlme3gtdfepvc";
    // const videoDsId = "h225hesual08g";
    // const fovDsId = "iabpf1ivua1qm";


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
    // const masterTimeController = useMemo(() => new DataSynchronizer({
    //     replaySpeed: 1,
    //     intervalRate: 5,
    //     dataSources: dataSources
    // }), [dataSources]);

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

    console.log("system data : " + data)

    return (
        <div id="">
            data = {data}
        </div>
    );
};