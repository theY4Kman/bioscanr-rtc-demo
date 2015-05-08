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

    //get on call close status
    //https://docs.sdk.acision.com/api/latest/javascript/module-WebRTC-Session.html#CloseEvent
    // normal - the session ended normally (including timed out).
    // blocked - the remote party has rejected the session because the local user is blocked.
    // offline - the remote party is offline or wants to appear offline.
    // notfound - the remote party does not exist or wants to appear to not exist.

    var status = evt.status;

    //clean remote html element
    $('#videoLocal').attr('src', '');
    $('#videoRemote').attr('src', '');

    //pause ringing
    document.getElementById('ringtone').pause();

    //hide local
    $('.local').hide();

    //disconnect from session
    setTimeout(function () {
      sdk.disconnect();
    }, 1000);

    //show go online button
    $('#availability').show();

    //reload page
    setTimeout(function () {
      location.reload();
    }, 3000);


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
      $('.vitals').show().css('visibility', 'visible');
      initializeEKG();

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

      //set current status
      $('#status').css('color', 'red').text('unavailable');

      //hide go online button
      $('#availability').hide();

    });

  };

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

  // The EKG wave
  var initializeEKG = (function () {

    var $graph = $('#graph');
    $graph.ecgChart({
      width: $graph.width(),
      height: $graph.height()
    });

    /*XXX################################################################################*/
    /*XXX##################   TEST DATA PLEASE REMOVE ME !!!!! ##########################*/
    /*XXX################################################################################*/
    /*XXX################################################################################*/
    /*XXX################################################################################*/
      // A list of data point samples for one beat.
      var _data = [
        0, 0, 0, 0, 0.0000050048828125, 0.0000137939453125, 0.000049560546875, 0.00008740234375, 0.00015966796875,
        0.000262451171875, 0.0003975830078125, 0.0005687255859375, 0.0007802734375, 0.001037353515625,
        0.0013468017578125, 0.00172119140625, 0.0021756591796875, 0.0027232666015625, 0.0033880615234375,
        0.004206787109375, 0.0052380371093750005, 0.006586181640625, 0.008400146484375001, 0.010904296875,
        0.0144892578125, 0.0196798095703125, 0.049684204101562504, 0.0886883544921875, 0.11185363769531251,
        0.134164306640625, 0.137352294921875, 0.1160369873046875, 0.08516308593750001, 0.0539765625,
        0.014997436523437501, -0.015882568359375, -0.0387554931640625, -0.06125732421875, -0.0745780029296875,
        -0.07479357910156251, -0.0725338134765625, -0.0418538818359375, 0.08582861328125001, 0.397717529296875,
        0.8136408691406251, 1.2295617980957032, 0.9944150390625001, 0.2824605712890625, -0.38949267578125,
        -0.597251220703125, -0.425675537109375, -0.1537947998046875, -0.0500914306640625, -0.0111041259765625,
        0.0027451171875, 0.0071739501953125, 0.008443359375, 0.0094327392578125, 0.012530517578125,
        0.0176046142578125, 0.0300162353515625, 0.0433489990234375, 0.056962646484375004,
        0.0704832763671875, 0.0770511474609375, 0.0898175048828125, 0.10311853027343751, 0.117046142578125,
        0.1312630615234375, 0.1529300537109375, 0.167607177734375, 0.1899068603515625, 0.2124422607421875,
        0.235044677734375, 0.2575535888671875, 0.2724073486328125, 0.286978271484375, 0.3007579345703125,
        0.3067425537109375, 0.3106370849609375, 0.303756103515625, 0.2897236328125, 0.25916931152343753,
        0.2200599365234375, 0.1728209228515625, 0.133416259765625, 0.086224853515625, 0.05493408203125,
        0.02409423828125, 0.00922607421875, -0.0043409423828125, -0.0097349853515625, -0.013127685546875,
        -0.01423095703125, -0.013834716796875, -0.012556030273437501, -0.010675048828125, -0.00835888671875,
        -0.0057305908203125, -0.0000562744140625
      ];

      // Create a data point generator.
      var getDataPoint = (function () {

        var _x = -1;
        var _max = _data.length;

        return function () {
          _x = (_x + 1) % _max;
          return { x: Date.now(), y: _data[_x] };
        };
      })();

      var heartRate = 60; // bpm
      var interval = 60 * 1000 / (_data.length * heartRate);

      // Generate a new data point based on the heart rate.
      setInterval(function () {
        $('#graph').ecgChart('addDataPoint', getDataPoint());
      }, interval);
/*XXX################################################################################*/
/*XXX################################################################################*/
/*XXX################################################################################*/
/*XXX################################################################################*/
  });

});





