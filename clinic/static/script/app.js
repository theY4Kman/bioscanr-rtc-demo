$(document).ready(function (e) {

  //sdk
  var sdk;

  //enter api key form your Acision Forge account
  var key = BIOSCANR.apiKey;

  //enter username and password from user accounts
  var un = BIOSCANR.patientUsername;
  var pw = BIOSCANR.patientPassword;

  //set agents user namaes
  var agent1 = BIOSCANR.doctorUsername;

  //agent
  var agent;

  //webrtc session
  var session;

  //modals
  var agent_notice;

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

  //agent direct connect
  $('.appointment, .call').click(function (evt) {

    //prevent default click
    evt.preventDefault();

    //get remote user id
    agent = agent1;

    //connect to agent
    session = sdk.webrtc.connect(agent, {
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
  });

  //on connection
  function onConnected(evt) {

    //on incoming session
    sdk.webrtc.setCallbacks({
      onIncomingSession: onCall
    });

    //set presence
    sdk.presence.setOwnPresentity({
      status: 'available'
    }, '', {
      onSuccess: function () {

      }
    });

    //get agent one presence
    sdk.presence.getPresentities([agent1 + '@sdk.acision.com'], null, {
      onSuccess: function (evt) {

        if (evt[0].fields.status == 'available') {
          $('#agent-one').show();
        };

      }
    });

    //subscribe to presence
    sdk.presence.setCallbacks({
      onPresentity: function (evt) {

        //variables
        var user = evt[0].user;
        var status = evt[0].fields.status;

        //check users
        if (user == agent1 + '@sdk.acision.com') {

          //amanada
          if (status == 'available') {

            //show chat
            $('#agent-one').fadeIn();

          } else if (status == 'unavailable') {

            //hide chat
            $('#agent-one').fadeOut();

          }

        }

      }
    });

    $('video').prop('autoplay', true);
  };


  //on disconnect
  function onDisconnected(evt) {

    //hide disconnect button
    $('#disconnect').hide();

    //clean html elements
    $('#videoLocal').attr('src', '');
    $('#videoRemote').attr('src', '');

    //delete presence
    sdk.presence.deleteOwnPresentity();

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

    //console
    console.log('acision forge authenication error');


  };

  //accept call
  function acceptCall() {

    //accept
    session.accept();

    //hide accept button
    $('.video .loading').hide();
    $('#enter-agent-pin .loading').hide();

  };

  //call on connection
  function onCallConnect() {

    //notifiy user that the call has been accepted and will start shortly
    $('.video .loading').hide();
    $('#enter-agent-pin .loading').hide();

  };

  //call on connection
  function onCallConnectPin() {

    //notifiy user that the call has been accepted and will start shortly
    $('#enter-agent-pin .loading').hide();

    //hide demo app page
    $('.acision').hide();

    //show agent app
    $('.video-chat').fadeIn();


  };

  //call on connecting
  function onCallConnecting() {

    //notifiy user that the call is trying to connect
    //hide demo app page
    $('.acision').hide();

    //show agent app
    $('.video-chat').fadeIn();

    //show waiting messaging
    $('.video .loading').show();


  };

  //call on connecting
  function onCallConnectingPin() {

    //notifiy user that the call is trying to connect
    $('#enter-agent-pin .loading').fadeIn();

  };

  //call on close
  function onCallClose(evt) {

    //get on call close status
    var status = evt.status;

    //clean remote html element
    $('#videoLocal').attr('src', '');
    $('#videoRemote').attr('src', '');

    //show waiting messaging
    $('.video .loading').show();

    //hide agent app
    $('.video-chat').hide();

    //show demo app page
    $('.acision').fadeIn();

    //offline agent
    if (status == 'offline') {

      //show modal
      agent_notice = $('#agent-offline').bPopup();

      //hide loading
      $('#enter-agent-pin .loading').hide();

    }
    ;


  };

  //call on close
  function onCallClosePin(evt) {

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

    //show waiting messaging
    $('.video .loading').show();

    //hide agent app
    $('.video-chat').hide();

    //show demo app page
    $('.acision').fadeIn();

    //offline agent
    if (status == 'offline') {

      //show modal
      agent_notice = $('#agent-offline').bPopup();

      //hide loading
      $('#enter-agent-pin .loading').hide();

    }
    ;

  };

  //incoming call
  function onCall(evt) {

    //start session
    session = evt.session;

    //remote video & audio render
    session.remoteAudioElement = document.getElementById('audioRemote');
    session.remoteVideoElement = document.getElementById('videoRemote');

    //local video render
    session.localVideoElement = document.getElementById('videoLocal');

    $('video').prop('autoplay', true);

    //session ended callback
    session.setCallbacks({
      onClose: onCallClose
    });

    //accept
    acceptCall();

  };

  //hangup call
  $('#hangup').click(function () {

    //disconnect from acision forge
    sdk.disconnect();

    //show waiting messaging
    $('.video .loading').show();

    //hide agent app
    $('.video-chat').hide();

    //show demo app page
    $('.acision').fadeIn();


  });

  //windown unload
  window.onunload = window.onbeforeonload = (function () {

    //disconnect sdk
    sdk.disconnect();

    //delete presence
    sdk.presence.deleteOwnPresentity();

  });


});
