import React, {useEffect, useMemo, useRef, useState} from "react";
import OpenLayerView from "osh-js/source/core/ui/view/map/OpenLayerView";
import PointMarkerLayer from "osh-js/source/core/ui/layer/PointMarkerLayer";
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
import {Mode} from "osh-js/source/core/datasource/Mode";
import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer";
import LeafletView from "osh-js/source/core/ui/view/map/LeafletView";


export default function MapComponent(){

    const locationDsId = "9tuonlfm6ulr6";
    const start = useMemo(() => new Date((Date.now() - 600000)).toISOString(), []);
    const end = "2024-12-31T23:59:59Z";
    let server = `162.238.96.81:8781`;
    const openLayerContainer = useRef(null);
    
    const [layer, setLayer] = useState(null);

    useEffect(() => {
        const pointMarkerLayer = new PointMarkerLayer({
            labelOffset: [0, -30],
            location: {
                x: 34.735,
                z: -86.7232
            },
            icon: 'images/house.png',
            iconSize: [32, 64],
            iconAnchor: [16, 65],
            defaultToTerrainElevation: true,
            name: "Oscar Location",
            // label: "Oscar",
            // iconScale: .05,
            // color: '#93ce27'
        });
        setLayer(pointMarkerLayer);
    }, []);


    useEffect(() => {
        if(layer !== null) {
            const leafletView = new LeafletView({
                container: "map-container",
                layers: [layer],
                autoZoomOnFirstMarker: true
            });
            console.log(layer)
        }
    }, [layer]);

    // const handleSelectedMarker = (selection: any[]) =>{
    //    const selectedMarkerId = selection[0];
    //
    // };

    // var popup = L.popup();
    // function onMarkerClick(event: Event){
    //     popup
    //         .setContent("You clicked the map!")
    //         .openOn(map);
    // }

    return (
        <div>
            <div id="map-container" ref={openLayerContainer}></div>
        </div>
    );
}