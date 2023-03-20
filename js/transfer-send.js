var dataToTransfer = {};
var matchesNotTransfered = {};
var pitNotTransfered = {};
var splitDataToTransfer = [];
var currQrCode = 0;

var transferTabPanel = document.getElementById("nav-transfer-tab");
transferTabPanel.addEventListener('shown.bs.tab', function(event){
  // populateTransferPitList('sendSavedPitsList');

});

$('#transfer_send').click(function(){
  $('#receive-data-section').hide()
  $('#send-data-section').show()
})
$('#transfer_receive').click(function(){
  $('#send-data-section').hide()
  $('#receive-data-section').show()
})

function generateQRCodeToTransfer(){
  generateQRCode('qrCodeBlock', dataToTransfer);
}

function handleTransferCheckbox(ele,id){
  if($(ele).prop("checked")){
    dataToTransfer[id] = matchesNotTransfered[id];
    console.log(dataToTransfer)
  } else {
   delete dataToTransfer[id];
  }



  if(Object.keys(dataToTransfer).length > 0){
    $('#generateQrCodeBtn').prop('disabled', false);
  } else {
    $('#generateQrCodeBtn').prop('disabled', true);
  }


}

function backToSelectTransfer(){
  $('#generateQrCodeBackBtn').hide()
  $('#qrCodeSection').hide()
  $('#send-list-section').show()
  $('#generateQrCodeBtn').show()
  $('#doneTransferBtn').hide()

}

function showQRCodeForMatches(){

  $('#send-list-section').hide()
  $('#generateQrCodeBtn').hide()
  $('#generateQrCodeBackBtn').show()
  $('#qrCodeSection').show()
  $('#qrNextBtn').show();
  $('#qrPrevBtn').hide();
  currQrCode = 0;

  splitDataToTransfer = [];
  let stringifiedData = JSON.stringify(dataToTransfer);
  if(stringifiedData.length > maxQRCodeStrLen){
    let storedStrLen = 0;
    while(storedStrLen < stringifiedData.length){
      splitDataToTransfer.push(stringifiedData.slice(storedStrLen, storedStrLen+maxQRCodeStrLen));
      storedStrLen += maxQRCodeStrLen;
      //allow to click through qr codes
    }

    $('#numQrCodes').html(splitDataToTransfer.length)
    $('#numTransferInfo').show();
    $('#currentQrCode').html(1)
    generateQRCode(splitDataToTransfer[0]);
  } else {
    generateQRCode(stringifiedData);
  }

  $('#generateQrCodeBtn').prop('disabled', true);
  $('#doneTransferBtn').show()


}

$('#qrPrevBtn').click(function(){
  let prevQRCode = --currQrCode;
  let displayQrCode =prevQRCode+1;
  $('#currentQrCode').html(displayQrCode)
  generateQRCode(splitDataToTransfer[prevQRCode]);

  if(currQrCode == 0){
    $('#qrPrevBtn').hide();
  }
  
  $('#qrNextBtn').show();

});
$('#qrNextBtn').click(function(){
  let nextQRCode = ++currQrCode;
  let displayQrCode = nextQRCode+1;
  $('#currentQrCode').html(displayQrCode)
  generateQRCode(splitDataToTransfer[nextQRCode]);

  if(currQrCode == splitDataToTransfer.length-1){
    $('#qrNextBtn').hide();
  }
  
  $('#qrPrevBtn').show();


});
$('#doneTransferBtn').click(function(){
  if(confirm("Are you sure you're done transfering?")){
    //markMatchesAsTransfered()
    let promiseArr = Object.keys(dataToTransfer).map(function(key){
      dataToTransfer[key]['transfered'] = 1;
      return updateMatch(key, dataToTransfer[key]).then(function(res){
        
        return res;
      })
    })

    Promise.all(promiseArr).then(function(resultsArray){
      qrcode.clear();
      Object.keys(dataToTransfer).forEach(function(key){
        $('#transferMatch_' + key).remove();
      })
      dataToTransfer = [];
      $('#qrCodeBlock').html("");
      $('#doneTransferBtn').hide();
      $('#numTransferInfo').hide();
      $('#generateQrCodeBtn').prop('disabled', false);
      
      populateTransferList();
    })
  }
});

var qrcode; // QRCode OBJ
const maxQRCodeStrLen = 500;



$().ready(function(){
    populateTransferList('sendSavedMatchesList');
    qrcode = new QRCode('qrCodeBlock',{
        height:256,
        width:256
    });
})


function generateQRCode(data){
  qrcode.clear(); 
  if(data.length <= 217 && data.length >= 192){data+="                          ";}
  qrcode.makeCode(data)
}

function populateMatchesList(eleId, showCheckboxes){
  getAllMatches().then(data =>{
    if(data.length == $("#" + eleId).children().length){return;}else{$('#'+eleId).html("")}
    let sortedData = data.sort(
      (p1, p2) => (p1.recorded_date < p2.recorded_date) ? 1 : (p1.recorded_date > p2.recorded_date) ? -1 : 0);
    data.forEach(match => {
        var divStr = '<div class="list-group-item text-align-left">' +
            '<div class="d-flex">';

          divStr += '<div>Team ' + match.team_number + '</div>'+
              '<div class="mx-2"> - </div>' + 
              '<div>'+match.type+': ' + match.match_number + '</div>' +
            '</div>'+
            '<div class="text-secondary">'+match.date+'</div>'+ 
            '</div>';
          $('#'  +eleId).append(divStr);
    })

  })
}

function populateTransferPitList(eleId){
  getAllPitsIndexed('transfered',0).then(data =>{
    if(data.length == $("#" + eleId).children().length){return;}else{$('#'+eleId).html("")}
    let sortedData = data.sort(
      (p1, p2) => (p1.recorded_date < p2.recorded_date) ? 1 : (p1.recorded_date > p2.recorded_date) ? -1 : 0);
    data.forEach(pit => {
      pitNotTransfered[pit.id] = pit;
        var divStr = '<div class="list-group-item text-align-left" id="transferMatch_'+pit.id+'">' +
            '<div class="form-check" >'+
              '<input class="form-check-input transferMatchCheckbox" type="checkbox" value="'+pit.id+'" onclick="handleTransferCheckbox(this, '+match.id+')">' +
              '<label class="w-100" for="transferMatch_'+pit.id+'">'+
                '<div class="d-flex">' +
                  '<div>Team ' + pit.team_number + '</div>'+
                '</div>'+
              '</label>'+
            '</div>' +
          '</div>';
          $('#'  +eleId).append(divStr);
    })

  })
}
function populateTransferList(eleId){
  getAllMatchesIndexed('transfered',0).then(data =>{
    if(data.length == $("#" + eleId).children().length){return;}else{$('#'+eleId).html("")}
    let sortedData = data.sort(
      (p1, p2) => (p1.recorded_date < p2.recorded_date) ? 1 : (p1.recorded_date > p2.recorded_date) ? -1 : 0);
    data.forEach(match => {
      if($.isArray(match)){console.log(match); newMatch = Object.fromEntries(match.entries());console.log(newMatch)}
      matchesNotTransfered[match.id] = match;
      
        var divStr = '<div class="list-group-item text-align-left" id="transferMatch_'+match.id+'">' +
            '<div class="form-check" >'+
              '<input class="form-check-input transferMatchCheckbox" type="checkbox" value="'+match.id+'" id="matchCheck_'+match.id+'" name="matchCheck_'+match.id+'"onclick="handleTransferCheckbox(this, '+match.id+')">' +
              '<label class="form-check-label" for="matchCheck_'+match.id+'">'+
                '<div class="d-flex">' +
                  '<div>Team ' + match.team_number + '</div>'+
                  '<div class="mx-2"> - </div>' + 
                  '<div>'+match.type+': ' + match.match_number + '</div>' +
                '</div>'+
                '<div class="text-secondary">'+match.date+'</div>'+ 
                '<div class="text-secondary">'+match.id+'</div>'+ 
              '</label>'+
            '</div>' +
          '</div>';
          $('#'  +eleId).append(divStr);
    })

  })
}