const DB_NAME = 'scouting-2023';
const DB_VERSION = 4; // Use a long long for this value (don't use a float)
const DB_MATCH_STORE_NAME = 'matches';
const DB_PIT_STORE_NAME = 'pits';

var db;
var dbFuncQueue = [];

const CONE_NODES = ["a1","a3","a4","a6","a7","a9","b1","b3","b4","b6","b7","b9"];

// Used to keep track of which view is displayed to avoid uselessly reloading it
var current_view_pub_key;

function openDb() {
console.log("openDb ...");
var req = indexedDB.open(DB_NAME, DB_VERSION);
req.onsuccess = function (evt) {
    // Equal to: db = req.result;
    db = this.result;
    console.log("openDb DONE");
    if (typeof afterDBLoad === "function") { 
      afterDBLoad();
  }
};
req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
};

req.onupgradeneeded = function (evt) {
    console.log("openDb.onupgradeneeded");
    var thisDB = evt.target.result;
    var tx = evt.target.transaction;
    
    // Matches
    if(!thisDB.objectStoreNames.contains(DB_MATCH_STORE_NAME)) {
      var matchStore = evt.currentTarget.result.createObjectStore(
      DB_MATCH_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }

    var matchStore = tx.objectStore(DB_MATCH_STORE_NAME);

    if(!matchStore.indexNames.contains('team_number')){matchStore.createIndex('team_number', 'team_number', { unique: false });}
    if(!matchStore.indexNames.contains('match_number')){matchStore.createIndex('match_number', 'match_number', { unique: false });}
    if(!matchStore.indexNames.contains('transfered')){matchStore.createIndex('transfered', 'transfered', { unique: false });}

    //Pits
    if(!thisDB.objectStoreNames.contains(DB_PIT_STORE_NAME)) {
      var pitStore = evt.currentTarget.result.createObjectStore(
      DB_PIT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }

    var pitStore = tx.objectStore(DB_PIT_STORE_NAME);

    if(!pitStore.indexNames.contains('team_number')){pitStore.createIndex('team_number', 'team_number', { unique: false });}
    if(!pitStore.indexNames.contains('transfered')){pitStore.createIndex('transfered', 'transfered', { unique: false });}
    
};
}

  /**
   * @param {string} store_name
   * @param {string} mode either "readonly" or "readwrite"
   */
  function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  }

  function clearObjectStore() {
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req = store.clear();
    req.onsuccess = function(evt) {
      displayActionSuccess("Store cleared");
      displayPubList(store);
    };
    req.onerror = function (evt) {
      console.error("clearObjectStore:", evt.target.errorCode);
      displayActionFailure(this.error);
    };
  }

    function getMatchesStore() {
        var tx = db.transaction("matches", 'readwrite');
        return tx.objectStore("matches");
    }

    function getPitStore() {
        var tx = db.transaction("pits", 'readwrite');
        return tx.objectStore("pits");
    }

    function addMatch(obj) {
        var store = getMatchesStore();
        var req;
        try {
          req = store.add(obj);
        } catch (e) {
          if (e.name == 'DataCloneError')
            displayActionFailure("This engine doesn't know how to clone a Blob, " +
                                 "use Firefox");
          throw e;
        }
        req.onsuccess = function (evt) {
          console.log("Insertion in DB successful");
        };
        req.onerror = function() {
          console.error("addPublication error", this.error);
        };
    }

    function getMatchById(id){
      return new Promise((resolve, reject) =>{
        let store = getMatchesStore();
        req = store.get(id);
        req.onsuccess = function(event) {
          resolve(event.target.result);
        };
      });
    }

    function getAllMatches(qry){
      return new Promise((resolve, reject) =>{
        let store = getMatchesStore();
        req = store.getAll();
        req.onsuccess = function(event) {
          resolve(event.target.result);
        };
      });
    }

    function getAllMatchesIndexed(index, qry){
      return new Promise((resolve, reject) =>{
        let store = getMatchesStore().index(index);
        req = store.getAll(qry);
        req.onsuccess = function(event) {
          resolve(event.target.result);
        };
      });
    }

    function getAllPits(){
      return new Promise((resolve, reject) =>{
        let store = getPitStore();
        req = store.getAll();
        req.onsuccess = function(event) {
          resolve(event.target.result);
        };
      });
    }
    function getAllPitsIndexed(index, qry){
      return new Promise((resolve, reject) =>{
        let store = getPitStore().index(index);
        req = store.getAll(qry);
        req.onsuccess = function(event) {
          resolve(event.target.result);
        };
      });
    }

    function updateMatch(id, data){
      return new Promise((resolve, reject) =>{
        let store = getMatchesStore();
        req = store.put(data);
        req.onsuccess = function(event){
        resolve("updated match: ", id)
        }
      });
    }

    function addPit(obj) {
        var store = getPitStore();
        var req;
        try {
          req = store.add(obj);
        } catch (e) {
          if (e.name == 'DataCloneError')
            displayActionFailure("This engine doesn't know how to clone a Blob, " +
                                 "use Firefox");
          throw e;
        }
        req.onsuccess = function (evt) {
          console.log("Insertion in DB successful");
        };
        req.onerror = function() {
          console.error("addPublication error", this.error);
        };
    }

    function getAllMatchesForTeam(teamNumber){
      return new Promise((resolve, reject) =>{
        getAllMatchesIndexed("team_number", teamNumber).then(function(returnData){
          resolve(returnData)
        });
      });
    }

    function getAllDistinctTeamNumbers(){
      let distinctTeamNumbers = [];
      return new Promise((resolve, reject) =>{
        let store = getMatchesStore().index("team_number");
        req = store.getAll();
        req.onsuccess = function(event) {
          event.target.result.forEach(element => {
            if(!distinctTeamNumbers.includes(element['team_number'])){
              distinctTeamNumbers.push(element['team_number'])
            }
          });
          resolve(distinctTeamNumbers);
        };
      });

    }

    function buildAggregateData(){
      let resultData = [];
      let promises = []
      return new Promise((resolve, reject) => {
        getAllDistinctTeamNumbers().then(function(teamNumbers){
          teamNumbers.forEach(team => {
            let teamData = {};
            promises.push(
              getAllMatchesForTeam(team).then(function(teamMatches){
                let totalAutoScoreAllMatches = 0;
                let totalTeleopScoreAllMatches = 0;
                let coneCount = 0;
                let cubeCount = 0;
                let defCount = 0;
                let winCount = 0;

                teamMatches.forEach(match => { 
                  totalAutoScoreAllMatches += match['auton_grid_total'];
                  totalTeleopScoreAllMatches += match['teleop_grid_total'];
                  let nodeList = match['autonNodeList'].concat(match['teleopNodeList']);
                  nodeList.forEach(node => {
                    if(CONE_NODES.includes(node)){
                      coneCount++;
                    } else {
                      cubeCount++;
                    }
                  })
                  if(match['defensive']){
                    defCount++;
                  }
                  if(match['win']){
                    winCount++;
                  }
                })

                teamData['team_number'] = team;
                //Math.round((num + Number.EPSILON) * 100) / 100
                teamData['avg_score'] = (totalAutoScoreAllMatches + totalTeleopScoreAllMatches) / teamMatches.length;
                teamData['avg_score'] = Math.round((teamData['avg_score'] + Number.EPSILON) * 100) / 100
                teamData['avg_auto_score'] = (totalAutoScoreAllMatches) / teamMatches.length;
                teamData['avg_auto_score'] = Math.round((teamData['avg_auto_score'] + Number.EPSILON) * 100) / 100
                if(cubeCount == coneCount){
                  teamData['fav_game_piece'] = "Both"
                } else if(cubeCount > coneCount) {
                  teamData['fav_game_piece'] = "Cube"
                } else {
                  teamData['fav_game_piece'] = "Cone"
                }
                if(defCount > teamMatches.length/2){
                  teamData['defensive'] = true;
                } else {
                  teamData['defensive'] = false;
                }
                teamData['win_percent'] = winCount / teamMatches.length
                teamData['win_percent'] = Math.round((teamData['win_percent'] + Number.EPSILON) * 100) / 100

                resultData.push(teamData);

              })
              )
          });

          Promise.all(promises).then(function(){
            resolve(resultData)
          });

        })
      });
    }



  openDb();