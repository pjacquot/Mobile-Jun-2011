// Constant months of year
var months = ["January", "Ferbruary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Regular expression for dates in the form YYYY-MM-DD
var dateRegex=/^(20[0-9]{2})-([0-9]{2})-([0-9]{2})$/;

// All players
var allPlayers = {};

// Application's URL without the hashtag
var baseLocation = window.location.protocol + "//" + window.location.host + window.location.pathname;

// Session currently displayed
var currentSession;

// Ajax calls for synchronization (only one call at a time)
var ajax;

// Detect hash change events
window.onhashchange = function() {
  if (window.location.hash) {
    editSession(location.hash.substring(1));
  } else {
    showList();
  }
}

// For deprecated browsers (all except Firefox !), copied from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
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

// Click on the application title: show main page
function home() {
  if (window.location == baseLocation) {
    window.location.reload();
  } else {
    window.location = baseLocation;
  }
  return false;
}

// Application just launched: synchronize if no data or init otherwise
function init() {
  if (typeof localStorage == "undefined") {
    wait("Browser not compatible");
  } else if (localStorage.length == 0) {
    // For testing !
    localStorage["2011-08-29"] = JSON.stringify({id:"2011-08-29", fields: 2, players: ["RKE", "CDE", "MAC", "ODE", "KFO"]});
    localStorage["2011-09-05"] = JSON.stringify({id:"2011-09-05", fields: 1, players: ["RKE", "CDE", "ODE"]});

    resync();
  } else {
    initPlayers();
    currentPage();
  }
}

// Display page depicted by current URL and hashtag
function currentPage() {
  if (window.location.hash) {
    editSession(location.hash.substring(1));
  } else {
    showList();
  }
}

// Initialize players list from local storage
function initPlayers() {
  // Get players from localStorage
  var players = localStorage.getItem("players");
  if (!players) return;
  allPlayers = JSON.parse(players);

  // Clean all players
  var playersSelector = document.getElementById("playersSelector");
  while (playersSelector.children[0])  {
    playersSelector.removeChild(playersSelector.children[0]);
  }

  // Add players to selector
  for (player in allPlayers) {
    if (player.charAt(0) != "_") {
      var item = document.createElement("option");
      item.value = player;
      item.textContent = allPlayers[player].name;
      playersSelector.appendChild(item);
    } else {
      delete allPlayers[player];
    }
  }
}

// Asynchronous Ajax callback
function dbLoaded() {
  if (ajax.readyState == 4) { // Loading terminated ?
    if (ajax.status == 200 || ajax.status == 304) { // HTTP error occured ?
      document.getElementById('lastsync').firstChild.nodeValue = "Online";

      var response = JSON.parse(ajax.responseText);
      if (response.error) { // CouchDB error occured ?
        alert("Error " + response.error + ": " + response.reason);
      } else {
        // Update local storage
        for (var i = 0; i < response.rows.length; i++) {
          var row = response.rows[i];
          if (row.id == "players") {
            // this is the players record
            localStorage.setItem("players", JSON.stringify(row.doc));
          } else {
            // TODO this is a session record
          }
        }
      }
    } else if (ajax.status == 0) {
      // We are just offline: don't make user anxious
      document.getElementById('lastsync').firstChild.nodeValue = "Offline";
    } else {
      alert("Error " + ajax.status + ": " + ajax.responseText);
    }

    // Initialize players list
    initPlayers();

    // Show contents pointed by current URL (taking into account hashtag presence)
    currentPage();
  }
}

// Show the wait screen displaying a specific message
function wait(message) {
  document.getElementById("edit-mode").style.display = "none";
  document.getElementById("wait-mode").style.display = "block";
  document.getElementById("list-mode").style.display = "none";
  document.getElementById("wait-message").firstChild.nodeValue = message;
}

// Lauches AJAX Synchronization
function resync() {
  document.getElementById('lastsync').firstChild.nodeValue = " ";
  wait("Syncing...");

  // Reload everything
  ajax = new XMLHttpRequest();
  ajax.onreadystatechange = dbLoaded;
  ajax.open('GET', 'https://patj.eu/cdb/w3c-mobile/_all_docs?include_docs=true');
  ajax.setRequestHeader('Content-Type', 'application/json');
  ajax.send(null);

  return false;
}

// Show list screen
function showList() {
  document.getElementById("edit-mode").style.display = "none";
  document.getElementById("wait-mode").style.display = "none";

  currentSession = null;

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
    var key = localStorage.key(it);
    if (key == "players") continue;
    var session = JSON.parse(localStorage.getItem(key));
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
      if (allPlayers[player]) {
	playerName = allPlayers[player].name;
      } else {
        playerName = "?" + player + "?";
      }
      content += ' <span class="img player"></span><span class="player-name"> ' + playerName + '</span> ';
    }
    content += '</div> </div>';

    item.innerHTML = content;
    list.appendChild(item);
  }

  document.getElementById("list-mode").style.display = "block";
}

// Show edition screen
function editSession(sessionId) {
  var match = dateRegex.exec(sessionId);
  if (!match) {
    alert("Invalid sessions date hashtag format, must be: #YYYY-MM-DD");
    window.location = baseLocation;
    return;
  }

  document.getElementById("wait-mode").style.display = "none";
  document.getElementById("list-mode").style.display = "none";

  var storedValue = localStorage.getItem(sessionId);
  if (storedValue) {
    currentSession = JSON.parse(storedValue);
  } else {
    currentSession = {id:sessionId, fields: 1, players: []};
  }

  document.getElementById("date").firstChild.nodeValue =
    match[3] + " " + months[parseInt(match[2], 10) - 1] + " " + match[1];

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
  var select = document.getElementById("playersSelector");
  for (var i = 0; i < select.options.length; i++) {
    var option = select.options[i];
    option.selected = currentSession.players.indexOf(option.value) != -1;
  }
  updatePlayers();

  document.getElementById("edit-mode").style.display = "block";
}

// Create a new session
function createNew() {
  var date = document.getElementById("newdate").value;
  if (dateRegex.test(date)) {
    window.location = baseLocation + "#" + date;
  } else {
    alert("Invalid date format, must be: YYYY-MM-DD");
  }
  
  return false;
}

// Add a badminton field to the session
function addField() {
  var fields = document.getElementById("fields");
  var newField = fields.children[0].cloneNode("true");
  fields.appendChild(newField);
  currentSession.fields++;
  document.getElementById('fieldCount').firstChild.nodeValue = currentSession.fields;
  return false;
}

// Remove a badminton field from the session
function removeField() {
  if (currentSession.fields > 1) {
    var fields = document.getElementById("fields");
    fields.removeChild(fields.children[0]);
    --currentSession.fields;
    document.getElementById('fieldCount').firstChild.nodeValue = currentSession.fields;
  }
  return false;
}

// Update session player according the selection list
function updatePlayers() {
  var select = document.getElementById("playersSelector");
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

// Save the session
function save() {
  localStorage.setItem(currentSession.id, JSON.stringify(currentSession));
  window.location = baseLocation;
  return false;
}

// Delete the session
function remove() {
  localStorage.removeItem(currentSession.id);
  window.location = baseLocation;
  return false;
}
