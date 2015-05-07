$(document).ready(function(e) {
	
	//sdk
		var sdk;
	
	//enter api key form your Acision Forge account		
		var key = '49G0A50SiY4z';
	
	//enter username and password from user accounts	
		var un	= 'jonadair_gmail_com_0';
		var pw	= 'cFi9mjgy3';
		
	//set agents user namaes
		var agent1 = 'jonadair_gmail_com_1';
		var agent2 = 'jonadair_gmail_com_2';	
	
	//agent	
		var agent;
	
	//webrtc session
		var session;

	//local media
		var local;
	
	//agent media
		var remote;
	
	//modals
		var agent_pin_number;
		var agent_notice;	

	//define sdk
		setTimeout(function(){
			
			sdk = new AcisionSDK(key, {
				onConnected		: onConnected,
				onDisconnected	: onDisconnected,
				onAuthFailure	: onAuthFailure
			},{
				presistent	: true,
				username	: un,
				password	: pw
			});

		},500);
		
	//agent direct connect
		$('.appointment').click(function(evt){
			
			//prevent default
				evt.preventDefault();
				
			//modal
				agent_pin_number = $('#enter-agent-pin').bPopup({ positionStyle: 'fixed'});
			
		});
	
	//direct agent pin call
		$('#contact-form').submit(function(evt){
			
			//prevent default form submit
				evt.preventDefault();
			
			//hide non valid agent
				$('#non-valid-agent-msg').hide();
			
			//variables
				agent = $('#contact-form-name').val();
				
			//check if not empty
				if(agent != '' || agent != null){
					
					//check if one of valid agents
						if(agent == '1111' || agent == '2222'){
							
							//hide invalid message
								$('#non-valid-agent-msg').hide();

							//amanda
								if(agent == '1111'){
									
									//agent one / username from Forge Acision
										agent = agent1;	
									
								};
							
							//barry
								if(agent == '2222'){
									
									//agent two / username from Forge Acision
										agent = agent2;	
								};
					
							//connect to agent
								session = sdk.webrtc.connect(agent, {
									onConnect		: onCallConnectPin,
									onConnecting	: onCallConnectingPin,
									onClose			: onCallClosePin
								},{
									streamConfig: {
									  audioIn	: true,
									  audioOut	: true,
									  videoIn	: true,
									  videoOut	: true
									}
								});	
								
							//local video render
								session.localVideoElement = document.getElementById('videoLocal'); 
							
							//remote video & audio render
								session.remoteAudioElement 	= document.getElementById('audioRemote');
								session.remoteVideoElement 	= document.getElementById('videoRemote');
								
								$('video').prop('autoplay', true);
								
						}else{

							//show none valid agent message	
								$('#non-valid-agent-msg').fadeIn();
								
						};
					
				};
				
		});
	
	//start agent call
		$('.call').click(function(e){
			
			//prevent default click
				e.preventDefault();
			
			//get remote user id
				agent = $(this).data('agent-id');

			//connect to agent
				session = sdk.webrtc.connect(agent, {
					onConnect		: onCallConnect,
					onConnecting	: onCallConnecting,
					onClose			: onCallClose
				},{
					streamConfig: {
					  audioIn	: true,
					  audioOut	: true,
					  videoIn	: true,
					  videoOut	: true
					}
				});
				
			//local video render
				session.localVideoElement = document.getElementById('videoLocal'); 
			
			//remote video & audio render
				session.remoteAudioElement 	= document.getElementById('audioRemote');
				session.remoteVideoElement 	= document.getElementById('videoRemote');

		});

	//on connection
		function onConnected(evt){
			
			//on incoming session
				sdk.webrtc.setCallbacks({
					onIncomingSession: onCall
				});			
			
			//set presence
				sdk.presence.setOwnPresentity({
					status : 'available'
				}, '', { 
					onSuccess: function(){
							
					}				
				});

			//get agent one presence
				sdk.presence.getPresentities([agent1 + '@sdk.acision.com'], null, {
					onSuccess: function(evt){
						
						if(evt[0].fields.status == 'available'){
							$('#agent-one').show();
						};
							
					}
				});

			//get agent two presence
				sdk.presence.getPresentities([agent2 + '@sdk.acision.com'], null, {
					onSuccess: function(evt){

						if(evt[0].fields.status == 'available'){
							$('#agent-two').show();
						};
							
					}
				});			
			
			//subscribe to persences
				sdk.presence.subscribe([agent1 + '@sdk.acision.com',agent2 + '@sdk.acision.com'], ['status']);
				
			//subscribe to presence
				sdk.presence.setCallbacks({
					onPresentity : function(evt){
						
						//variables
							var user 	= evt[0].user;
							var status 	= evt[0].fields.status;	
						
						//check users
							if(user == agent1 + '@sdk.acision.com'){
								
								//amanada
									if(status == 'available'){
										
										//show chat
											$('#agent-one').fadeIn();
										
									}else if(status == 'unavailable'){
										
										//hide chat 
											$('#agent-one').fadeOut();
										
									}
								
							}else if(user == agent2 + '@sdk.acision.com'){
								
								//barry
									if(status == 'available'){
										
										//show chat
											$('#agent-two').fadeIn();
										
									}else if(status == 'unavailable'){
										
										//hide chat 
											$('#agent-two').fadeOut();
										
									}								
									
							}
						
					}
				});
				
				$('video').prop('autoplay', true); 
					
			
		};

	
	//on disconnect
		function onDisconnected(evt){

			//hide disconnect button
				$('#disconnect').hide();
			
			//clean html elements
				$('#videoLocal').attr('src', '');	
				$('#videoRemote').attr('src', '');
			
			//delete presence
				sdk.presence.deleteOwnPresentity();	
			
			//define new sdk
				sdk = new AcisionSDK(key, {
					onConnected		: onConnected,
					onDisconnected	: onDisconnected,
					onAuthFailure	: onAuthFailure
				},{
					username: un,
					password: pw
				});
			
		};
	
	//auth failure
		function onAuthFailure(evt){
			
			//console
				console.log('acision forge authenication error');

				
		};	

	//accept call
		function acceptCall(){
			
			//accept 
				session.accept();
				
			//hide accept button
				$('.video .loading').hide();
				$('#enter-agent-pin .loading').hide();	

		};

	//call on connection
		function onCallConnect(){
			
			//notifiy user that the call has been accepted and will start shortly
				$('.video .loading').hide();
				$('#enter-agent-pin .loading').hide();
			
		};

	//call on connection
		function onCallConnectPin(){
			
			//notifiy user that the call has been accepted and will start shortly
				$('#enter-agent-pin .loading').hide();
				
			//close modal
				agent_pin_number.close();
			
			//hide demo app page
				$('.acision').hide();
				
			//show agent app
				$('.video-chat').fadeIn();	
						
			
		};
	
	//call on connecting
		function onCallConnecting(){
			
			//notifiy user that the call is trying to connect
			//hide demo app page
				$('.acision').hide();
				
			//show agent app
				$('.video-chat').fadeIn();	
			
			//show waiting messaging
				$('.video .loading').show();
				

		};

	//call on connecting
		function onCallConnectingPin(){
			
			//notifiy user that the call is trying to connect
				$('#enter-agent-pin .loading').fadeIn();
				
		};
		
	//call on close
		function onCallClose(evt){
			
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
				if(status == 'offline'){

					//show modal
						agent_notice = $('#agent-offline').bPopup();
					
					//hide loading
						$('#enter-agent-pin .loading').hide();	
					
				};
				
			
		};	

	//call on close
		function onCallClosePin(evt){
			
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
			
			//close modal
				agent_pin_number.close();
			
			//offline agent
				if(status == 'offline'){

					//show modal
						agent_notice = $('#agent-offline').bPopup();
					
					//hide loading
						$('#enter-agent-pin .loading').hide();	
					
				};
			
		};	

	//incoming call
		function onCall(evt){
			
			//start session
				session = evt.session;
			
			//remote video & audio render
				session.remoteAudioElement 	= document.getElementById('audioRemote');
				session.remoteVideoElement 	= document.getElementById('videoRemote');
			
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
		$('#hangup').click(function(){
			
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
		window.onunload = window.onbeforeonload = (function(){
			
			//disconnect sdk
				sdk.disconnect();
			
			//delete presence
				sdk.presence.deleteOwnPresentity();	
				
		});	
	

});
