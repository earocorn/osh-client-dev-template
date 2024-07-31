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
import {EventType} from 'osh-js/source/core/event/EventType'

export default function App() {
    const start = useMemo(() => new Date((Date.now() - 600000000)).toISOString(), []);
    const end = "2024-12-31T23:59:59Z";

    const [host, setHost] = useState("192.168.1.126");
    const server = `${host}:8282/sensorhub/api`;

    let [datastream, setDatastream] = useState([]);
    const [systemID, setSystemID] = useState('');
    const [datastreamID, setDatastreamID] = useState('ltcm1utn2mndo');

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

    

    useEffect(() => {
            (async () => {

            })()
    }, [])

    const datasource = new SweApi("Universal Controller", {
        protocol: "wss",
        endpointUrl: server,
        resource: `/datastreams/${datastreamID}/observations`,
        startTime: start,
        endTime: end,
        mode: Mode.REPLAY, 
        tls: false,
    });

    const datalayer = new DataLayer({
            dataSourceId: [datasource.getId()],
        });

    const masterTimeController = new DataSynchronizer({
        replaySpeed: 1,
        intervalRate: 5,
        dataSources: [datasource]
    });

    datasource.connect()
    masterTimeController.connect();

    return (
    <>
        <div>
            
            {datasource.data}
        </div>
    </>
    );
};