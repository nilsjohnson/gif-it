import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { formatBytes } from '../../util/util';

const useStyles = makeStyles({
  root: {
    minWidth: 700,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  status: {
    marginTop: 4,
    marginBottom: 4
  }
});

export default function UploadProgressBox(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        
        <Typography>
          File: {props.fileName}
        </Typography>
        
        <Typography>
          Size: {formatBytes(props.size)}
        </Typography>
        
        <Typography>
          Uploaded: {props.percentUploaded}%
        </Typography>
        
        <Typography className={classes.status}>
          {props.message}
        </Typography>

      </CardContent>
      <CardActions>
        <Button onClick={props.convert} size="small">Convert To Gif!</Button>
        <Button onClick={props.cancelUpload} size="small">Cancel</Button>
      </CardActions>
    </Card>
  );
}

