import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, Col, Row, Table } from 'react-bootstrap';

export default class ResponseList extends React.Component {
    
    render () {

        return (
            <div id="responsesContainer">
                <Row>
                    <Col md={7} mdOffset={3}>
                        <p id="tableDescription" align="center">All server's responses will be shown in the table below:</p>
                    </Col>
                </Row>
                <Row ref="responsesListRow" id="responses">
                    <Col md={10} mdOffset={1}>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Response text</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.responses.map((data, i) => <Content 
                                    key = {i} responseData = {data}/>)}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
    )};

    componentDidUpdate () {
        // Scroll responses table to the bottom
        var height = ReactDOM.findDOMNode(this.refs.responsesListRow).clientHeight;
        ReactDOM.findDOMNode(this.refs.responsesListRow).scrollTop = height;
    }
}

class Content extends React.Component {

    render() {
        return (
            <tr className={this.props.responseData.className}>
                    <td>{this.props.responseData.id}</td>
                    <td>{this.props.responseData.content}</td>
                    <td>{this.props.responseData.date}</td>
            </tr>
        );
    }
}
