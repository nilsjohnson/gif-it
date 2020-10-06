/**
 * Takes an image and scales it to so the longest side will be exactly maxDim.
 * @param {*} srcElem The input img element
 * @param {*} dstElem the outbout canvas element
 * @param {*} maxDim the chosen scale size
 * @param {*} onBlobMade callback function that takes an argument of blob, which is a jpeg of the scaled image.
 */
function scaleMat(srcElem, dstElem, maxDim = 900, onBlobMade = null) {
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

    let outputMat = new cv.Mat();
    let dSize = new cv.Size(width, height);
    cv.resize(inputMat, outputMat, dSize, 0, 0, cv.INTER_AREA);
    cv.imshow(dstElem, outputMat);
    inputMat.delete();
    outputMat.delete();

    if (onBlobMade) {
        dstElem.toBlob(onBlobMade, 'image/jpeg', .95);
    }
}

function grayscale(srcElem, dstElem, width, height) {
    let src = cv.imread(srcElem);
    let dst = new cv.Mat();

    // You can try more different parameters
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
    // cv.imshow(dstElem, dst);
    displayMat(dst, dstElem, width, height);
    src.delete();
    dst.delete();
}

function loadMat(elem) {
    return cv.imread(elem);
}

/**
 * 
 * @param {*} mat The cv.mat of the image
 * @param {*} canvas The canvas html element
 */
function displayMat(mat, canvas, width = null, height = null, onBlobMade = null) {
    if(!width || !height) {
        cv.imshow(canvas, mat);
        return;
    }

    let outputMat = new cv.Mat();
    let dSize = new cv.Size(width, height);
    cv.resize(mat, outputMat, dSize, 0, 0, cv.INTER_AREA);
    cv.imshow(canvas, outputMat);
    outputMat.delete();
}

function doInitialLoad(srcElem, dstElem, onLoad) {
    let mat = loadMat(srcElem);
    displayMat(mat, dstElem);
    let width = mat.cols; 
    let height = mat.rows;
    mat.delete();
    onLoad(width, height);
}

function gaussianBlur(srcElem, dstElem, width, height) {
    let srcMat = loadMat(srcElem);
    let dstMat = new cv.Mat();
    let ksize = new cv.Size(3, 3);
    // You can try more different parameters
    cv.GaussianBlur(srcMat, dstMat, ksize, 0, 0, cv.BORDER_DEFAULT);
    displayMat(dstMat, dstElem, width, height);
    srcMat.delete();
    dstMat.delete();
}

function biLateralFilter(srcElem, dstElem, width, height) {
    let srcMat = cv.imread(srcElem);
    let dstMat = new cv.Mat();
    cv.cvtColor(srcMat, srcMat, cv.COLOR_RGBA2RGB, 0);
    // You can try more different parameters
    cv.bilateralFilter(srcMat, dstMat, 9, 75, 75, cv.BORDER_DEFAULT);
    displayMat(dstMat, dstElem, width, height);
    srcMat.delete();
    dstMat.delete();
}

function showImage(srcElem, dstElem, width, height) {
    let srcMat = loadMat(srcElem);
    displayMat(srcMat, dstElem, width, height);
    srcMat.delete();
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

export { scaleMat, grayscale, gaussianBlur, doInitialLoad, biLateralFilter, showImage };