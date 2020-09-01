function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function saveAuthToken(token) {
    writeCookie("auth_token", JSON.stringify(token), 60*60*24*30);
}

function readAuthToken() {
	console.log("arrrr");
	let token = JSON.parse(readCookie("auth_token"));
	console.log("here is the auth token: " + token);
	return token;
}

function readCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
	  var c = ca[i];
	  while (c.charAt(0) === ' ') {
		c = c.substring(1);
	  }
	  if (c.indexOf(name) === 0) {
		  return c.substring(name.length, c.length);
	  }
	}
	return null;
  }
  
  
function writeCookie(variable, value, expires_seconds) {
	var d = new Date();
	d = new Date(d.getTime() + 1000 * expires_seconds);
	document.cookie = variable + '=' + value + '; expires=' + d.toGMTString() + ';';
}

function deleteCookie(variable) {
	document.cookie = variable + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export { formatBytes, readCookie, writeCookie, deleteCookie, saveAuthToken, readAuthToken }