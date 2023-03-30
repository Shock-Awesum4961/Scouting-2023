function afterDBLoad(){
    $('#datatable-containerS').dataTable( {
        ajax: function (data, callback, settings) {
            getAllMatches().then(function(matchData){
                callback(matchData);
            })
        }
    });
}