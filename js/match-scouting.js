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

var autonNodeList = [];
var teleopNodeList = [];

var currentMatchData = {};

function initData(){
    currentMatchData['mobility'] = $("#mobility").is(':checked');
    currentMatchData['defensive'] = $("#teleop_defensive").is(':checked');
    currentMatchData['auton_charger'] = $('input[name=auton_charger]:checked', "#auton_charger_container").val();
    currentMatchData['teleop_charger'] = $('input[name=teleop_charger]:checked', "#teleop_charger_container").val();
    currentMatchData['auton_grid_total'] = 0;
    currentMatchData['teleop_grid_total'] = 0;
    currentMatchData['linksMade'] = 0;
    currentMatchData['events'] = [];

}



$().ready(function(){
    $('#scout_name').val(getCookie('scout_name') || '');
    $('#tabletNum').val(getCookie('tabletNum') || '').change();

    $('#matchDate').val(new Date().toISOString().slice(0, 10) );

    if($('#matchType').find(":selected").is(":disabled")){
        $('#matchType').addClass("text-secondary");
    }else{
        $('#matchType').removeClass("text-secondary");
    }

    if($('#tabletNum').find(":selected").is(":disabled")){
        $('#tabletNum').addClass("text-secondary");
    }else{
        $('#tabletNum').removeClass("text-secondary");
    }

    $("#auton-grid-container").load("grid-frag.html", function(){
      $('#auton-grid-container').find('input').each(function(){
        $(this).attr('id',$(this).attr('id')+"_auton");
        $(this).parent().find('label').attr('for',$(this).attr('id'));
        if( $(this).parent().find('label').attr('onclick') !== undefined){
          $(this).parent().find('label').attr('onclick',"hybridNodeClick('"+$(this).attr('id')+"')");
        }

      })


    });



    $("#teleop-grid-container").load("grid-frag.html",function(){
      $('#teleop-grid-container').find('input').each(function(){
        $(this).attr('id',$(this).attr('id')+"_teleop");
        $(this).parent().find('label').attr('for',$(this).attr('id'));
        if( $(this).parent().find('label').attr('onclick') !== undefined){
          $(this).parent().find('label').attr('onclick',"hybridNodeClick('"+$(this).attr('id')+"')");
        }

      })

      finishedLoadingGrid()
    }); 




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

  if(validMatchInfo){ 
    $('#continueMatchInfo').prop('disabled', false); 
  } else { 
    $('#continueMatchInfo').prop('disabled', true);
  }


}

$('#continueMatchInfo').click(function(e){
    e.preventDefault();
    $('#matchInfoTeamNum').html($('#teamNumber').val());
    $('#matchInfoAllianceColor').html($('#tabletNum').val().toUpperCase());
    if($('#tabletNum').val().includes('blue')){
      $('#matchInfoAllianceColor').css("color","blue")
    } else {
      $('#matchInfoAllianceColor').css("color","red")

    }



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
    $('#matchInfoNumColor').show();
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
  $('#matchInfoNumColor').hide();
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
$('#tabletNum').change(function(){
    if($('#tabletNum').find(":selected").is(":disabled")){
      $('#tabletNum').addClass("text-secondary");
    }else{
      $('#tabletNum').removeClass("text-secondary");
      setCookie('tabletNum', $('#tabletNum').val(), 4);
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

  function addEvent(type){
    var newEvent ={
      type: type,
      time: new Date()
    };
    currentMatchData['events'].push(newEvent);
  }

  $('#matchScoutingForm').submit(function(e){
    e.preventDefault()
    saveRecording();
  })




  function saveRecording(){
    currentMatchData['win'] = $("#win").is(':checked');
    currentMatchData['comments'] = $('#comments').val();
    currentMatchData['autonNodeList'] = autonNodeList;
    currentMatchData['teleopNodeList'] = teleopNodeList;
    currentMatchData['recorded_date'] = new Date();
    currentMatchData['transfered'] = 0;
    addMatch(currentMatchData);

    
    $('#matchScoutingForm')[0].reset();
    $('#matchType').val(currentMatchData['type']);
    $('#matchNumber').val(currentMatchData['match_number']++);
    $('#scout_name').val(getCookie('scout_name') || '');
    $('#tabletNum').val(getCookie('tabletNum') || '').change();


    currentMatchData = {};

    restartTimer();


    showInfo();
    initData();
    //$('#nav-matches-tab' ).trigger('click');
  }

  //Save value after it has 'settled'

  $('.hybrid-btn-label').on('click',function(){
    hybridNodeClick($(this).attr('id'));
  })


  function finishedLoadingGrid(){
    $('.cone-btn, .cube-btn').change(function(){
      let checked = $(this).is(':checked')
      let pointValue = getPointValueForNode($(this).attr("id"));
      let isAuton = $(this).attr("id").includes("auton");
      let nodeCoord = $(this).attr("id").substring(0,2);
      addEvent($(this).attr("id")+","+checked);

      insertNodeData(checked, isAuton, pointValue, nodeCoord)


    });

  }



  function hybridNodeClick(id){
    val = parseInt($("#" + id).val(),10) + 1;
    let isAuton = id.includes("auton");
    let pointValue = getPointValueForNode(id);

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

  function getPointValueForNode(nodeId){
    let pointVal = 0;
    if(nodeId.startsWith("a")) {
      pointVal = 5
    } else if(nodeId.startsWith("b")) {
      pointVal = 3
    } else {
      pointVal = 2
    }

    if(nodeId.includes("auton")){
      pointVal++;
    }

    return pointVal;


  }

  function insertNodeData(checked, isAuton, pointValue, nodeCoord){
    if(checked){
      if(isAuton){
        currentMatchData["auton_grid_total"] += pointValue;
        autonNodeList.push(nodeCoord)

      } else {
        currentMatchData["teleop_grid_total"] += pointValue;
        teleopNodeList.push(nodeCoord)

      }
    } else {
      if(isAuton){
        currentMatchData["auton_grid_total"] -= pointValue;
        autonNodeList = autonNodeList.filter(item => item !== nodeCoord)
      } else {
        currentMatchData["teleop_grid_total"] -= pointValue;
        teleopNodeList = teleopNodeList.filter(item => item !== nodeCoord)

      }
    }
  }

