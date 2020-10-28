import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import PhotoIcon from '@material-ui/icons/Photo';
import CardActions from '@material-ui/core/CardActions';
import { Collapse, Box, CardContent, CardMedia, Card, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import clsx from 'clsx';
import { ShareBox } from '../MediaBox/ShareBox';
import { dateToAge } from '../../util/util';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  right: {
    marginLeft: 'auto'
  },
  typeBox: {
    marginTop: -8
  }
}));

export default function MediaCard(props) {
  const classes = useStyles();
  const { media = {}, showUser = true } = props;
  console.log(media);

  const [expanded, setExpanded] = React.useState(false);

  const makeTitle = () => {
    if(media.albumTitle) {
      return media.albumTitle
    }
    if(media.description) {
      return media.description.split('\n');
    }
    else {
      return media.fileName;
    }
  }

  const getShareBox = () => {
    if (media.albumId) {
      return (
        <ShareBox
          links={[{ title: "share album", link: `https://gif-it.io/explore?albumId=${media.albumId}` }]}
        />
      );
    }
    else {
      return (
        <ShareBox
          links={[{ title: "share media", link: `https://gif-it.io/explore?mId=${media.id}` }]}
        />
      );
    }

  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className={classes.root}>
      <CardContent>
        <Link
          to={`${media.albumId ? `/explore?albumId=${media.albumId}` : `/explore?mId=${media.id}`}`}
        >
          <CardMedia
            component="img"
            alt={media.description}
            height="auto"
            image={media.thumbName}
            title={media.fileName}
          />
        </Link>
      </CardContent>

      <CardActions disableSpacing={true}>
        <Box className={classes.typeBox} m={1}>
          {media.albumId ? <PhotoLibraryIcon /> : <PhotoIcon />}
        </Box>
        <Box>
          <Typography variant="h6"
            component="h5">
            { makeTitle() }
          </Typography>
          <Typography noWrap
            variant="body1"
            component="h5">
            {`${media.numAlbumItems === 0 ? 1 : media.numAlbumItems} item${media.numAlbumItems > 1 ? 's' : ''}`}
          </Typography>
        </Box>
      </CardActions>
      <CardActions disableSpacing={true}>
        <Box>
          {showUser &&
            <Typography color="textSecondary"
              noWrap={true} variant="subtitle1"
              component="h5">
              {`uploaded by ${media.username}`}
            </Typography>}
          <Typography color="textSecondary"
            noWrap={true} variant="subtitle2"
            component="h5">
            {dateToAge(new Date(media.date))}
          </Typography>
        </Box>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ShareIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box p={1}>
        {getShareBox()}
        </Box>
      </Collapse>
    </Card>
  );
}
