import React, { useEffect, useMemo, useRef, useState } from 'react';
import Systems from 'osh-js/source/core/sweapi/system/Systems';
import SystemFilter from "osh-js/source/core/sweapi/system/SystemFilter";
import DataStreamFilter from "osh-js/source/core/sweapi/datastream/DataStreamFilter";
import System from "osh-js/source/core/sweapi/system/System";
import DataStreams from "osh-js/source/core/sweapi/datastream/DataStreams";
import VideoView from 'osh-js/source/core/ui/view/video/VideoView';
import VideoDataLayer from 'osh-js/source/core/ui/layer/VideoDataLayer';
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource"
import {Mode} from 'osh-js/source/core/datasource/Mode';
import PointMarkerLayer from "osh-js/source/core/ui/layer/PointMarkerLayer";
import LeafletView from "osh-js/source/core/ui/view/map/LeafletView";
import OpenLayerView from "osh-js/source/core/ui/view/map/OpenLayerView";
import "./App.css";

function App() {
  const start = "1970-12-31T23:59:59Z";
  const end = "2024-12-31T23:59:59Z";

  const networkOpts = {
    endpointUrl: `162.238.96.81:8781/sensorhub/api`,
    tls: false,
    connectorOpts: {
        username: 'admin',
        password: 'admin',
    }
  };

  const systems = new Systems(networkOpts);

  useEffect(() => {

    async function fetchSystems() {
      // Get collection of top level systems by a tag (ex: "lane" to get systems with "Lane"/"lane" in the name) with ability to select pageSize in case of large amount of lanes
      const availableSystemsCollection = await systems.searchSystems(undefined, /*pageSize = */10);
      const availableSystems = await availableSystemsCollection.nextPage();
      console.log(availableSystems); // List of osh-js "System" objects
      
      const lane1 = availableSystems[1]; // Get whichever lane, filter by "properties.properties.uid" to ensure it matches "urn:osh:system:lane"
      console.log(lane1); 

      const locDatastreamCol = await lane1.searchDataStreams(new DataStreamFilter({ ObservationFilter: ["http://www.opengis.net/def/SensorLocation"] }));
      const locDatastream = (await locDatastreamCol.nextPage())[0];

      const source = new SweApi(locDatastream.properties.name, {
        protocol: locDatastream.networkProperties.streamProtocol,
        endpointUrl: locDatastream.networkProperties.endpointUrl,
        startTime: start,
        endTime: end,
        resource: `/datastreams/${locDatastream.properties.id}/observations`,
        mode: Mode.BATCH,
        tls: false,
        connectorOpts: locDatastream.networkProperties.connectorOpts
      });
      console.log(source);

      const view = new OpenLayerView({
                container: "map-container",
                autoZoomOnFirstMarker: true,
                layers: [new PointMarkerLayer({
                    dataSourceId: source.getId(),
                    getLocation: (rec: any) =>({x: rec.location.lon, y: rec.location.lat}),
                    icon: 'images/house.png',
                    iconAnchor: [16, 64],
                    iconSize: [32, 64],
                    zIndex: 1,
                    defaultToTerrainElevation: true,
                    labelOffset: [-5,-15],
                    onLeftClick: (markerId: any, markerObject: any, event: { latlng: any; containerPoint: any; }) => console.log(markerId, event.latlng, event.containerPoint),
                    onRightClick: (markerId: string, billboard: any, event: { containerPoint: { x: number; y: number; }; }) => {
                        const rect = document.getElementById('leafletMap').getBoundingClientRect();
                        console.log("HELLO RIGHT")
                    },
                    onHover: (markerId: any, markerObject: any, event: { latlng: any; containerPoint: any; }) => console.log(markerId, event.latlng, event.containerPoint),
                    
                })]
            });

      source.connect();
    }

    fetchSystems();

    }
  , []);

  return (
    <div className="App">
      <h1>Lane: </h1>
      <div style={{ padding: 50 }}>
          <div id="map-container" style={{ width: "100%", height: "100%" }}/>
      </div>
    </div>
  );
}

export default App;
