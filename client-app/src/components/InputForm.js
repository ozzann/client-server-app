import React from 'react';
import { Grid, Col, Row, FormGroup, FormControl, Jumbotron, PageHeader } from 'react-bootstrap';

import ResponseListContainer from './ResponseListContainer';
import InputError from './InputError';

export default class InputForm extends React.Component {
    constructor() {
        super();

        this.state = {
            name : "",
            errorMessage: "",
            isErrorVisible: false,
            isButtonDisabled: false
        };

        this.setName = this.setName.bind(this);
    }

    setName (e) {
        // check if input name is valid
        var inputValue = e.target.value;
        var newStateObj = {
            name: inputValue,
            errorMessage: "",
            isErrorVisible: "invisble",
            isButtonDisabled: false
        };

        var isValid = this.isNameValid(inputValue);
        if( !isValid ){
            newStateObj.errorMessage = "Error! Name is not valid. It can contain any symbol excluding &, \\, / and spaces.";
            newStateObj.isErrorVisible = "visible";
            newStateObj.isButtonDisabled = true;
        }

        this.setState(newStateObj);
    }

    isNameValid(name) {
        var regex = new RegExp('[\\\\\\s&/]');
        var matches = name.match(regex);
        return name.match(regex) ? false : true;
    }

    render () {
        return (
            <Jumbotron id="wrapper">
                <PageHeader>Hello, server!</PageHeader>
                <p id="description">
                    There is a server at <strong>http://localhost:9080</strong>.
                    It always answers if you ask it.
                    Please put your name in the input field below, say hello to the server and see what it'll say back.
                </p>
                <Grid>
                    <Row id="form">
                        <Col md={6} mdOffset={3}>
                            <InputError errorMessage={this.state.errorMessage} className={this.state.isErrorVisible} />
                            <FormGroup id="form-group">
                                <FormControl type="text" id="nameField" onChange={this.setName} placeholder="Name" />
                            </FormGroup>
                        </Col>
                    </Row>
                </Grid>
                 <ResponseListContainer name={this.state.name} isButtonDisabled={this.state.isButtonDisabled}/>
            </Jumbotron>
        )
    }
}