function afterDBLoad(){

    buildAggregateData().then(function(matchData){
        console.log(typeof matchData)
        console.log(matchData)
        console.log(matchData.length)
        $('#datatable-container').dataTable( {
            dataType: 'json',
            columns: [
                { data: 'team_number' },
                { data: 'avg_score'},   
                { data: 'avg_auto_score'},
                { data: 'fav_game_piece'},
                { data: 'defensive'},
                { data: 'win_percent'},
            ],
            data: matchData
        });
    })

}