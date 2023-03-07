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
};
}