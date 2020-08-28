import React, { Component } from "react";
import PropTypes from 'prop-types';
import MakeAccount from './MakeAccount';
import EnterCredentials from './EnterCredentials';

export default class Login extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                <MakeAccount/>
                <EnterCredentials />
            </div>
        );
    }
}