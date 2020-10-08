 /*global cv*/
const MAX_PIXELS = 800*800;
const WEB_WIDTH = 600;
const THUMB_WIDTH = 300;

function makeThumbnail(srcElem, dstElem, onBlob) {
    let mat = loadMat(srcElem);
    mat = scaleByWidth(mat, THUMB_WIDTH);
    cv.imshow(dstElem, mat);
    mat.delete();
    dstElem.toBlob(blob => {
        onBlob(blob);
    }, 'image/jpeg', .95);
}

function doInitialLoad(srcElem, dstElem, onLoad) {
    let mat = loadMat(srcElem);
    let orignalWidth = mat.cols; 
    let originalHeight = mat.rows;

    if(mat.cols*mat.rows > MAX_PIXELS) {
        mat = scaleByWidth(mat, WEB_WIDTH)
    }
    
    cv.imshow(dstElem, mat);
    mat.delete();
    onLoad(orignalWidth, originalHeight);
}

function getWebScaledMat(srcElem) {
    let mat = loadMat(srcElem);
    if(mat.cols*mat.rows > MAX_PIXELS) {
        mat = scaleByWidth(mat, WEB_WIDTH)
    }
    return mat;
}

function scaleByWidth(mat, desiredWidth) {
    if(mat.cols === desiredWidth) {
        return mat;
    }

    let scale = desiredWidth/mat.cols;
    let newWidth = mat.cols*scale;
    let newHeight = mat.rows*scale;

    let outputMat = new cv.Mat();
    let outputSize = new cv.Size(newWidth, newHeight);
    cv.resize(mat, outputMat, outputSize, 0, 0, cv.INTER_AREA);
    mat.delete();
    return outputMat;
}

function original(srcElem, dstElem, dimensions = null) {
    let srcMat;
    if(!dimensions) {
        srcMat = getWebScaledMat(srcElem);
    }
    else {
        srcMat = cv.imread(srcElem);
        srcMat = scaleByWidth(srcMat, dimensions.width);
    }
    
    cv.imshow(dstElem, srcMat);
    srcMat.delete();
}

function grayscale(srcElem, dstElem, dimensions = null) {
    let srcMat;
    console.log("src elem: ");
    console.log(srcElem);
    if(!dimensions) {
        console.log("getting web scale.")
        srcMat = getWebScaledMat(srcElem);
    }
    else {
        srcMat = cv.imread(srcElem);
        srcMat = scaleByWidth(srcMat, dimensions.width);
    }
    
    let dstMat = new cv.Mat();
    cv.cvtColor(srcMat, dstMat, cv.COLOR_RGBA2GRAY, 0);
    cv.imshow(dstElem, dstMat);
    srcMat.delete();
    dstMat.delete();
}

function gaussianBlur(srcElem, dstElem, dimensions = null) {
    let srcMat;
    if(!dimensions) {
        srcMat = getWebScaledMat(srcElem);
    }
    else {
        srcMat = cv.imread(srcElem);
        srcMat = scaleByWidth(srcMat, dimensions.width);
    }
    
    let dstMat = new cv.Mat();
    let ksize = new cv.Size(3, 3);
    cv.GaussianBlur(srcMat, dstMat, ksize, 0, 0, cv.BORDER_DEFAULT);
    cv.imshow(dstElem, dstMat)
    srcMat.delete();
    dstMat.delete();
}

function loadMat(elem) {
    console.log(elem);
    return cv.imread(elem);
}

export { 
    grayscale, 
    gaussianBlur, 
    doInitialLoad, 
    original,
    makeThumbnail
};