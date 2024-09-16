// import React, {useEffect, useMemo, useRef, useState} from "react";
// import PointMarkerLayer from "osh-js/source/core/ui/layer/PointMarkerLayer";
// import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource";
// import {Mode} from "osh-js/source/core/datasource/Mode";
// import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer";
// import LeafletView from "osh-js/source/core/ui/view/map/LeafletView";
// import {useSelector} from "react-redux";
// import Box from "@mui/material/Box";
// import './Map.css';
// export default function MapComponent(){
//     // @ts-ignore
//     const mapViewRef = useRef<LeafletView | null>(null);
//     // @ts-ignore
//     let pointMarkers: PointMarkerLayer[] = [];
//     let locationDs: typeof SweApi[] = [];
//     let gammaDs: typeof SweApi[] = [];


//     // const [locationDs, setLocationDs] = useState<SweApi[]>([]);
//     // const [pointMarkers, setPointMarkers] = useState<PointMarkerLayer[]>([]);

//     /*****************lane status******************/
//     useEffect(() => {
//         if(laneMap.size > 0){
//             laneMap.forEach((value,key) => {
//                 if(laneMap.has(key)){
//                     let ds: LaneMapEntry = laneMap.get(key);
//                     const rpmGamma = ds.datasourcesRealtime.filter((item) => item.name.includes("Gamma Count"));
//                     gammaDs.push(rpmGamma);

//                 }
//             });
//         }
//         console.log('gamma', gammaDs);
//     },[laneMap]);

//     /******************map view********************/
//     useEffect(() =>{
//         if(laneMap.size > 0 && !mapViewRef.current){
//             console.log(laneMap)
//             laneMap.forEach((value, key) =>{
//                 if(laneMap.has(key)){
//                     let ds: LaneMapEntry = laneMap.get(key);
//                     const rpmLocation = ds.datasourcesBatch.filter((item) => item.name.includes('Sensor Location') && item.name.includes('Lane'));
//                     locationDs.push(rpmLocation);
//                     // locationDs.push(ds.datasourcesBatch[0]);
//                 }
//             })

//             console.log(locationDs);
//             if(locationDs.length > 0){
//                 locationDs.map((loc) => {
//                     const newPointMarker = new PointMarkerLayer({
//                         // getMarkerId: (rec: any) => rec.id,
//                         getLocation: (rec: any) =>({x: rec.location.lon, y: rec.location.lat, z: rec.location.alt}),
//                         icon: '/point.png',
//                         iconAnchor: [16, 16],
//                         iconSize: [16, 16],
//                         iconScale: 1.0,
//                         labelSize: 16,
//                         labelScale: 1.0,
//                         zoomLevel: 15,
//                         defaultToTerrainElevation: false,
//                         labelOffset: [-5,-15],
//                         dataSourceId: loc[0].getId(),
//                         onLeftClick: (markerId: any, markerObject: any, event: { latlng: any; containerPoint: any; }) => console.log(markerId, event.latlng, event.containerPoint),
//                         onRightClick: (markerId: string, billboard: any, event: { containerPoint: { x: number; y: number; }; }) => {
//                             const rect = document.getElementById('leafletMap').getBoundingClientRect();
//                             console.log("HELLO RIGHT")
//                         },
//                         onHover: (markerId: any, markerObject: any, event: { latlng: any; containerPoint: any; }) => console.log(markerId, event.latlng, event.containerPoint),
                        
//                     });
//                     newPointMarker.init();
//                     console.log(newPointMarker)
//                     pointMarkers.push(newPointMarker);
//                 });
//                 console.log('pointmarkers', pointMarkers);
//                 }
//         }

//         return () => {
//             if (mapViewRef.current) {
//                 mapViewRef.current.destroy();
//                 mapViewRef.current = null;
//             }
//         }
//     },[laneMap]);

//     useEffect(() => {
//         if(pointMarkers.length > 0) {

//             pointMarkers.forEach((pm) => {
//                 console.info(pm);
//             });

//             /*********************VIEW****************************/
//             if (!mapViewRef.current) {
//                 mapViewRef.current = new LeafletView({
//                     container: "mapcontainer",
//                     autoZoomOnFirstMarker: true,
//                     layers: pointMarkers,
//                 });
//             }
//             locationDs.map((ds) => ds[0].connect());
//         }
//     }, [pointMarkers]);

//     /***************content in popup************/
//     //TODO: replace video with lane video
//     //TODO: replace status with lane status
//     function getContent(laneName: string, status: string) {
//         // let videoStream;
//         // console.log('lanes with viedo', lanesWithVideo)
//         // if(lanesWithVideo !== null){
//         //     videoStream = lanesWithVideo[1].videoDatastreams;
//         // }
//         let videocomponent =  `<VideoComponent videoDatastreams={videoDatastreams[0]}/>`
//         // let videoview = "<video> <source src=" + videocomponent + "</video>"

//         // let videoview = "<source src=\"https://www.w3schools.com/html/mov_bbb.mp4\" type=\"video/mp4\" style='overflow: hidden'>"

//         // create main div
//         const div = document.createElement("div");
//         div.className = 'point-popup';

//         const laneNameEle = document.createElement("h3");
//         laneNameEle.className = 'popup-text-lane';
//         laneNameEle.textContent = laneName;

//         const statusEle = document.createElement("h3");
//         statusEle.className = 'popup-text-status';
//         statusEle.textContent = `Status: ${status}`;

//         const video = document.createElement("video");
//         const source = document.createElement("source");

//         source.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
//         // source.src = videocomponent;

//         source.type = 'video/mp4';
//         video.appendChild(source);

//         //create button
//         const button = document.createElement("button");
//         button.className = 'popup-button';
//         button.textContent = "LANE VIEW";


//         div.appendChild(laneNameEle);
//         div.appendChild(statusEle);
//         div.appendChild(video);
//         div.appendChild(button);

//         return div.outerHTML;
//         // "<div class='point-popup'>" +
//         //     "<h3 class='popup-text-lane'>" + laneName + "</h3>" +
//         //     "<h3 class='popup-text-status'>Status: "+ status +"</h3>" +
//         //     "<video><source " + <VideoComponent videoDatastreams={videoDatastreams[0]}/> + "></video>" +
//         //     // "<div class='video-container'>" + videocomponent + "</div>" +
//         //     // "<video <source src=" +
//         //
//         // // + " type='video/h264' /></video>" +
//         //
//         // // <VideoComponent videoDatastreams={videoDatastreams[0]}/>
//         //     // "<video autoplay> <source src='https://www.w3schools.com/html/mov_bbb.mp4' type='video/mp4'/></video>" +
//         //     "<button class='popup-button' onclick='function()=>{window.location.href=`/lane-view`}'>LANE VIEW</button>" +
//         // "</div>"
//         // );
//     }

//     return (
//         <div>
//             <div id="mapcontainer"></div>
//         </div>
//     );
// }