import React from 'react';

export default class InputError extends React.Component {

    render() {
        return (
            <div id="errorMsg" className={this.props.className}>
                <p>{this.props.errorMessage}</p>
            </div>
        )
    }
}