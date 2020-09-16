function scaleMat(srcElem, dstElem, file, maxDim = 500) {
        srcElem.onload = () => {
            /*global cv*/
            let inputMat = cv.imread(srcElem);
            let scaleFactor = null;

            if(isLandScape(inputMat)) {
                scaleFactor = maxDim/inputMat.cols;
            }
            else {
                scaleFactor = maxDim/inputMat.rows;
            }

            let width = Math.round(scaleFactor* inputMat.cols);
            let height = Math.round(scaleFactor * inputMat.rows);
          //  console.log("Width: " + width);
            //console.log("Height: " + height)

            let outputMat = new cv.Mat();
            let dSize = new cv.Size(width, height);
            cv.resize(inputMat, outputMat, dSize, 0, 0, cv.INTER_AREA);
            cv.imshow(dstElem, outputMat);
            inputMat.delete();
            outputMat.delete();

        }
        srcElem.src = URL.createObjectURL(file);
}

/**
 * @returns true if mat is landscape or 1:1, otherwise false.
 */
function isLandScape(mat) {
    if(mat.rows <= mat.cols) {
        return true;
    }
    return false
}

export { scaleMat };