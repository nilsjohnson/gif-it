import React, { Component } from "react";
import Header from "./Components/Header";
import { Link, Grid, Container, TextField, Box, Card, Button, Typography, withStyles, CircularProgress, Modal } from "@material-ui/core";
import Footer from "./Components/Footer";
import { doSignedS3Post, submitBugReport } from "./util/data";
import { Redirect } from "react-router";

const MIN_CHARS = 10;
const MAX_CHARS = 1000;
const MAX_FILE_SIZE = 10; // MB

const useStyles = theme => ({
    hidden: {
        display: "none"
    },
    modalContainer: {
        height: '100%'
    }
});

class Bugs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            enteredText: "",
            redirect: false,
            inputErr: null,
            file: null,
            fileErr: null,
            uploadTriggerd: false,
            modalOpen: false
        };

        this.fileInput = React.createRef();
    }

    setModalOpen = () => {
        this.setState({
            modalOpen: true
        });
    }

    setModalClose = () => {
        this.setState({
            modalOpen: false
        });
    }

    /**
     * @param {*} fields The file's fields
     * @param {*} file The file to upload
     * @returns FormData to do signed s3 post
     */
    createForm = (fields, file) => {
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
            formData.append(k, v);
        });
        formData.append("file", file);
        return formData;
    }

    /**
     * Trigger clicking the input button for a file input.
     * The file input is hidden so we can use an MUI button.
     */
    triggerInputClick = () => {
        this.fileInput.current.click();
    }

    /**
     * Handles the user selecting a file
     */
    selectFile = (event) => {
        let file = event.target.files[0];
        let fileErr = null;

        // validate file size
        if (file.size > MAX_FILE_SIZE * 1000 * 1000) {
            console.log("this file is + " + file.size)
            fileErr = `File must no exceed ${MAX_FILE_SIZE} MB.`
        }

        this.setState({
            file: file,
            fileErr: fileErr
        });
    }

    /**
     * Redirects to index
     */
    cancel = () => {
        this.setState({
            redirect: '/'
        });
    }

    /**
     * handles user typing input.
     */
    onTextChange = (event) => {
        let val = event.target.value;
        let err = null;

        if (val.length > MAX_CHARS) {
            err = `Please submit < ${MAX_CHARS} characters.`;
        }

        this.setState({
            enteredText: event.target.value,
            inputErr: err
        });
    }

    /**
     * Handles user pressing submit button
     */
    submitReport = () => {
        if (this.state.enteredText.length < MIN_CHARS
            || this.state.inputErr
            || this.state.fileErr) {
            if (!this.state.inputErr && !this.state.fileErr) {
                this.setState({
                    inputErr: `Please enter at least ${MIN_CHARS} characters.`
                });
            }
            return;
        }

        this.setState({
            uploadTriggerd: true,
            modalOpen: true

        });

        let fileParts = null;
        let fileInfo = null;

        const { file } = this.state;

        if (file && file.name.split('.').length > 1 ) {
            console.log("doing it!");
            fileParts = this.state.file.name.split('.');
            fileInfo = {
                fileName: fileParts[0],
                fileType: fileParts[fileParts.length-1]
            }
        }

        console.log("file info: ", fileInfo);

        let report = {
            message: this.state.enteredText,
            fileInfo: fileInfo
        }

        // hit the server with the message and file info
        submitBugReport(report).then(res => {
            if (res.ok) {
                res.json().then(resJson => {
                    // if our report did not have file attached to it, 
                    if (!report.fileInfo) {
                        alert("Thank You, Much Appreciated!");
                        return this.setState({ redirect: true });
                    }
                    // if there was a file
                    const { url, fields } = resJson;
                    let form = this.createForm(fields, this.state.file);
                    doSignedS3Post(url, form).then(res => {
                        if (res.ok) {
                            alert("Thank You, Much Appreciated! File Recieved");
                            return this.setState({ redirect: true });
                        }
                        else {
                            res.text().then(text => {
                                console.log(text);
                                alert("Thank You!")
                                return this.setState({ redirect: true });
                            }).catch(err => alert(err));
                        }
                    })

                }).catch(err => console.log(err));
            }
            else {
                alert("Ohh Geeze. This is embarassing. We're so broken a bug report wont even go though...Sorry about that..");
                this.setModalClose();
                this.setState({
                    uploadTriggerd: false
                });
            }
        }).catch(err => console.log(err));
    }


    render() {
        const { classes } = this.props;

        if (this.state.redirect) {
            return (
                <Redirect to={'/'} />
            );
        }

        return (
            <Box>
                <Header />
                <Container disableGutters maxWidth='sm'>
                    <Card>
                        <Box m={3}>
                            <Grid
                                container
                                direction="column"
                                justify="flex-start"
                                alignItems="flex-start"
                                spacing={3}
                            >
                                <Typography gutterBottom variant="h4" component="h2" align='center'>
                                    Submit Bug Report or Feature Request
                                </Typography>

                                <TextField
                                    multiline fullWidth={true} rows={6}
                                    label={"Describe Bug or Request Feature"}
                                    variant="outlined" onChange={this.onTextChange}
                                    value={this.state.enteredText}
                                    error={!!this.state.inputErr}
                                    helperText={this.state.inputErr}
                                />


                                <Grid item container
                                    direction="row"
                                    justify="flex-start"
                                    alignItems="center"
                                >
                                    <Button color="primary" variant='contained' onClick={this.triggerInputClick}>
                                        Add File
                                    </Button>
                                    <input ref={this.fileInput} className={classes.hidden} type="file" onChange={this.selectFile} />
                                    <Box component='span' m={1}></Box>
                                    <Typography noWrap variant='body1'>{this.state.file ? this.state.file.name : "Add a file (optional)"}</Typography>
                                    <Typography color="error" variant='body1'>{this.state.fileErr && `${this.state.fileErr}`}</Typography>
                                </Grid>


                                <Grid item container
                                    direction="row"
                                    justify="center"
                                    alignItems="flex-start"
                                    spacing={3}
                                >
                                    <Grid item>
                                        <Button onClick={this.cancel} color="secondary" variant='contained'>Cancel</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button onClick={this.submitReport} disabled={this.state.uploadTriggerd} color="primary" variant='contained'>Submit</Button>
                                    </Grid>
                                </Grid>
                                <Grid container item justify="flex-end">
                                    <Grid item>
                                        <Link href="https://github.com/nilsjohnson/gif-it/issues" variant="body2">
                                            Or, on Github.
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                        <Modal
                            open={this.state.modalOpen}
                            onClose={this.setModalClose}
                            aria-labelledby="submit-bug-report-or-feature-request"
                            aria-describedby="waiting-for-submission"
                        >
                            <Grid container className={classes.modalContainer}
                                direction="row"
                                justify="center"
                                alignItems="center"
                            >
                                <CircularProgress />

                            </Grid>
                        </Modal>
                    </Card>
                </Container>
                <Footer />
            </Box>
        );
    }
}

export default withStyles(useStyles)(Bugs);
