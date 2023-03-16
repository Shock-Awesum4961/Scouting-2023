const autoDuration = 15;
const autoEnd = 3;
const teleopDuration = 105;
const endgameDuration = 30;
const totalDuration = autoDuration + autoEnd + teleopDuration + endgameDuration;

var timerPaused = false;
var timerPausedAt;
var timerTotalPausedAt;
var currentMatchTime;

var validMatchInfo = false;

var currentMatchData = {};

function initData(){
    currentMatchData['mobility'] = $("#mobility").is(':checked');
    currentMatchData['defensive'] = $("#teleop_defensive").is(':checked');
    currentMatchData['auton_charger'] = $('input[name=auton_charger]:checked', "#auton_charger_container").val();
    currentMatchData['teleop_charger'] = $('input[name=teleop_charger]:checked', "#teleop_charger_container").val();
    currentMatchData['auton_bottom'] = 0;
    currentMatchData['auton_middle_cone'] = 0;
    currentMatchData['auton_top_cone'] = 0;
    currentMatchData['auton_middle_cube'] = 0;
    currentMatchData['auton_top_cube'] = 0;
    currentMatchData['teleop_bottom'] = 0;
    currentMatchData['teleop_middle_cone'] = 0;
    currentMatchData['teleop_top_cone'] = 0;
    currentMatchData['teleop_middle_cube'] = 0;
    currentMatchData['teleop_top_cube'] = 0;
    currentMatchData['teleop_pickup_portal_slide'] = 0;
    currentMatchData['teleop_pickup_portal_shelf'] = 0;
    currentMatchData['teleop_pickup_ground'] = 0;
    currentMatchData['events'] = [];

}



$().ready(function(){
    $('#scout_name').val(getCookie('scout_name') || '');

    $('#matchDate').val(new Date().toISOString().slice(0, 10) );

    if($('#matchType').find(":selected").is(":disabled")){
        $('#matchType').addClass("text-secondary");
    }else{
        $('#matchType').removeClass("text-secondary");
    }

    initData()
});

$('#matchType,#matchNumber,#teamNumber').change(function(){
  validateMatchInfo();
})

function validateMatchInfo(){
  validMatchInfo = true;
  if($('#matchType').val() == "" || $('#matchType').val() == null){validMatchInfo = false;}
  if($('#matchNumber').val() == "" || $('#matchNumber').val() == null && $('#matchNumber').val() > 0){validMatchInfo = false;}
  if($('#teamNumber').val() == "" || $('#teamNumber').val() == null && $('#teamNumber').val() > 0){validMatchInfo = false;}

  if(validMatchInfo){$('#continueMatchInfo').prop('disabled', false)} else { $('#continueMatchInfo').prop('disabled', true);}


}

$('#continueMatchInfo').click(function(e){
    e.preventDefault();

    showAuton()

    saveInfo();
});

$('#resetMatchInfo').click(function(e){
    e.preventDefault()
})

$('#autonBack').click(function(e){
    e.preventDefault()
    showInfo();
})

$('#autonContinue').click(function(e){
    e.preventDefault()
    showTeleop();
})

$('#teleopBack').click(function(e){
    e.preventDefault()
    showAuton();
})

function showAuton(){
    $('.timer-section').show();
    $('#record-info').hide();
    $('#record-teleop').hide();
    $('#record-auton').show();

    $('#match_section').val("auton");
}


function showTeleop(){
  $('#record-info').hide();
  $('#record-auton').hide();
  $('#record-teleop').show();
}

function showInfo(){
  $('.timer-section').hide();
  $('#record-auton').hide();
  $('#record-teleop ').hide();
  $('#record-info').show();
}

function startTimer(){

  $('.countdown').show();
  $('#startTimer').hide();
  $('#stopTimer').show();
  $("#restartRecording").show();

  timerPaused = false;
  progress(totalDuration, totalDuration, $('#progressBar'));
  //  startAutoTimer();
//  autoEndTimer();
//  teleopTimer();
//  endgameTimer();
}

function stopTimer(){
  timerPaused = true;
  $('#stopTimer').hide();
  $("#resumeTimer").show();
}
function resumeTimer(){
  timerPaused = false;
  $("#resumeTimer").hide();
  $('#stopTimer').show();

  progress(timerPausedAt, timerTotalPausedAt, $('#progressBar'));
}

function restartTimer(){
  timerPaused = true;
  timerPausedAt = 0
  timerTotalPausedAt = 0
  $("#restartRecording").hide();
  $('.countdown').hide();
  $('#stopTimer').hide();
  $("#resumeTimer").hide();
  $('#startTimer').show();
}

function progress(timeleft, timetotal, $element) {
  if(!timerPaused){
    var progressBarWidth = timeleft * $element.width() / timetotal;
    $element.find('div').animate({ width: progressBarWidth }, 500);
    $("#countdownTime").html(Math.floor(timeleft/60) + ":"+ pad(timeleft%60, 2));
    currentMatchTime = timetotal - timeleft;

    if(timeleft > (totalDuration - autoDuration)){
      $('#currentMatchPeriod').html("AUTONOMOUS")
    } else if(timeleft > (totalDuration - autoDuration - autoEnd)){
      $('#currentMatchPeriod').html("AUTONOMOUS SCORING")
    } else if(timeleft > (totalDuration - autoDuration - autoEnd - teleopDuration)){
      $('#currentMatchPeriod').html("TELEOPERATED")
    } else if(timeleft > 0){
      $('#currentMatchPeriod').html("ENDGAME")
    } else {
      $('#currentMatchPeriod').html("MATCH OVER")
    }

    if(timeleft > 0) {
        setTimeout(function() {
            progress(timeleft - 1, timetotal, $element);
        }, 1000);
    }
  } else {
    timerPausedAt = timeleft;
    timerTotalPausedAt = timetotal;
    return;
  }
};

$('#matchType').change(function(){
    if($('#matchType').find(":selected").is(":disabled")){
      $('#matchType').addClass("text-secondary");
    }else{
      $('#matchType').removeClass("text-secondary");
      setCookie('matchType', $('#matchType').val(), 4);
    }
  });



  function saveScoutName(){
    currentMatchData['scout'] = $('#scout_name').val();
  }
  
  function saveInfo(){
    currentMatchData['scout'] = $('#scout_name').val();
    currentMatchData['date'] = $('#matchDate').val()
    currentMatchData['type'] = $('#matchType').val();
    currentMatchData['match_number'] = $('#matchNumber').val();
    currentMatchData['team_number'] = $('#teamNumber').val();
    if($("#allianceSwitch").is(':checked')){
      currentMatchData['alliance'] = "red"
    } else {
      currentMatchData['alliance'] = "blue"
    }
  }

  $('#mobility').change(function(){
    currentMatchData['mobility'] = $("#mobility").is(':checked');

  });

  $('input[name=auton_charger]').change(function(){
    currentMatchData['auton_charger'] = $('input[name=auton_charger]:checked', "#auton_charger_container").val();
    addEvent('auton_charger: ' + $('input[name=auton_charger]:checked', "#auton_charger_container").val());

  });

  $('#auton_bot').click(function(){
    currentMatchData['auton_bottom'] += 1;
    addEvent('auton_bottom');

  });
  $('#auton_mid_cube').click(function(){
    currentMatchData['auton_middle_cube'] += 1;
    addEvent('auton_middle_cube');
  });
  $('#auton_top_cube').click(function(){
    currentMatchData['auton_top_cube'] += 1;
    addEvent('auton_top_cube');
  });
  $('#auton_mid_cone').click(function(){
    currentMatchData['auton_middle_cone'] += 1;
    addEvent('auton_middle_cone');

  });
  $('#auton_top_cone').click(function(){
    currentMatchData['auton_top_cone'] += 1;
    addEvent('auton_top_cone');

  });

  $('#teleop_defensive').change(function(){
    currentMatchData['defensive'] = $("#teleop_defensive").is(':checked');
  });

  $('input[name=teleop_charger]').change(function(){
    currentMatchData['teleop_charger'] = $('input[name=teleop_charger]:checked', "#teleop_charger_container").val();
    addEvent('teleop_charger: '+ $('input[name=teleop_charger]:checked', "#teleop_charger_container").val());

  });

  $('#teleop_pickup_portal_slide').click(function(){
    currentMatchData['teleop_pickup_portal_slide'] += 1;
    addEvent('teleop_pickup_portal_slide');
  });
  $('#teleop_pickup_portal_shelf').click(function(){
    currentMatchData['teleop_pickup_portal_shelf'] += 1;
    addEvent('teleop_pickup_portal_shelf');
  });
  $('#teleop_pickup_ground').click(function(){
    currentMatchData['teleop_pickup_ground'] += 1;
    addEvent('teleop_pickup_ground');
  });

  $('#teleop_bot').click(function(){
    currentMatchData['teleop_bottom'] += 1;
    addEvent('teleop_bottom');
  });
  $('#teleop_mid_cone').click(function(){
    currentMatchData['teleop_middle_cone'] += 1;
    addEvent('teleop_middle_cone');
  });
  $('#teleop_top_cone').click(function(){
    currentMatchData['teleop_top_cone'] += 1;
    addEvent('teleop_top_cone');
  });
  $('#teleop_mid_cube').click(function(){
    currentMatchData['teleop_middle_cube'] += 1;
    addEvent('teleop_middle_cube');
  });
  $('#teleop_top_cube').click(function(){
    currentMatchData['teleop_top_cube'] += 1;
    addEvent('teleop_top_cube');
  });

  function addEvent(type){
    var newEvent ={
      type: type,
      time: new Date()
    };
    currentMatchData['events'].push(newEvent);
  }

  $('#matchScoutingForm').submit(function(){
    console.log('submitting form')
  })




  function saveRecording(){
    currentMatchData['comments'] = $('#comments').val();
    currentMatchData['recorded_date'] = new Date();
    currentMatchData['transfered'] = 0;
    addMatch(currentMatchData);

    
    $('#matchScoutingForm')[0].reset();
    $('#matchType').val(currentMatchData['type']);
    $('#matchNumber').val(currentMatchData['match_number']++);
    $('#scout_name').val(getCookie('scout_name') || '');


    currentMatchData = {};

    restartTimer();


    showInfo();
    initData();
    //$('#nav-matches-tab' ).trigger('click');
  }

  function hybridNodeClick(id){
    val = parseInt($("#" + id).val(),10) + 1;
    if(val <= 3){
        $("#" + id).val(val)
    } else {
        $("#" + id).val(1)
        val = 1
    }

    if(val === 1){
        $('#'+id).removeClass('hybrid-btn-cube');
        $('#'+id).removeClass('hybrid-btn-cone');
    } else if (val === 2){
        $('#'+id).addClass('hybrid-btn-cube');
    } else if(val === 3){
        $('#'+id).removeClass('hybrid-btn-cube');
        $('#'+id).addClass('hybrid-btn-cone');
    }

  }