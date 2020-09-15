
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('./const');

AWS.config.update({
    region: 'us-east-1'
}); // Put your aws region here
//     accessKeyId: "AKIA6CQXHZIG3V72VR2I",
//     secretAccessKey: "9mhB1OCEXA6baAqMHBC17voyqhFhsIeIoj8C+kJr"
//   });


// Now lets export this function so we can call it from somewhere else
exports.sign_s3 = (req, res) => {
    console.log("sign hit");
    console.log(req.body);

    AWS.config.update({ region: 'us-east-1' })
    let s3 = new AWS.S3({ apiVersion: "2006-03-01" });

    const userid = "testUser";
    const key = "testKey";

    // check if the user is allowed to upload files

    const data = s3.createPresignedPost({
        Bucket: BUCKET_NAME,
        Fields: {
            key: key, // totally random
        },
        Conditions: [
            ["content-length-range", 0, 1000000], // content length restrictions: 0-1MB
            ["starts-with", "$Content-Type", "image/"], // content type restriction
            ["eq", "$x-amz-meta-userid", userid], // tag with userid <= the user can see this!
        ]
    });



    data.fields["x-amz-meta-userid"] = userid; // Don't forget to add this field too

    console.log("Data:");
    console.log(data);
    res.json(data);

};