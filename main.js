import SosGetResult from "./osh-js/source/core/datasource/sos/SosGetResult.datasource";
import VideoView from "./osh-js/source/core/ui/view/video/VideoView";
import VideoDataLayer from "./osh-js/source/core/ui/layer/VideoDataLayer";
import DataSynchronizer from "./osh-js/source/core/timesync/DataSynchronizer";
import { Mode } from "./osh-js/source/core/datasource/Mode";
import SampleTasking from "./SampleTasking";

let server = "localhost:8181/sensorhub/";
let start = "2023-11-02T02:47:38.788Z";
console.log(start);
let end = "2023-11-22T02:38:44.414558300Z";
let offeringId = "urn:osh:sensor:picamerapicamera001";
let videoProperty = "http://sensorml.com/ont/swe/property/VideoFrame";

let dataSources = [];

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

let sampleTask = new SampleTasking("New Simulated Sensor Driver", {
    protocol: "http",
    service: "SPS",
    version: "2.0",
    endpointUrl: server + "sps",
    procedure: "urn:osh:sensor:simulatedsensor001",
});

function submitCommand() {
    let sampleTextInput = document.getElementById("sampletextinput").value;
    let sampleBooleanInput = document.getElementById("samplebooleaninput").checked;
    console.log(sampleTextInput + " and " + sampleBooleanInput);
    let cmdData = sampleTask.getCommandData({
        SampleBoolean: sampleBooleanInput,
        SampleText: sampleTextInput,
    })
    sampleTask.sendRequest(cmdData);
}

document.getElementById("submitbutton").addEventListener("click", () => submitCommand());

console.log("testing hello")