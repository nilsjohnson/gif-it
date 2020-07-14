/**
 * 
 * @param {*} tags_str A string of tags from the user
 * @return an array of from the input, split by words. 
 * Each Element will be alphanumeric and lowercase.
 */
function splitTags(tags_str) {
    let regex = /\w+/g;
    let arr = tags_str.match(regex);
    if(arr) {
        for(let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].toLowerCase();
        }
        return arr;
    }
    return null;
}

exports.splitTags = splitTags;