import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
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
});

export default function GifCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Link
          to={{
            pathname: '/explore',
            search: '?gid=' + props.id
          }}
        >
          <CardMedia
            component="img"
            alt="Cool Gif"
            height="auto"
            image={props.src}
            title={props.src}
          />
        </Link>
        <Typography noWrap variant="h5" component="h2">{props.description}</Typography>
      </CardContent>
    </Card>
  );
}
