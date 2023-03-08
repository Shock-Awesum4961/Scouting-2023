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
        var store = getMatchesStore();
        req = store.get(id);
        req.onsuccess = function(event) {
          resolve(event.target.result);
        };
      });
    }

    function getAllMatches(){
      return new Promise((resolve, reject) =>{
        var store = getMatchesStore();
        req = store.getAll();
        req.onsuccess = function(event) {
          resolve(event.target.result);
        };
      });
    }


    /**
   * @param {IDBObjectStore=} store
   */
  function displayPubList(store) {
    console.log("displayPubList");

    if (typeof store == 'undefined')
      store = getObjectStore(DB_STORE_NAME, 'readonly');

    var pub_msg = $('#pub-msg');
    pub_msg.empty();
    var pub_list = $('#pub-list');
    pub_list.empty();
    // Resetting the iframe so that it doesn't display previous content
    newViewerFrame();

    var req;
    req = store.count();
    // Requests are executed in the order in which they were made against the
    // transaction, and their results are returned in the same order.
    // Thus the count text below will be displayed before the actual pub list
    // (not that it is algorithmically important in this case).
    req.onsuccess = function(evt) {
      pub_msg.append('<p>There are <strong>' + evt.target.result +
                     '</strong> record(s) in the object store.</p>');
    };
    req.onerror = function(evt) {
      console.error("add error", this.error);
      displayActionFailure(this.error);
    };

    var i = 0;
    req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;

      // If the cursor is pointing at something, ask for the data
      if (cursor) {
        console.log("displayPubList cursor:", cursor);
        req = store.get(cursor.key);
        req.onsuccess = function (evt) {
          var value = evt.target.result;
          var list_item = $('<li>' +
                            '[' + cursor.key + '] ' +
                            '(biblioid: ' + value.biblioid + ') ' +
                            value.title +
                            '</li>');
          if (value.year != null)
            list_item.append(' - ' + value.year);

          if (value.hasOwnProperty('blob') &&
              typeof value.blob != 'undefined') {
            var link = $('<a href="' + cursor.key + '">File</a>');
            link.on('click', function() { return false; });
            link.on('mouseenter', function(evt) {
                      setInViewer(evt.target.getAttribute('href')); });
            list_item.append(' / ');
            list_item.append(link);
          } else {
            list_item.append(" / No attached file");
          }
          pub_list.append(list_item);
        };

        // Move on to the next object in store
        cursor.continue();

        // This counter serves only to create distinct ids
        i++;
      } else {
        console.log("No more entries");
      }
    };
  }
    

openDb();