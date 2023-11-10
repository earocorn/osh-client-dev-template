import SosGetResult from "./osh-js/source/core/datasource/sos/SosGetResult.datasource";
import VideoView from "./osh-js/source/core/ui/view/video/VideoView";
import VideoDataLayer from "./osh-js/source/core/ui/layer/VideoDataLayer";
import DataSynchronizer from "./osh-js/source/core/timesync/DataSynchronizer";
import { Mode } from "./osh-js/source/core/datasource/Mode";
import Systems from "./osh-js/source/core/sweapi/system/Systems";

let server = "localhost:8181/sensorhub/";
let start = "2023-11-02T02:47:38.788Z";
console.log(start);
let end = "2023-11-22T02:38:44.414558300Z";
let offeringId = "urn:osh:sensor:picamerapicamera001";
let videoProperty = "http://sensorml.com/ont/swe/property/VideoFrame";

// update with static system id or use function to get system id at index 0
let systemId = "";
let cmdStreamId = "";
var currentAngle = 90;

let dataSources = [];

async function fetchControlId(index) {
    const fetchedControls = (await fetch("http://" + server + "api/controls")).json();
    const controls = await fetchedControls;
    const controlId = controls.items[index].id;

    return controlId;
}

async function fetchSystemId(index) {
    const fetchedSystems = (await fetch("http://" + server + "api/systems")).json();
    const systems = await fetchedSystems;
    const systemId = systems.items[index].id;

    return systemId;
}

async function populateIds() {
    systemId = await fetchSystemId(0);
    cmdStreamId = await fetchControlId(0);
    console.info(`Fetched ids! : system ID = ${systemId} and command ID = ${cmdStreamId}`);
}

populateIds();

const systems = new Systems({
    endpointUrl: server + 'api',
    tls: false,
    connectorOpts: {
        username: 'admin',
        password: 'admin',
    }
});

let videoDataSource = new SosGetResult("PiCamera Video", {
    endpointUrl: server + "sos",
    offeringID: offeringId,
    startTime: start,
    endTime: end,
    tls: false,
    observedProperty: videoProperty,
    protocol: 'ws',
    mode: Mode.BATCH,
});

dataSources.push(videoDataSource);

let videoLayer = new VideoDataLayer({
    dataSourceId: videoDataSource.id,
    getFrameData: (rec) => rec.img,
    getTimestamp: (rec) => rec.time,
}); 

let videoView = new VideoView({
    container: 'video-window',
    css: 'video-h264',
    name: 'PiCamera Video',
    showTime: true,
    showStats: true,
    dataSourceId: videoDataSource.id,
    layers: [videoLayer],
});

//videoDataSource.connect();

// start streaming
let masterTimeController = new DataSynchronizer({
    startTime: start,
    intervalRate: 5,
    dataSources: [videoDataSource]
  });

masterTimeController.connect();

async function submitCommand(angle) {
    // populate ids if not already populated
    if(cmdStreamId === "" || systemId === "") {
        await populateIds();
    }

    console.info('retrieving system')
    const system = await systems.getSystemById(systemId);
    console.info(`system retrieved : ${JSON.stringify(system)}\nretrieving control`);
    const control = await system.getControlById(cmdStreamId);
    console.info(`control received`);

    currentAngle = angle != null ? document.getElementById("angleinput").value : angle;

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