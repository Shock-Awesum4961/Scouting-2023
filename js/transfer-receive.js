function onScanSuccess(decodedText, decodedResult) {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);
    console.log('isJSON: ', isJSON(decodedText))

    stopCamera()
    // html5QrcodeScanner.stop().then((ignore) => {
    //   // QR Code scanning is stopped.
    // }).catch((err) => {
    //   // Stop failed, handle it.
    // });
  }
  
  function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
  }
  
  //let html5QrcodeScanner = new Html5QrcodeScanner(
  //  "reader",
  //  { fps: 10, qrbox: {width: 250, height: 250} },
  //  /* verbose= */ false);
  //html5QrcodeScanner.render(onScanSuccess, onScanFailure);


  $('#initCameraScanning').click(function(){
    requestCamera();
  })

  $('#stopCameraScanning').click(function(){
    stopCamera();
  })

  // Custom code now::
  // This method will trigger user permissions
  const html5QrCode = new Html5Qrcode(/* element id */ "reader");

  function requestCamera(){
    Html5Qrcode.getCameras().then(devices => {
      /**
       * devices would be an array of objects of type:
       * { id: "id", label: "label" }
       */
      if (devices && devices.length) {
        var cameraId = devices[0].id;
        // .. use this to start scanning.

        html5QrCode.start(
          cameraId, 
          {
            fps: 10,    // Optional, frame per seconds for qr code scanning
            // qrbox: { width: 500, height: 250 }  // Optional, if you want bounded box UI
          },
          (decodedText, decodedResult) => {
            // do something when code is read
            onScanSuccess(decodedText, decodedResult)
          },
          (errorMessage) => {
            // parse error, ignore it.
            console.log(errorMessage)
          })
        .catch((err) => {
          // Start failed, handle it.
});
      }
    }).catch(err => {
      // handle err
    });
  }

  function stopCamera(){
    html5QrCode.stop().then((ignore) => {
      // QR Code scanning is stopped.
    }).catch((err) => {
      // Stop failed, handle it.
    });
  }