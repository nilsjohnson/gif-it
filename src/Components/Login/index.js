import React, { Component } from "react";
import PropTypes from 'prop-types'
import NewUser from './NewUser'

class Login extends Component {
    constructor(props) {
        super(props);


    }

    render() {
        return(
            <NewUser/>
        );
    }
}