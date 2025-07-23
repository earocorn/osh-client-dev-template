import React, { useEffect, useMemo, useRef, useState } from 'react';
import Systems from "osh-js/source/core/consysapi/system/Systems.js"
import ControlStreams from "osh-js/source/core/consysapi/controlstream/ControlStreams.js"
import DataStreams from "osh-js/source/core/consysapi/datastream/DataStreams.js"
import DataStream from "osh-js/source/core/consysapi/datastream/DataStream.js"
import SamplingFeatures from "osh-js/source/core/consysapi/samplingfeature/SamplingFeatures.js"
import Observations from "osh-js/source/core/consysapi/observation/Observations.js"
import ObservationFilter from "osh-js/source/core/consysapi/observation/ObservationFilter.js"
import VideoView from "osh-js/source/core/ui/view/video/VideoView.js"
import VideoDataLayer from "osh-js/source/core/ui/layer/VideoDataLayer.js"
import Commands from "osh-js/source/core/consysapi/command/Commands.js"
import ConSysApi from "osh-js/source/core/datasource/consysapi/ConSysApi.datasource.js"
import { Mode } from "osh-js/source/core/datasource/Mode";
import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer.js"
// Cesium
import { Cartesian3, Ion, SceneMode, Terrain, } from "@cesium/engine";
import "@cesium/engine/Source/Widget/CesiumWidget.css";
import CesiumView from "osh-js/source/core/ui/view/map/CesiumView.js";
import PointMarkerLayer from "osh-js/source/core/ui/layer/PointMarkerLayer";
import "./App.css";

function App() {
  // @ts-ignore
  window.CESIUM_BASE_URL = './';
  Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNGU1OTIxNi0yYWMyLTQ0MGItOWNhNi0xNjlhNWE4Njk2ZjgiLCJpZCI6MzIwOTY1LCJpYXQiOjE3NTIzOTY1MDh9.12Fr28_Y_zO-V0VxoUplDyEMJmFxrmPZnDj8Q3wmGZg";
  const cesiumContainer = useRef(null);
  const networkOpts = {
    endpointUrl: 'localhost:8282/sensorhub/api',
    connectorOpts: {
        username: 'admin',
        password: 'oscar',
    }
  };

  const systems = new Systems(networkOpts);
  const datastreams = new DataStreams(networkOpts);
  const observations = new Observations(networkOpts);
  const controlstreams = new ControlStreams(networkOpts);
  const commands = new Commands(networkOpts);
  const features = new SamplingFeatures(networkOpts);

  const [time, setTime] = useState("2025-04-23T16:51:53Z");

  let source: typeof ConSysApi = null;
  let cesiumView: typeof CesiumView = null;
  let pointMarkerLayer: typeof PointMarkerLayer = null;
  let ds: typeof DataStream = null;

  useEffect(() => {
    async function fetchData() {
      //8m1cof6p2fcso
      //q5nuf1f2tmj0s
      const dataStreamCollection = await datastreams.searchDataStreams();
      const dataStreams = await dataStreamCollection.nextPage();
      ds = dataStreams[0];

      console.log(ds.properties.name)

      source = new ConSysApi('video', {
        protocol: ds.networkProperties.streamProtocol,
        endpointUrl: ds.networkProperties.endpointUrl,
        resource: `/datastreams/${ds.properties.id}/observations`,
        tls: false,
        // startTime: "2025-04-23T16:51:53Z",
        // endTime: "2025-05-24T17:54:32Z",
        responseFormat: "application/swe+binary",
        mode: Mode.REAL_TIME,
      });

      console.log(ds);

      pointMarkerLayer = new PointMarkerLayer({
        label: "Unmanned System",
        dataSourceId: source.id,
        getLocation: {
          dataSourceIds: [source.getId()],
          handler: function (rec: any) {
            return {
              x: rec.Location.lon,
              y: rec.Location.lat,
              z: rec.Location.alt
            };
          }
        },
        getOrientation: {
          dataSourceIds: [source.getId()],
          handler: function (rec: any) {
            return {
              heading: rec.Orientation.yaw,
              pitch: rec.Orientation.pitch,
              roll: rec.Orientation.roll
            };
          }
        },
        icon: "images/drone.glb",
        iconSize: [32, 64],
        iconScale: 12,
        color: '#FF8000',
        name: 'Unmanned System'
      });

      cesiumView = new CesiumView({
        container: cesiumContainer.current.id,
        layers: [pointMarkerLayer],
        options: {
          viewerProps: {
            terrain: Terrain.fromWorldTerrain(),
            sceneMode: SceneMode.SCENE3D,
            // infoBox: false,
            // geocoder: false,
            timeline: false,
            animation: false,
            homeButton: false,
            scene3DOnly: true,
            // baseLayerPicker: false,
            // sceneModePicker: false,
            fullscreenButton: false,
            // projectionPicker: false,
            // selectionIndicator: false,
            navigationHelpButton: true,
            navigationInstructionsInitiallyVisible: true
          }
        }
      });

      const baseLayerPicker = cesiumView.viewer.baseLayerPicker;

      const imageryProviders = baseLayerPicker.viewModel.imageryProviderViewModels;
      baseLayerPicker.viewModel.selectedImagery =
          imageryProviders.find((imageProviders: any) => imageProviders.name === "Bing Maps Aerial");

      const terrainProviders = baseLayerPicker.viewModel.terrainProviderViewModels;
      baseLayerPicker.viewModel.selectedTerrain =
          terrainProviders.find((terrainProviders: any) => terrainProviders.name === "Cesium World Terrain");

      const obsCollection = await observations.searchObservations();
      const obs = await obsCollection.nextPage();
      const firstObs = obs[0];
      const location = firstObs.properties.result.Location;
      console.log("obs: ", location);

      // Center the camera on the UAV
      cesiumView.viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(location.lon, location.lat, location.alt + 500)
      });
    }

    fetchData();
  }, []);

  function pause() {
    source.disconnect();
  }

  function play() {
    source.connect();
  }

  return (
    <div className="App" style={{ flex: 1, flexDirection: 'row'}}>
      <h2>Streaming data from weather sensor</h2>
      {/*<div>{JSON.stringify(weatherObs)}</div>*/}
      {/*<div id='rainChart'>rain</div>*/}
      <button onClick={() => play()}>START</button>
      <button onClick={() => pause()}>PAUSE</button>
      <input type="text" value={time} onChange={e => setTime(e.target.value)}></input>
      <div id='cesium-view' ref={cesiumContainer} style={{ height:"100%", width:"100%"}}></div>
      <img id='test'></img>
    </div>
    
  );
}

export default App;
