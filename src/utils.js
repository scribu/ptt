function mapObj(obj, callback) {
	Object.keys(obj).forEach(function(key) {
		callback(key, obj[key]);
	});
}

function debug(obj) {
	mapObj(obj, function(key, value) {
		console.log(key + ': ' + JSON.stringify(value));
	});
}

function format() {
	var args = Array.prototype.slice.call(arguments);
	return args.shift().replace(/\{\}/g, function(){
		return args.shift();
	});
}
 
function secondsToTime(seconds) {
	var hours, minutes;

	if (seconds === undefined) {
		hours = minutes = 0;
	} else {
		hours = Math.floor(seconds / 3600);
		minutes = Math.floor((seconds % 3600) / 60);
	}

	var str = format('{}h', hours);

	if (minutes) {
		str+= format(' {}m', minutes);
	}

	return str;
}

exports.mapObj = mapObj;
exports.format = format;
exports.debug = debug;
exports.secondsToTime = secondsToTime;
