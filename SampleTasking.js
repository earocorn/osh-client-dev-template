import DataSink from "./DataSink";


class SampleTasking extends DataSink {

    constructor(name, properties) {
        super(name, properties);
    }

    // getCommandData(values) {
    //     let cmdData = '';

    //     if(values.SampleBoolean !== null) {
    //         cmdData += values.SampleBoolean + ',';
    //     }

    //     if(values.SampleText !== null) {
    //         cmdData += values.SampleText;
    //     }

    //     return cmdData;

    // }
    getCommandData(values) {
        let cmdData = '<sps:DataRecord>';
        //let cmdData = "";

        if(values.SampleBoolean !== null) {
            cmdData += '<swe:field name="SampleBoolean"><swe:Boolean>';
            cmdData += '<swe:value>' + values.SampleBoolean + '</swe:value>';
            cmdData += '</swe:Boolean></swe:field>';
        }

        if(values.SampleText !== null) {
            cmdData += '<swe:field name="SampleText"><swe:Text>';
            cmdData += '<swe:value>' + values.SampleText + '</swe:value>';
            cmdData += '</swe:Text></swe:field>';
        }

        cmdData += '</sps:DataRecord>';

        return cmdData;

    }

    buildUrl(properties) {
        let url = "";

        // adds protocol
        url += properties.protocol + "://";

        // adds endpoint url
        url += properties.endpointUrl;

        // add service parameter to url
        url += "?service=" + properties.service;

        // add version parameter to url
        url += "&version=" + properties.version;

        // add Submit request parameter
        url += "&request=Submit";

        // add procedere to url
        url += "&procedure=" + properties.procedure;

        return url;
    }

    buildRequest(cmdData) {
        let xmlSpsRequest = "<sps:Submit ";

        // adds service
        xmlSpsRequest += "service=\"" + this.properties.service + "\" ";

        // adds version
        xmlSpsRequest += "version=\"" + this.properties.version + "\" ";

        // adds ns
        xmlSpsRequest += "xmlns:sps=\"http://www.opengis.net/sps/2.0\" xmlns:sweapi=\"http://www.opengis.net/swe/2.0\"> ";

        // adds procedure
        xmlSpsRequest += "<sps:procedure>" + this.properties.procedure + "</sps:procedure>";

        // adds taskingParameters
        xmlSpsRequest += "<sps:taskingParameters name=\"" + this.name + "\">";

        xmlSpsRequest += cmdData;

        // adds endings
        xmlSpsRequest += "</sps:taskingParameters></sps:Submit>";

        return xmlSpsRequest;
    }

    // buildRequest(cmdData) {
    //     let xmlSpsRequest = "<sps:Submit ";
        
    //     // adds service
    //     xmlSpsRequest += `service="${this.properties.service}"`;
        
    //     // adds version
    //     xmlSpsRequest += `version="2.0.0"`;
        
    //     // adds ns
    //     xmlSpsRequest += `xmlns:sps="http://www.opengis.net/sps/2.0" xmlns:sweapi="http://www.opengis.net/swe/2.0"> `;
        
    //     // adds procedure
    //     xmlSpsRequest += `<sps:procedure>${this.properties.procedure}</sps:procedure>`;
        
    //     // adds taskingParameters
    //     xmlSpsRequest += `<sps:taskingParameters><swe:ParameterData>`;
        
    //     // adds encoding as comma separated values
    //     xmlSpsRequest += `</swe:ParameterData><sps:ParameterData><sps:encoding><swe:TextEncoding tokenSeparator="," blockSeparator="@@"/></sps:encoding>`;

    //     // add values here in csv encoding
    //     xmlSpsRequest += `<sps:values>${this.properties.values}</sps:values>`;
        
    //     // Close taskingParameters and Submit
    //     xmlSpsRequest += `</sps:ParameterData></sps:taskingParameters></sps:Submit>`;
        
    //     return xmlSpsRequest;
    // }
    

}
export default SampleTasking;