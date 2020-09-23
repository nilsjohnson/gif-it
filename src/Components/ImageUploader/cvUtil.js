/**
 * Takes an image and scales it to so the longest side will be exactly maxDim.
 * @param {*} srcElem The input img element
 * @param {*} dstElem the outbout canvas element
 * @param {*} maxDim the chosen scale size
 * @param {*} onBlobMade callback function that takes an argument of blob, which is a jpeg of the scaled image.
 */
function scaleMat(srcElem, dstElem, maxDim, onBlobMade = null) {
    srcElem.onload = () => {
        /*global cv*/
        let inputMat = cv.imread(srcElem);
        let scaleFactor = null;

        if (isLandScape(inputMat)) {
            scaleFactor = maxDim / inputMat.cols;
        }
        else {
            scaleFactor = maxDim / inputMat.rows;
        }

        let width = Math.round(scaleFactor * inputMat.cols);
        let height = Math.round(scaleFactor * inputMat.rows);
        //  console.log("Width: " + width);
        //console.log("Height: " + height)

        let outputMat = new cv.Mat();
        let dSize = new cv.Size(width, height);
        cv.resize(inputMat, outputMat, dSize, 0, 0, cv.INTER_AREA);
        cv.imshow(dstElem, outputMat);
        inputMat.delete();
        outputMat.delete();

        if(onBlobMade) {
            dstElem.toBlob(onBlobMade, 'image/jpeg', .95);
        }
        

    }
}

/**
 * @returns true if mat is landscape or 1:1, otherwise false.
 */
function isLandScape(mat) {
    if (mat.rows <= mat.cols) {
        return true;
    }
    return false
}

export { scaleMat };