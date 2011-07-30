
var currentSession = {id:"2011-08-29", fields: 2, players: ["RKE", "CDE", "MAC", "ODE", "KFO"]};
var allPlayers = [
  {id:"RKE", name:"Rudy"},
  {id:"CDE", name:"Cécile"},
  {id:"MAC", name:"Matthieu"},
  {id:"ODE", name:"Olivier"},
  {id:"KFO", name:"Katia"},
  {id:"FDE", name:"François"},
  {id:"RKZ", name:"Régis"}
];

function createNew() {
  window.location = "session.html";
  return false;
}

function addFields(howmany) {
  var fields = document.getElementById("fields");
  if (!howmany || howmany < 1) {
    howmany = 1;
  }
  for (var i = 0; i < howmany; i++) {
    var newField = fields.children[0].cloneNode("true");
    fields.appendChild(newField);
  }
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
  alert("Not implemented");
  return false;
}
