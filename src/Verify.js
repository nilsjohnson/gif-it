import React, { Component } from "react";
import { Container } from "@material-ui/core";
import { verifyAccount } from "./util/data";
import { Redirect } from 'react-router-dom'

// https://gif-it.io/verify?code=${code}?userId=${userId}

class Verify extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "Verifying Account...",
            redirect: false
        };

    }

    /**
 * Checks the window for a 'gid' (gif id) param 
 * @return the gif id if present otherwise null
 */
    getCode = () => {
        let url = new URL(window.location.href);
        return url.searchParams.get("code");
    }

    /**
    * Checks the window for a 'search' param 
    * @return the search query if present, otherwise null
    */
    getId = () => {
        let url = new URL(window.location.href);
        let id = url.searchParams.get("userId");
        console.log("id " + id);
        return url.searchParams.get("userId");
    }

    componentDidMount = () => {
        verifyAccount(this.getId(), this.getCode()).then(res => {
            if(res.ok) {
                this.setState({ message: "Success! Redirecting..." });

                setTimeout(() => {
                    this.setState({
                        redirect: true
                    });
                }, 800);

            }
            else {
                console.log(res);
                this.setState({message: "Something didnt quite work...send me an email (nilsjohnson328@gmail.com) if you think this is a bug and I'll check it out."})
            }
        }).catch(err => console.log(err));
    }

    render() {

        if(this.state.redirect) {
            return (<Redirect to='/explore' />)
        }

        return (
            <Container>
                <p>{this.state.message}</p>
            </Container>
        );
    }
}

export default Verify;
