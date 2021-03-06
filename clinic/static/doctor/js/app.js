vex.defaultOptions.className = 'vex-theme-os';
vex.dialog.buttons.YES.text = 'Call Patient';

$(document).ready(function (e) {

  //sdk
  var sdk;

  //enter api key form your Acision Forge account
  var key = BIOSCANR.apiKey;//'49G0A50SiY4z';

  //enter username and password from user accounts
  var un = BIOSCANR.doctorUsername;
  var pw = BIOSCANR.doctorPassword;

  //enter agent one name
  $('#agent-name').text(BIOSCANR.doctorName);

  //webrtc session
  var session;

  //local media
  var local;

  //remote media
  var remote;

  //define sdk
  setTimeout(function () {
    sdk = new AcisionSDK(key, {
      onConnected: onConnected,
      onDisconnected: onDisconnected,
      onAuthFailure: onAuthFailure
    }, {
      presistent: true,
      username: un,
      password: pw
    });
  }, 500);

  //on connection
  function onConnected(evt) {

    //on incoming session
    sdk.webrtc.setCallbacks({
      onIncomingSession: onCall
    });

    //get current presence
    sdk.presence.setOwnPresentity({
      status: 'available'
    });

    sdk.presence.getPresentities([un + '@sdk.acision.com'], null, {
      onSuccess: function (evt) {
        console.debug('Received own presentity: ', evt[0]);
      }
    });

  }

  //on disconnect
  function onDisconnected(evt) {

    //hide disconnect button
    $('#disconnect').hide();

    //hide accept button
    $('#accept').hide();

    //clean html elements
    $('#videoLocal').attr('src', '');
    $('#videoRemote').attr('src', '');

    //set presence
    sdk.presence.setOwnPresentity({
      status: 'unavailable'
    });

    //set go to status
    $('#availability span').text('ONLINE');

    //set current status
    $('#status').css('color', 'red').text('unavailable');

    //define new sdk
    sdk = new AcisionSDK(key, {
      onConnected: onConnected,
      onDisconnected: onDisconnected,
      onAuthFailure: onAuthFailure
    }, {
      username: un,
      password: pw
    });

  };

  //auth failure
  function onAuthFailure(evt) {


  }

  //call on connection
  function onCallConnect() {

    $('.loading').hide();

  }

  //call on connecting
  function onCallConnecting() {


  }

  //call on close
  function onCallClose(evt) {

    $('.vitals').css('visibility', 'hidden');

    //get on call close status
    //https://docs.sdk.acision.com/api/latest/javascript/module-WebRTC-Session.html#CloseEvent
    // normal - the session ended normally (including timed out).
    // blocked - the remote party has rejected the session because the local user is blocked.
    // offline - the remote party is offline or wants to appear offline.
    // notfound - the remote party does not exist or wants to appear to not exist.

    //var status = evt.status;
    //
    ////clean remote html element
    //$('#videoLocal').attr('src', '');
    //$('#videoRemote').attr('src', '');
    //
    ////pause ringing
    //document.getElementById('ringtone').pause();
    //
    ////hide local
    //$('.local').hide();
    //
    ////show go online button
    //$('#availability').show();
  }

  //incoming call
  function onCall(evt) {

    //start session
    session = evt.session;

    //remote video & audio render
    session.remoteAudioElement = document.getElementById('audioRemote');
    session.remoteVideoElement = document.getElementById('videoRemote');

    //local video render
    session.localVideoElement = document.getElementById('videoLocal');

    //session ended callback
    session.setCallbacks({
      onClose: onCallClose
    });

    //accept
    acceptCall();


  }

  //accept call
  function acceptCall() {

    //show accept button
    $('#accept').fadeIn();

    //show loading
    $('.loading').fadeIn();

    //play audio
    document.getElementById('ringtone').play();

    //accept call
    $('#accept').click(function () {

      //accept
      session.accept();

      //hide accept button
      $('#accept').hide();

      //hide loading
      $('.loading').hide();

      // show vitals
      initializeVitals();

      //show local
      $('.local').fadeIn();

      //show disconnect button
      $('#disconnect').fadeIn();

      //pause ringing
      document.getElementById('ringtone').pause();

      //set presence
      sdk.presence.setOwnPresentity({
        status: 'unavailable'
      });
    });
  }

  //disconnect call
  $('#disconnect').click(function () {

    //disconnect
    sdk.disconnect();

    //hide local
    $('.local').hide();

    //show go online button
    $('#availability').show();

  });

  //windown unload
  window.onunload = window.onbeforeonload = (function () {

    sdk.presence.setOwnPresentity({
      status: 'available'
    }, '');

    //disconnect sdk
    sdk.disconnect();

  });

  /*XXX################################################################################*/
  /*XXX################################################################################*/
  /*XXX################################################################################*/
  var ECG_DATA_MODE_ALL_BATCHES = 0;
  var ECG_DATA_MODE_LAST_BATCH = 1;
  var ECG_DATA_MODES = 2;

  var ECG_UPDATE_MODE_CONSTANT = 0;
  var ECG_UPDATE_MODE_FIRST = 1;
  var ECG_UPDATE_MODES = 2;
  /*XXX################################################################################*/
  /*XXX################################################################################*/
  /*XXX################################################################################*/
  /*XXX################################################################################*/

  var vitalsInitialized = false;
  var initializeVitals = function() {
    if (vitalsInitialized) return;
    vitalsInitialized = true;

    var $graph = $('#graph');
    $graph.ecgChart({
      width: $graph.width(),
      height: $graph.height(),
      xMax: 1000
    });

    var pulse = d3.select('#pulse'),
        respiration = d3.select('#respiration');

    var data = {
      pulse: 0,
      respiration: 0,
      ecg: [0, 0, 0]
    };

    var _ecgInterval = null;

    var supplyNewEcg = function(data, heartRate) {
      // Create a data point generator.
      var getDataPoint = (function () {

        var _x = -1;
        var _max = data.length;

        return function () {
          _x = (_x + 1) % _max;
          return { x: Date.now(), y: data[_x] };
        };
      })();

      var interval = 60 * 1000 / (data.length * heartRate);

      if (_ecgInterval) {
        clearInterval(_ecgInterval);
      }

      // Generate a new data point based on the heart rate.
      _ecgInterval = setInterval(function () {
        $('#graph').ecgChart('addDataPoint', getDataPoint());
      }, interval);
    };

    var requestNewData = function() {
      $.get(BIOSCANR.latestEndpoint, function(latest) {
        var lastPulse = data.pulse;
        var lastECG = data.ecg;

        var nextPulse = latest.heartRate[0] || data.pulse;
        var nextRespiration  = latest.respirationRate[0] || data.respiration;

        var nextECG;
        if (window.ecgDataMode == ECG_DATA_MODE_ALL_BATCHES) {
          nextECG = Array.prototype.concat.apply([], latest.ecg) || data.ecg;
        } else if (window.ecgDataMode == ECG_DATA_MODE_LAST_BATCH) {
          nextECG = latest.ecg[0] || data.ecg;
        }

        // Get rid of zeroes, which are useless data
        nextECG = _.filter(nextECG, function(n) { return n > 0; });
        // Normalize to number between -1 and 1
        nextECG = _.normalize(nextECG, [-1.0, 1.0]);

        pulse.text(nextPulse);
        respiration.text(nextRespiration.toFixed(0));

        if (!_.isEqual(lastECG, nextECG) || lastPulse != nextPulse) {
          supplyNewEcg(nextECG);
        }

        data.pulse = nextPulse;
        data.respiration = nextRespiration;
        data.ecg = nextECG;
      }, 'json');
    };

    requestNewData();
    setInterval(requestNewData, 500);
  };

  var callPatient = function() {
    //connect to agent
    session = sdk.webrtc.connect(BIOSCANR.patientUsername, {
      onConnect: onCallConnect,
      onConnecting: onCallConnecting,
      onClose: onCallClose
    }, {
      streamConfig: {
        audioIn: true,
        audioOut: true,
        videoIn: true,
        videoOut: true
      }
    });

    //local video render
    session.localVideoElement = document.getElementById('videoLocal');

    //remote video & audio render
    session.remoteAudioElement = document.getElementById('audioRemote');
    session.remoteVideoElement = document.getElementById('videoRemote');

    $('video').prop('autoplay', true);

      //hide loading
      $('.loading').hide();

      // show vitals
      initializeVitals();

      //show local
      $('.local').fadeIn();

      //show disconnect button
      $('#disconnect').fadeIn();
  };

  var checkForAlertInterval = 500;
  var checkForAlert = function() {
    $.get('/alert/', function(data) {
      if (data.shouldAlert) {
        vex.dialog.alert({
            message: BIOSCANR.patientName + ' vitals escalated, severity escalated, chat unresponsive',
            callback: function(evt) {
              callPatient();
            }
        });

      }
    }, 'json')
  };

  setInterval(checkForAlert, checkForAlertInterval);

  // For debugging purposes:
  window.showVitals = function() {
    $('.vitals').css('visibility', 'visible');
    initializeVitals();
  };

  Mousetrap.bind(['command+shift+v', 'ctrl+k'], function() {
    window.showVitals();
  });

  /*XXX################################################################################*/
  window.ecgDataMode = 0;
  window.ecgUpdateMode = 0;

  Mousetrap.bind(['ctrl+h', 'command+h'], function() {
    window.ecgDataMode += 1;
    window.ecgDataMode %= ECG_DATA_MODES;
  });

  Mousetrap.bind(['ctrl+j', 'command+j'], function() {
    window.ecgUpdateMode += 1;
    window.ecgUpdateMode %= ECG_UPDATE_MODES;
  });

  // setup our html stuff
  $('.toggle-vitals').show().click(function() {
    initializeVitals();
    var $vitals = $('.vitals');
    var cur = $vitals.css('visibility');
    $vitals.css('visibility', cur == 'visible' ? 'hidden' : 'visible');
  });

});
