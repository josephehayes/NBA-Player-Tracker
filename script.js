//Selectors
const playerSearch = document.querySelector('#drop-box-player input');
const searchButton = document.getElementById('searchbutton');
const saveCheckbox = document.getElementById("save-checkbox");
const savedPlayers = document.getElementById("saved-players");
const searchResultBox = document.getElementById("search-container");
const clearButton = document.getElementById("clear-games");
const results = document.querySelector('#search-results');
const teamDiv = document.querySelector('#team');
const stats = document.querySelector('#player-stats');
const schedule = document.querySelector("#schedule");

//Variables
let playerSearchResults = [];
let team;
let selectedPlayerId;
let selectedPlayerTeam;
let selectedPlayerInfo;
let teamArr = [];
let eventList;

//localStorage
let playerResultsArr = JSON.parse(localStorage.getItem("savedPlayers")) ?? [];

//API Links
const ticketApi = "https://app.ticketmaster.com/discovery/v2/events?";
const ticketKey = "apikey=YUtofAEqmAbWVA8ezVcGnMFbUZoJeDvh";
const playerApi = "https://www.balldontlie.io/api/v1/players";

//Functions
//Search funtion
function getPlayersApi(playerName) {
    let playerObj;
    let playerData;
    playerSearchResults = [];
    fetch(playerApi + "?per_page=100&search=" + playerName)
    .then((response) => response.json())
    .then((result) => {
        playerData = result.data
        let output = '';
        playerData.forEach(player => {
            playerObj = {};
            playerObj.playerId = player.id;
            playerObj.playerName = player.first_name + " " + player.last_name;
            playerObj.teamName = player.team.name;
            playerObj.pos = player.position;
            playerSearchResults.push(playerObj);
            if (player.position != "") {
                team = player.team.id;
                output += `<p id =${player.id} onclick='displayStats("${player.first_name + " " + player.last_name}")
                ' team=${playerObj.teamName}'>${playerObj.playerName} | ${playerObj.teamName}</p>`;
            }
        })
        results.innerHTML = output;
        searchResultBox.style.display = "block";
    })
}

//Display Stats function
function displayStats(fullName) {
    selectedPlayerId = event.target.id;
    playerName = fullName;
    fetch('https://www.balldontlie.io/api/v1/season_averages?player_ids[]=' + selectedPlayerId)
    .then((response) => response.json())
    .then((result) => {
        let output = '';
        if ( result.data.length >= 1) {
        output += "<p> Points: " + result.data[0].pts + "</p>";
        output += "<p> Rebounds: " + result.data[0].reb + "</p>";
        output += "<p> Assists: " + result.data[0].ast + "</p>";
        output += "<p> Steals: " + result.data[0].stl + "</p>";
        output += "<p> Blocks: " + result.data[0].blk + "</p>";
        } else {
            output = "<p> No stats to display for the current season </p>"
        }
        stats.innerHTML = output;
    })
    fetch('https://www.balldontlie.io/api/v1/players/' + selectedPlayerId)
    .then((response) => response.json())
    .then((result) => {
        selectedPlayerInfo = {};
        selectedPlayerInfo.id = result.id;
        selectedPlayerInfo.name = fullName;
        selectedPlayerInfo.team = result.team.name;
        let output = '';
        output += " Team: " + result.team.abbreviation;
        teamDiv.innerHTML = output;
        saveCheckbox.style = "display: flex"
        getTicketApi(result.team.name);
    })
}

//Get Ticketmaster Games
function getTicketApi(teamName) {
    fetch(ticketApi + ticketKey + "&keyword=" + teamName + "&promoterId=695&size=10")
    .then((response) => response.json())
    .then((result) => {
        eventList = result._embedded.events;
        eventList.sort(function(a, b) {
            return new Date(a.dates.start.localDate) - new Date(b.dates.start.localDate);
        });
        displaySchedule(eventList);
    })
}

//Display Ticketmaster Data
function displaySchedule(data) {
    let output = "";
    data.forEach(game => {
        output += "<p><a href='" + game.url + "'>" + game.dates.start.localDate + " " + game.name + "</a></p>";
    })
    schedule.innerHTML = output;
}

//Display saved players
function displaySavedPlayers() {
    playerResultsArr = JSON.parse(localStorage.getItem("savedPlayers")) ?? [];
    let output = "";
    playerResultsArr.forEach(player => {
        output += `<p id=${player.id} onclick="displayStats('${player.name}')" team=${player.team}> ${player.name} | ${player.team} </p>`;
    })
    savedPlayers.innerHTML = output;
}

//EventListeners
searchButton.addEventListener('click', function() {
    getPlayersApi(playerSearch.value);
})

clearButton.addEventListener("click", () => {
    localStorage.clear();
    savedPlayers.innerHTML = "";
    displaySavedPlayers();
})

saveCheckbox.addEventListener("click", function () {
  let exist = false;
  if (playerResultsArr.length >= 1) {
    playerResultsArr.forEach((player) => {
      if (player.id === selectedPlayerInfo.id) {
        exist = true;
      }
    });
  }
  if (selectedPlayerInfo && !exist) {
    playerResultsArr.push(selectedPlayerInfo);
    localStorage.setItem("savedPlayers", JSON.stringify(playerResultsArr));
  }
  displaySavedPlayers();
});

//main
displaySavedPlayers();