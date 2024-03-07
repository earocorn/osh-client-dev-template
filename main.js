import SosGetResult from "./osh-js/source/core/datasource/sos/SosGetResult.datasource";
import VideoView from "./osh-js/source/core/ui/view/video/VideoView";
import VideoDataLayer from "./osh-js/source/core/ui/layer/VideoDataLayer";
import DataSynchronizer from "./osh-js/source/core/timesync/DataSynchronizer";
import { Mode } from "./osh-js/source/core/datasource/Mode";
import Systems from "./osh-js/source/core/sweapi/system/Systems";
import SweApiFetch from "./osh-js/source/core/datasource/sweapi/SweApi.datasource.js"
import PointMarkerLayer from "./osh-js/source/core/ui/layer/PointMarkerLayer.js"
import LeafletView from "./osh-js/source/core/ui/view/map/LeafletView.js"

let server = "192.168.1.219:8181/sensorhub/";
let start = "2023-11-02T02:47:38.788Z";
console.log(start);
let end = "2023-11-22T02:38:44.414558300Z";
let offeringId = "urn:osh:sensor:picamera001";
let videoProperty = "http://sensorml.com/ont/swe/property/VideoFrame";
let locationProperty = "http://sensorml.com/ont/swe/property/Location";

// update with static system id or use function to get system id at index 0
let systemId = "";
let cmdStreamId = "";
let dataStreamId = "";
var currentAngle = 90;

let dataSources = [];

const APICollection = {
    DataStream: "datastreams",
    Control: "controls",
    System: "systems",
}

async function fetchId(collectionName, index) {
    const fetchedCollection = (await fetch("http://" + server + "api/" + collectionName)).json();
    const collection = await fetchedCollection;
    const collectionId = collection.items[index].id;

    return collectionId;
}

async function populateIds() {
    systemId = await fetchId(APICollection.System, 0);
    cmdStreamId = await fetchId(APICollection.Control, 0);
    dataStreamId = await fetchId(APICollection.DataStream, 0);
    console.info(`Fetched ids! : system ID = ${systemId}\ncommand ID = ${cmdStreamId}\ndatastream ID = ${dataStreamId}`);
}

const systems = new Systems({
    endpointUrl: server + 'api',
    tls: false,
    connectorOpts: {
        username: 'admin',
        password: 'admin',
    }
});

// get pi camera video using swe api
const videoOpts = {
    endpointUrl: server + 'api',
    resource: '/datastreams/' + "u5h3m9fh1rqf2" + '/observations',
    tls: false,
    protocol: 'ws',
    startTime: 'now',
    endTime: end,
    mode: Mode.REAL_TIME,
    responseFormat: 'application/swe+binary',
    //prefetchBatchSize: 5000,
}

const sweVideoDataSource = new SweApiFetch("PiCamera Video", {
    ...videoOpts
});

dataSources.push(sweVideoDataSource);

// get pi camera video using sos service
let videoDataSource = new SosGetResult("PiCamera Video", {
    endpointUrl: server + "sos",
    offeringID: offeringId,
    startTime: start,
    endTime: end,
    tls: false,
    observedProperty: videoProperty,
    mode: Mode.BATCH,
});

dataSources.push(sweVideoDataSource);

let videoLayer = new VideoDataLayer({
    dataSourceId: sweVideoDataSource.id,
    getFrameData: (rec) => rec.img,
    getTimestamp: (rec) => rec.time,
}); 

let videoView = new VideoView({
    container: 'video-window',
    css: 'video-h264',
    name: 'PiCamera Video',
    framerate: 25,
    showTime: true,
    showStats: true,
    dataSourceId: sweVideoDataSource.id,
    layers: [videoLayer],
});

let gpsDataSource = new SosGetResult("PiCamera Location", {
    endpointUrl: server + "sos",
    offeringID: offeringId,
    startTime: start,
    endTime: end,
    mode: Mode.BATCH,
    tls: false,
    observedProperty: locationProperty,
    responseFormat: 'application/json',
    timeShift: -16000,
});
dataSources.push(gpsDataSource);

// my attempt at putting a marker on leaflet map
let pointMarkerLayer = new PointMarkerLayer({
    dataSourceId: gpsDataSource.id,
    getLocation: (rec) => ({
        x: rec.location.lon,
        y: rec.location.lat,
        z: rec.location.alt,
    }),
    // location: {
    //     x: 34.735915156141196,
    //     z: -86.72325187317927
    // },
    icon: 'images/camera.png',
    iconSize: [32, 64],
    iconAnchor: [16, 65],
    name: 'Pi Camera',
    defaultToTerrainElevation: true,
});

console.log(`LOCATION: ${gpsDataSource.location}`);

let leafletMapView = new LeafletView({
    container: 'leafletmap',
    layers: [pointMarkerLayer],
    autoZoomOnFirstMarker: true,
});

//sweVideoDataSource.connect();
//gpsDataSource.connect();

// start streaming
let masterTimeController = new DataSynchronizer({
    replaySpeed: 2,
    startTime: start,
    endTime: end,
    dataSources: dataSources
  });

masterTimeController.connect();

async function submitCommand(angle) {
    // populate ids if not already populated
    if(cmdStreamId === "" || systemId === "") {
        await populateIds();
        return;
    }

    console.info('retrieving system')
    const system = await systems.getSystemById(systemId);
    console.info(`system retrieved : ${JSON.stringify(system)}\nretrieving control`);
    const control = await system.getControlById(cmdStreamId);
    console.info(`control received`);

    currentAngle = angle == null ? document.getElementById("angleinput").value : angle;

    currentAngle = parseFloat(currentAngle);

    let cmdData = {
        params: {
            Angle: currentAngle,
        }
    };
    console.log(`Tilting by ${JSON.stringify(cmdData)} degrees`);
    try {
        control.postCommand(JSON.stringify(cmdData));
    } catch (error) {
        console.error(error);
        alert(error);
    }
}

async function updateAngle(deltaAngle) {
    const angleInput = document.getElementById("angleinput");
    currentAngle = parseInt(angleInput.value)
    deltaAngle = parseInt(deltaAngle);

    currentAngle += deltaAngle;
    currentAngle = currentAngle > 120 ? Math.min(125, currentAngle) : Math.max(0, currentAngle);
    angleInput.value = currentAngle;

    await populateIds();

    submitCommand(currentAngle);
}

submitCommand(currentAngle);

document.getElementById("submitbutton").addEventListener("click", () => submitCommand());
document.getElementById("upbutton").addEventListener("click", () => updateAngle(Number.parseInt(15)));
document.getElementById("downbutton").addEventListener("click", () => updateAngle(Number.parseInt(-15)));
document.getElementById("angleinput").value = currentAngle;

console.info('end of main')