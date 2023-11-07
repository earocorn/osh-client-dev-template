import DataSink from "./osh-js/source/core/datapush/DataSink";


class SampleTasking extends DataSink {

    constructor(name, properties) {
        super(name, properties);
    }

    getCommandData(values) {
        let cmdData = '';

        if(values.SampleBoolean !== null) {
            cmdData += 'SampleBoolean,' + values.SampleBoolean + ' ';
        }

        if(values.SampleText !== null) {
            cmdData += 'SampleText,' + values.SampleText + ' ';
        }

        return cmdData;

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
        xmlSpsRequest += "<sps:taskingParameters><sps:ParameterData>";

        // adds encoding
        xmlSpsRequest += "<sps:encoding><sweapi:TextEncoding blockSeparator=\" \"  collapseWhiteSpaces=\"true\" decimalSeparator=\".\" tokenSeparator=\",\"/></sps:encoding>";

        // adds values
        xmlSpsRequest += "<sps:values>" + cmdData + "</sps:values>";

        // adds endings
        xmlSpsRequest += "</sps:ParameterData></sps:taskingParameters></sps:Submit>";

        return xmlSpsRequest;
    }

}
export default SampleTasking;