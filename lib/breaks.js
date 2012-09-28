var projects = require('./projects');
var days = require('./days');

var isPaused = function(day){
  var last = day.breaks.slice(-1)[0];
  if (!last) {
    return false;
  }
  return !last.end;
};
exports.isPaused = isPaused;

exports.create = function(id, params, date, callback){
  var project = projects.use(id);
  days.get(project, date, function(err, day){
    if (err) {
      return callback({error: true, message: "Day hasn't been started yet!" });
    }
    add(project, params, day, callback);
  });
};

var add = function(project, params, day, callback){
  var type = params.type;
  if (day.end) {
    return callback({error: true, message: 'Day already over!'});
  }
  if (type === 'pause') {
    pause(project, params.time, day, callback);
  } else if (type === 'resume') {
    resume(project, params.time, day, callback);
  } else {
    return callback({error: true, message: 'Unknown action!'});
  }
};

var pause = function(project, start, day, callback){
  var paused = isPaused(day);
  if (paused) {
    callback({error: true, message: 'Day is already paused!'});
  } else {
    day.breaks.push({start: start});
    days.insert(project, day, null, callback);
  }
};

var resume = function(project, end, day, callback){
  var paused = isPaused(day);
  if (paused) {
    day.breaks.slice(-1)[0].end = end;
    days.insert(project, day, null, callback);
  } else {
    callback({error: true, message: "Day hasn't been paused yet!"});
  }
};