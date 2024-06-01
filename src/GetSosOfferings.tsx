


export function getOfferings(host: string): Promise<any[]> {
    return fetch(`${host}:8181/sensorhub/sos?service=SOS&version=2.0&request=GetCapabilities`)
    .then(res => res.json());
}