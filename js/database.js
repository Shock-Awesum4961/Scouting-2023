const DB_NAME = 'scouting-2023';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'matches';

var db;

// Used to keep track of which view is displayed to avoid uselessly reloading it
var current_view_pub_key;

function openDb() {
console.log("openDb ...");
var req = indexedDB.open(DB_NAME, DB_VERSION);
req.onsuccess = function (evt) {
    // Equal to: db = req.result;
    db = this.result;
    console.log("openDb DONE");
};
req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
};

req.onupgradeneeded = function (evt) {
    console.log("openDb.onupgradeneeded");
    var store = evt.currentTarget.result.createObjectStore(
    DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

    store.createIndex('team_number', 'team_number', { unique: false });
    store.createIndex('match_number', 'match_number', { unique: false });
    store.createIndex('transfered', 'transfered', { unique: false });
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


openDb();