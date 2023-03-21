$('#pitScoutingForm').submit(function(event){
    event.preventDefault();
    if($('#pitTeamNumber').val() == ""){alert("Enter a team number");return;}
    // let value = $(('#pitScoutingForm')).serialize();
    // value.push({name:"pitComments",value:$('#pitComments').val()});
    // value['pitcomments'] = $('#pitComments').val();
    let value = {};
    $.each($('#pitScoutingForm').serializeArray(), function() {
        value[this.name] = this.value;
    });

    value['recorded_date'] = new Date();
    value['type'] = "pit";
    value['transfered'] = 0;
    addPit(value);
    resetPitScout();
  });

  function resetPitScout(){
    $('#pitScoutingForm')[0].reset();
  }