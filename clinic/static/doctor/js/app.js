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

    var
      ID_TRIG = '#graph',
      X1      = 'x1',
      X2      = 'x2',
      Y1      = 'y1',
      Y2      = 'y2';

    var $graph = $(ID_TRIG);

    var
      data    = [],
      width   = $graph.width(),
      height  = $graph.height(),
      xmin    = 0,
      xmax    = 10,
      ymin    = -1.1,
      ymax    = -ymin,
      xScale  = d3.scale.linear(),
      yScale  = d3.scale.linear(),
      vis     = d3.select(ID_TRIG).append('svg:svg'),
      decor   = vis.append('svg:g'),
      graph   = vis.append('svg:g'),
      path    = graph.append('svg:path'),
      b       = graph.append('svg:line'),
      c       = graph.append('svg:line'),
      label   = graph.append('svg:text'),
      sine    = d3.svg.line(),
      time    = 0,
      i;

    for (i = 0; i < 84; i++) {
      data.push(i * 10 / 84);
    }

    xScale
      .domain([xmin, xmax])
      .range([0, width]);

    yScale
      .domain([ymin, ymax])
      .range([0, height]);

    vis
      .attr('class', 'trig')
      .attr('width', width)
      .attr('height', height);

    sine
      .x(function (d, i) { return xScale(d); })
      .y(function (d, i) { return yScale(Math.sin(d - time)); });

    // X-Axis
    decor.append('svg:line')
      .attr('class', 'axis')
      .attr(X1, xScale(xmin))
      .attr(Y1, yScale(0))
      .attr(X2, xScale(xmax))
      .attr(Y2, yScale(0));

    decor.append('svg:line')
      .attr('class', 'axis')
      .attr(X1, xScale(Math.PI))
      .attr(Y1, yScale(0))
      .attr(X2, xScale(Math.PI))
      .attr(Y2, yScale(0) + 8);

    path.style('stroke', 'red');

    // Y-Axis
    decor.append('svg:line')
      .attr('class', 'axis')
      .attr(X1, xScale(0))
      .attr(Y1, yScale(ymin))
      .attr(X2, xScale(0))
      .attr(Y2, yScale(ymax));

    // Triangle
    c
      .attr(X1, xScale(0))
      .attr(Y1, yScale(0));

    function draw() {

      var
        x = xScale(Math.cos(time)),
        y = yScale(-Math.sin(time));

      path
        .attr('d', sine(data));

      c
        .attr(X2, x)
        .attr(Y2, y);

      b
        .attr(X1, xScale(0))
        .attr(Y1, y)
        .attr(X2, x)
        .attr(Y2, y);

      time += .1;

      setTimeout(draw, 35);
    }
    draw();

  });


});





