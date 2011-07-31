// Constant months of year
var months = ["January", "Ferbruary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// All players
var allPlayers = {
  RKE: "Rudy",
  CDE: "Cécile",
  MAC: "Matthieu",
  ODE: "Olivier",
  KFO: "Katia",
  FDE: "François",
  RKZ: "Régis"
};

// For all deprecated browsers (all except Firefox !), copied from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";
    if (this === void 0 || this === null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (n !== n) { // shortcut for verifying if it's NaN
         n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  }
}

var baseLocation = window.location.protocol + "//" + window.location.host + window.location.pathname;
var currentSession;

function home() {
  if (window.location == baseLocation) {
    window.location.reload();
  } else {
    window.location = baseLocation;
  }
}

function resync() {
  localStorage.clear();

  // For testing purposes !
  localStorage["2011-08-29"] = JSON.stringify({id:"2011-08-29", fields: 2, players: ["RKE", "CDE", "MAC", "ODE", "KFO"]});
  localStorage["2011-09-05"] = JSON.stringify({id:"2011-09-05", fields: 1, players: ["RKE", "CDE", "ODE"]});

  window.location.reload();
  return false;
}

function synchronize() {
  document.getElementById("edit-mode").style.display = "none";
  document.getElementById("sync-mode").style.display = "block";
  document.getElementById("list-mode").style.display = "none";

  //setTimeout(window.location.hash ? 'editSession("'+location.hash.substring(1)+'")' : "showList()", 1000);
  
  if (window.location.hash) {
    editSession(location.hash.substring(1));
  } else {
    showList();
  }

  return false;
}

window.onhashchange = function() {
  if (window.location.hash) {
    editSession(location.hash.substring(1));
  } else {
    showList();
  }
}

function showList() {
  document.getElementById("edit-mode").style.display = "none";
  document.getElementById("sync-mode").style.display = "none";

  var date = new Date();
  document.getElementById("newdate").value =
    date.getFullYear() + "-" +
    (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" + 
    (date.getDate() < 10 ? "0" : "") + date.getDate();

  // Make list
  var list = document.getElementById("list-mode");
  while (list.children[1])  {
    list.removeChild(list.children[1]);
  }

  for (var it = 0; it < localStorage.length; it ++) {
    var session = JSON.parse(localStorage.getItem(localStorage.key(it)));
    var item = document.createElement("a");
    item.className = "session";
    item.href = "#" + session.id;
    var content = '<h2 class="date"><span class="day">' + parseInt(session.id.substring(8, 10), 10) +
      '</span><span class="month">' + months[parseInt(session.id.substring(5, 7), 10) - 1]  +
      '</span><span class="year">' + session.id.substring(0, 4) +'</span></h2>';
    content += '<div class="details"> <div class="fields">' + session.fields + ' field';
    if (session.fields > 1) {
      content += "s";
    }
    for (var i = 0; i < session.fields; i++) {
      content += ' <span class="img-2-1 field"></span> ';
    }
    content += '</div> <div class="players">' + session.players.length + ' player';
    if (session.players.length > 1) {
      content += "s";
    }
    for (var i = 0; i < session.players.length; i++) {
      var player = session.players[i];
      content += ' <span class="img player"></span><span class="player-name"> ' + allPlayers[player] + '</span> ';
    }
    content += '</div> </div>';

    item.innerHTML = content;
    list.appendChild(item);
  }

  document.getElementById("list-mode").style.display = "block";
}

function editSession(sessionId) {
  document.getElementById("sync-mode").style.display = "none";
  document.getElementById("list-mode").style.display = "none";
  
  var storedValue = localStorage.getItem(sessionId);
  if (storedValue) {
    currentSession = JSON.parse(storedValue);
  } else {
    currentSession = {id:sessionId, fields: 1, players: []};
  }

  document.getElementById("date").firstChild.nodeValue =
    sessionId.substring(8, 10) + " " +
    months[parseInt(sessionId.substring(5, 7), 10) - 1] + " " +
    sessionId.substring(0, 4);

  // Update fields
  var fields = document.getElementById("fields");
  while (fields.children[1])  {
    fields.removeChild(fields.firstChild);
  }
  for (var i = 1; i < currentSession.fields; i++) {
    var newField = fields.children[0].cloneNode("true");
    fields.appendChild(newField);
  }
  document.getElementById('fieldCount').firstChild.nodeValue = currentSession.fields;

  // Update players
  var select = document.getElementById("selectPlayers");
  for (var i = 0; i < select.options.length; i++) {
    var option = select.options[i];
    option.selected = currentSession.players.indexOf(option.value) != -1;
  }
  updatePlayers();

  document.getElementById("edit-mode").style.display = "block";
}

function createNew() {
  var date = document.getElementById("newdate").value;
  if (date.length != 10) {
    alert("Invalid date format");
    return false;
  }

  window.location = baseLocation + "#" + date;
  return false;
}

function addField() {
  var fields = document.getElementById("fields");
  var newField = fields.children[0].cloneNode("true");
  fields.appendChild(newField);
  currentSession.fields++;
  document.getElementById('fieldCount').firstChild.nodeValue = currentSession.fields;
  return false;
}

function removeField() {
  if (currentSession.fields > 1) {
    var fields = document.getElementById("fields");
    fields.removeChild(fields.children[0]);
    --currentSession.fields;
    document.getElementById('fieldCount').firstChild.nodeValue = currentSession.fields;
  }
  return false;
}

function updatePlayers() {
  var select = document.getElementById("selectPlayers");
  var players = document.getElementById("players");

  while (players.firstChild)  {
    players.removeChild(players.firstChild);
  }

  currentSession.players = [];
  for (var i = 0; i < select.options.length; i++) {
    var option = select.options[i];
    if (option.selected) {
      var newPlayer = document.createElement("span");
      newPlayer.innerHTML = '<span class="imgbig player" data-player-id="' + option.value + '"><br/><br/><br/><br/><br/><br/>' + option.firstChild.nodeValue + '</span>';
      players.appendChild(newPlayer);
      currentSession.players.push(option.value);
    }
  }
  document.getElementById('playerCount').firstChild.nodeValue = currentSession.players.length;
}

function save() {
  localStorage.setItem(currentSession.id, JSON.stringify(currentSession));
  window.location = baseLocation;
  return false;
}

function cancel() {
  window.location = baseLocation;
  return false;
}
