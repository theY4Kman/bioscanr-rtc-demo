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

    //hide loading
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

});





