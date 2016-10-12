import React from 'react';
import ReactDOM from 'react-dom';

import { Grid, Col, Row, Button } from 'react-bootstrap';

import ResponseList from './ResponseList';

export default class ResponseListContainer extends React.Component {
    constructor(){
        super();

        this.state = { 
            responses: []
        };

        this.addResponseDataToTable = this.addResponseDataToTable.bind(this);
        this.sendRequestToServer = this.sendRequestToServer.bind(this);
        this.resetTable = this.resetTable.bind(this);
    };

    sendRequestToServer() {

        var server = "http://localhost:3000";
        var uri = "/hello";
        
        var name = this.props.name;
        var params = name != "" ? "/" + name : "";
        uri += params;
        var fullUrl = server + uri;

        var axios = require('axios');
        var _this = this;
        axios.defaults.timeout = 500;
        axios.get(fullUrl)
            .then(function (response) {
                var data = response.data;

                _this.addResponseDataToTable(data);
            })
            .catch(function (error) {
                var data = {
                    id: "",
                    content: "Error: could not connect to the server",
                    className: "errorRow"
                };

                _this.addResponseDataToTable(data);
            });
    };

    addResponseDataToTable (data) {
        var requestTime = new Date().toLocaleString();
        data.date = requestTime;

        var responseList = this.state.responses;
        responseList.push(data);

        this.setState({responses: responseList});
    };

    resetTable () {
        this.setState({ responses : [] });
    };

    componentDidUpdate () {
        if( this.props.isButtonDisabled ){
            ReactDOM.findDOMNode(this.refs.sayHelloButton).disabled = true;
        }
        else{
            ReactDOM.findDOMNode(this.refs.sayHelloButton).disabled = false;
        }
    };

    render() {

        return (
            <Grid>
                <Row id="sayHelloButtonRow">
                    <Col md={4} mdOffset={5}>
                            <Button bsStyle="primary" id="sayHello" ref="sayHelloButton" onClick={this.sendRequestToServer}>Say hello</Button>
                    </Col>
                </Row>
                <ResponseList responses={this.state.responses} />
                <Row id="footer">
                    <Col md={2} mdOffset={10}>
                        <Button bsStyle="primary" align="center" onClick={this.resetTable}>Reset</Button>
                    </Col>
                </Row>
            </Grid>
        )
    };
}