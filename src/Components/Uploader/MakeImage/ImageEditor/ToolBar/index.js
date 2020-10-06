import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Grid, IconButton, Box, Typography } from "@material-ui/core";
import CropIcon from '@material-ui/icons/Crop';
import FilterPalette from './FilterPalette';

import FilterIcon from '@material-ui/icons/Filter';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';

import { withStyles } from '@material-ui/core/styles';
import ResizePalette from './ResizePalette';

const useStyles = theme => ({
    lolercopter: {
        width: "100%"
    }
});


class ToolBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filtersAnchorEl: null,
            cropAnchorEl: null,
            resizeAnchorEl: null
        };
    }

    // filters
    openFiltersMenu = (event) => {
        this.setState({
            filtersAnchorEl: event.currentTarget
        });
    }

    closeFiltersMenu = () => {
        this.setState({
            filtersAnchorEl: null
        });
    };

    // crop
    openCropMenu = (event) => {
        this.setState({
            cropAnchorEl: event.currentTarget
        });
    }

    closeCropMenu = () => {
        this.setState({
            cropAnchorEl: null
        });
    };

    // resize
    openResizeMenu = (event) => {
        this.setState({
            resizeAnchorEl: event.currentTarget
        });
    }

    closeResizeMenu = () => {
        this.setState({
            resizeAnchorEl: null
        });
    };

    render() {
        const { filtersAnchorEl, cropAnchorEl, resizeAnchorEl } = this.state;

        return (
            <Grid item container
                direction="row"
                justify="space-evenly"
                alignItems="center"
                xs={12}
            >
                {/* Filters */}
                <IconButton aria-label="crop" onClick={this.openFiltersMenu} >
                    <FilterIcon />
                    <Typography variant="subtitle1">Edit Image</Typography>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={filtersAnchorEl}
                    keepMounted
                    open={Boolean(filtersAnchorEl)}
                    onClose={this.closeFiltersMenu}
                >
                    <FilterPalette 
                        grayscale={this.props.grayscale}
                        gaussianBlur={this.props.gaussianBlur}
                        original={this.props.original}
                    />


                </Menu>

                {/* TODO Cropping */}
                {/* <IconButton aria-label="crop" onClick={this.openCropMenu} >
                    <CropIcon />
                    <Typography variant="subtitle1">Crop</Typography>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={cropAnchorEl}
                    keepMounted
                    open={Boolean(cropAnchorEl)}
                    onClose={this.closeCropMenu}
                >
                    <FilterPalette />
                </Menu> */}

                {/* Resize */}
                <IconButton aria-label="crop" onClick={this.openResizeMenu} >
                    <AspectRatioIcon />
                    <Typography variant="subtitle1">Resize</Typography>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={resizeAnchorEl}
                    keepMounted
                    open={Boolean(resizeAnchorEl)}
                    onClose={this.closeResizeMenu}
                >
                    <ResizePalette
                        dimensions={this.props.dimensions}
                        setNewSize={this.props.setNewSize}
                    />
                </Menu>

            </Grid>
        );
    }
}

export default withStyles(useStyles)(ToolBar);

