/******************************************************************************/
/******************************************************************************/

function Template(options)
{
	$this=this;
	$options=options;
	$contentWidth=960;
	$pagePrefix='page-';
	$animationComplete=0;
};
	
/******************************************************************************/

Template.prototype.createHomeCarousel=function()
{
	$('.home-carousel-box').each(function() 
	{
		var box=$(this);
		var carousel=box.children('.home-carousel:first');
		$this.preloaderWait(box,function() 
		{	
			var height=parseInt(box.find('li>div>img').actual('height'));
	
			box.animate({'height':height},{duration:1000,easing:'easeOutQuint',complete:function() 
			{
				box.css({'height':'auto'}).removeClass('preloader');
				
				$this.setHomeCarouselHeight(carousel);

				carousel.carouFredSel(
				{
					auto					:
					{
						play				:	true,
						timeout_duration	:	4000
					},
					infinite				:	true,
					circular				:	true,
					direction				:	'left',
					responsive				:	true,
					items					: 
					{
						height				:	'auto',
						visible				:	1,
						minimum				:	1
					},
					pagination				:	
					{
						anchorBuilder		:	function() 
						{
							return($this.anchorBuilder($(this).parent('ul'),2));
						},
						container			:	function() 
						{ 
							return($(this).parents('.home-carousel-box').find('.pagination')); 
						}
					},		
					scroll: 
					{
						items				:	1,
						duration			:	800,
						fx					:	'cover',
						easing				:	'easeInOutExpo'
					},
					swipe					:
					{
						onTouch				:	true,
						onMouse				:	true
					},
					onCreate				:	function()
					{
						$(window).bind('resize',function() 
						{
							$this.setHomeCarouselHeight(carousel);
							carousel.trigger('updateSizes');
						});

						$this.updateWaypoints();
					}
				});
			}});
		});
	});
};

/******************************************************************************/

Template.prototype.setHomeCarouselHeight=function(carousel)
{
	var windowHeight=$(window).height();
	var imageHeight=carousel.find('img').actual('height');

	if((imageHeight<windowHeight) || (windowHeight<600))
		carousel.find('li').height('auto');
	else carousel.find('li').height(windowHeight);	
}

/******************************************************************************/

Template.prototype.createGoogleMaps=function(id)
{
	if($('#'+id).length)
	{
		var coordinate=new google.maps.LatLng($options.googleMap.coordinates_lat,$options.googleMap.coordinates_lng);

		var mapOptions= 
		{
			zoom				:	15,
			center				:	coordinate,
			scrollwheel			:	false,
			mapTypeControl		:	false,
			streetViewControl	:	false,
			zoomControlOptions	: 
			{
				position		:	google.maps.ControlPosition.RIGHT_CENTER
			},
			panControlOptions: 
			{
				position		:	google.maps.ControlPosition.LEFT_CENTER
			},
			mapTypeId			:	google.maps.MapTypeId.ROADMAP,
			styles				: 
			[
				{
					stylers		: 
					[
						{ 
							saturation	:	-100 
						}
					]
				}
			]
		};

		var googleMap=new google.maps.Map(document.getElementById(id),mapOptions);

		var markerOptions=
		{
			map					:	googleMap,
			position			:	coordinate,
			icon				:	'image/map_pointer.png'
		}

		new google.maps.Marker(markerOptions);

		$(window).resize(function() 
		{
			var center=googleMap.getCenter();
			google.maps.event.trigger(googleMap,'resize');
			googleMap.setCenter(center);
		});
	}
};

/******************************************************************************/

Template.prototype.createTwitterUserTimeline=function(selector)
{
	$.getJSON('plugin/twitter-user-timeline/twitter-user-timeline.php',function(data)
	{
		if((data.length) && ($(selector).length))
		{
			var userExp=/(^|\s)@(\w+)/g;
			var hashExp=/(^|\s)#(\w+)/g;
			
			var list=$('<ul>').attr('class','quotation-list');
			$(data).each(function(index,value)
			{
				var text=$('<span>').addClass('quotation-list-text');
				var author=$('<span>').addClass('quotation-list-author');
				var datetime=$('<span>').addClass('quotation-list-datetime');
				
				var quoteUp=$('<span>').addClass('quotation-list-icon-up');
				var quoteDn=$('<span>').addClass('quotation-list-icon-dn');
				
				var listElement=$(document.createElement('li'));
				
				var content='';
				
				content=linkify(value.text)
				content=content.replace(userExp,' <a href="http://www.twitter.com/$2">@$2</a>');
				content=content.replace(hashExp,' <a href="http://www.twitter.com/search?q=#$2&src=hash">#$2</a>');
				text.html(content);
				
				content=value.user.screen_name;
				author.html(content);
				
				content=$.timeago(value.created_at);
				datetime.html(content);
				
				list.append(listElement.append(quoteUp).append(text).append(quoteDn).append(author).append(datetime));
			});

			$(selector).append(list);
			
			list.parent().append($('<div>').addClass('pagination').addClass('clear-fix'));

			list.carouFredSel(
			{
				auto					:	false,
				infinite				:	true,
				circular				:	true,
				direction				:	'up',
				items					: 
				{
					visible				:	1,
					minimum				:	1
				},
				pagination				:	
				{
					anchorBuilder		:	function() 
					{
						return($this.anchorBuilder(list,1));
					},
					container			:	list.parent().find('.pagination') 
				},		
				scroll: 
				{
					items				:	1,
					duration			:	750,
					fx					:	'uncover-fade'
				},
				swipe					:
				{
					onTouch				:	true,
					onMouse				:	true
				},
				onCreate				:	function()
				{
					$this.updateCarouselSize(selector+'>.caroufredsel_wrapper>ul');
					$this.updateWaypoints();
				}
			});	
			
			list.find('a').attr('target','_blank');
		}
	});	
};

/******************************************************************************/

Template.prototype.createMenu=function()
{
	var menu=$('#menu');
	var menuList=$('#menu>ul');
	
	if(menu.length!=1) return;
	if(menuList.length!=1) return;
	
	menuList.superfish(
	{ 
		delay		:	400, 
		animation	:	{opacity:'show',height:'show'}, 
		speed		:	300,                         
		cssArrows	:	false                       
	}); 
	
	$(window).bind('resize',function() 
	{
		var menuItem=menuList.children('li.menu-selected');
		$this.animateMenuHover(menuItem,100);
	});
	
	var menuItem=menuList.children('li.menu-selected');
	$this.animateMenuHover(menuItem,0);	
};

/******************************************************************************/

Template.prototype.anchorBuilder=function(parent,margin)
{
	var count=parent.children('li').length;
	return('<a href="#" style="width:'+((100/count)-margin)+'%;margin-right:'+margin+'%"></a>');	
}

/******************************************************************************/

Template.prototype.createMenuResponsive=function()
{
	$('#menu-responsive>select').bind('change',function() 
	{
		window.location=$(this).val();
	})
};

/******************************************************************************/

Template.prototype.animateMenuHover=function(menuElement,duration)
{
	$('#menu>ul>li').removeClass('menu-selected');
	
	if(menuElement.length!=1)
	{
		$('#menu-selected').css({width:0});
		return;
	}
	
	var width=$(menuElement).actual('innerWidth');
	
	$(menuElement).addClass('menu-selected');
	
	$('#menu-selected').stop().animate({left:parseInt($(menuElement).position().left),width:width},{duration:duration,queue:false,complete:function() 
	{
			
	}});		
};

/******************************************************************************/

Template.prototype.createStickyNavigationBar=function()
{
	$this.preloaderWait($('body'),function() 
	{
		$('#navigation-bar').waypoint('sticky',
		{
			wrapper		: '<div>',
			stuckClass	: 'navigation-bar-sticky'
		});
	});
	
	$(window).scroll(function() 
	{
		var menuResponsive=$('#menu-responsive');
		
		var bar=$('#navigation-bar');
		var menuItem=$('#menu>ul>li>a');
		
		var logo=bar.find('.logo');
		
		if(menuResponsive.css('display')!='block')
		{
			if(bar.hasClass('navigation-bar-sticky'))
			{
				logo.css({'display':'none'});

				menuItem.stop().animate({'padding-top':10,'padding-bottom':10},{duration:250});

				clearTimeout($.data(this,'scrollTimer'));
				$.data(this,'scrollTimer',setTimeout(function() 
				{
					menuItem.stop().animate({'padding-top':40,'padding-bottom':40},{duration:250,complete:function() 
					{
						logo.css({'display':'block'});
					}});
				},500));
			}
			else
			{
				logo.css({'display':'block'});
				menuItem.css({'padding-top':40,'padding-bottom':40});
			}
		}
		else
		{
			logo.css({'display':'block'});
			menuItem.css({'padding-top':40,'padding-bottom':40});
		}
	});
};

/******************************************************************************/

Template.prototype.createNavigation=function()
{
	$(window).bind('hashchange',function(e) 
	{
		e.preventDefault();
		
		var hash=window.location.hash.substring(1);
		var page=$('.page-list>li#'+$pagePrefix+hash);
		
		if(page.length==1)
		{
			$this.updateWaypoints();
			
			$.scrollTo(page,{'duration':1000,'offset':-1*$('#navigation-bar').actual('height')+1,easing:'easeOutQuint','onAfter':function() 
			{
				window.location.hash='#page';
			}});				
		}
	});	
};

/******************************************************************************/

Template.prototype.preloadPage=function()
{
	$this.preloaderWait($('body'),function() 
	{	
		var pageClock=window.setTimeout(function() 
		{
			if($animationComplete==2)
			{
			
				var hash=window.location.hash.substring(1);
				if($.trim(hash).length!=0)
					$(window).trigger('hashchange');
				
				window.clearTimeout(pageClock);
				return;
			}
			
			$this.preloadPage();
			
		},100);
	});
};

/******************************************************************************/

Template.prototype.createImageOverlay=function()
{
	$('.image-overlay-image,.image-overlay-video,.image-overlay-url').each(function() 
	{
		$(this).children('a:first').append($('<span>').append('<span>'));
		
		$(this).hover(function() 
		{
			$(this).children('a:first').children('span').css({'left':'-100%'}).stop().animate({'left':'0'},{duration:300});
		},
		function()
		{
			$(this).children('a:first').children('span').stop().animate({'left':'100%'},{duration:300});
		});
	});
};

/******************************************************************************/

Template.prototype.createImageFancybox=function()
{
	var helpers={title:{type:'inside'}};

	helpers.buttons={skipSingle:true};

	$('.image-fancybox-image>a').fancybox(
	{	
		type					:	'image',
		beforeShow				:	function()
		{
			this.title=$(this.element).nextAll('.image-description-fancybox').text();
		},
		helpers					:	helpers
	});
};
	
/******************************************************************************/
	
Template.prototype.createVideoFancybox=function()
{	
	var helpers={title:{type:'inside'}};
	
	helpers.media={};
	
	$('.image-fancybox-video>a').fancybox(
	{
		beforeShow				:	function()
		{
			this.title=$(this.element).nextAll('.image-description-fancybox').text();
		},
		helpers					:	helpers
	});
};

/******************************************************************************/

Template.prototype.preloaderWait=function(object,callbackFunction)
{
	var preloaderClock=window.setTimeout(function() 
	{
		if(object.find('.preloader-image').length)
			$this.preloaderWait(object,callbackFunction);
		else
		{
			window.clearTimeout(preloaderClock);
			callbackFunction();
		}
	},10);
};

/******************************************************************************/

Template.prototype.createImage=function()
{
	$('.preloader-image img').each(function() 
	{
		$(this).attr('src',$(this).attr('src')+'?i='+$this.getRandom(1,100000));
		$(this).bind('load',function() 
		{ 
			var height=parseInt($(this).actual('height'));

			$(this).parent('.preloader-image').animate({height:height},500,function() 
			{
				$(this).css({'height':'auto','background-image':'none'});

				$(this).children('img').animate({opacity:1},300,function() 
				{					
					$(this).parent().removeClass('preloader-image');
					$(this).unbind('load');
				}); 
			});
		});
	});
};

/******************************************************************************/

Template.prototype.createGallery=function()
{
	$('.gallery').each(function() 
	{
		var gallery=$(this);
		
		$this.preloaderWait($(this),function() 
		{	
			$this.setGalleryResponsive(gallery);
			$(window).resize(function() 
			{
				$this.setGalleryResponsive(gallery);
			});
			
			gallery.children('ul.filter-list').children('li').children('a').bind('click',function(e)
			{
				e.preventDefault();
				$this.filter($(this));
			});

			gallery.removeClass('preloader');
		
			var selected=gallery.find('ul.filter-list>li>a.selected');
			if(selected.length) $this.filter(selected);
			
			$this.updateWaypoints();
		});
	})
};

/******************************************************************************/

Template.prototype.setGalleryResponsive=function(gallery)
{
	var parent=gallery.parent();
	var parentWidth=parent.actual('width');
	
	var marginRight=30;
	var marginBottom=30;
	
	var galleryList=gallery.children('ul.gallery-list');
	
	if(parentWidth>460)
	{
		if(galleryList.hasClass('layout-p-100'))
		{
			marginRight=0;
		}
		if(galleryList.hasClass('layout-p-20x20x20x20'))
		{
			marginRight=10;
			marginBottom=10;			
		}
	}	
	else marginRight=0;

	if(parentWidth>460) galleryList.find('li').removeClass('responsive-column-2');
	else galleryList.find('li').addClass('responsive-column-2');
	
	var galleryListWidth=parentWidth+marginRight;
	
	galleryList.find('li>div').css({'margin-right':marginRight,'margin-bottom':marginBottom});
	galleryList.css('width',galleryListWidth);	
	
	galleryList.isotope(
	{
		resizable			:	false,
		layoutMode			:	'fitRows',
		animationEngine		:	'jquery',
		onLayout			:	function()
		{
			$animationComplete++;
			$this.updateWaypoints();
		}
	},function() { $this.updateWaypoints(); });
};

/******************************************************************************/

Template.prototype.filter=function(object)
{
	var filter='';

	object.parents('ul.filter-list').find('a').removeClass('selected');
	object.addClass('selected');

	if(!object.hasClass('filter-0'))
	{
		var aClass=object.attr('class').split(' ');
		for(var i=0;i<aClass.length;i++) 
		{
			if(aClass[i].indexOf('filter-')!=-1) filter+=' .'+aClass[i];			
		}			
	}

	object.parents('div.gallery').children('ul.gallery-list').isotope(
	{
		filter				:	filter,
		resizable			:	false,
		layoutMode			:	'fitRows',
		animationEngine		:	'jquery',
		onLayout			:	function()
		{
			$animationComplete++;
			$this.updateWaypoints();
		}
	},function() { $this.updateWaypoints(); });
};

/******************************************************************************/
	
Template.prototype.getRandom=function(min,max)
{
	return((Math.floor(Math.random()*(max-min)))+min);
};

/******************************************************************************/

Template.prototype.createNivoSlider=function()
{
	$('.nivo-slider').each(function() 
	{
		var slider=$(this);
		$this.preloaderWait(slider,function() 
		{	
			slider.removeClass('preloader');
			
			var imageCount=slider.find('div').length;
			
			slider.nivoSlider(
			{
				directionNav	:	false,
				afterLoad		:	function()
				{
					var pagination=slider.nextAll('.nivo-controlNav');

					pagination.addClass('pagination');
					pagination.children('a').css({'width':((100/imageCount)-4)+'%','margin-right':'4%'});
					
					$this.updateWaypoints();
				}
			});
		});
	});
};

/******************************************************************************/

Template.prototype.createProgressBar=function(object,animate) 
{
	object=typeof(object)=='undefined' ? $('.progress-bar') : object;
	
	object.not('.animation-complete').each(function() 
	{
		var c=$(this).attr('class').split(' ');
		var pattern=/value-[0-9]{1,3}/;
		
		for(var i in c)
		{
			if(pattern.test(c[i]))
			{
				var t=c[i].split('-');
				var value=parseInt(t[t.length-1]);
				
				if(value>0)	
				{
					$(this).append('<span>').append('<span>');
					
					if(animate)
						$(this).children('span:first').animate({width:value+'%'},{duration:2000});
					else $(this).children('span:first').css({'width':value+'%'});
				}
				
				$(this).addClass('animation-complete');
			}
		}
	})
};

/******************************************************************************/

Template.prototype.createCounter=function(object,animate) 
{
	object=typeof(object)=='undefined' ? $('.counter') : object;
	
	object.not('.animation-complete').each(function() 
	{
		var c=$(this).attr('class').split(' ');
		var pattern=/value-[0-9]{1,3}/;
		
		for(var i in c)
		{
			if(pattern.test(c[i]))
			{
				var t=c[i].split('-');
				var value=parseInt(t[t.length-1]);
				
				if(value>0)	
				{
					var object=$(this).children('span:first');

					if(animate) window.setTimeout(function() {$this.runCounter(object,value);},0);
					else object.html(value)
				}
				
				$(this).addClass('animation-complete');
			}
		}
	})
};

/******************************************************************************/

Template.prototype.runCounter=function(object,limit)
{
	var currentValue=parseInt(object.text());
	
	if(isNaN(currentValue)) currentValue=0;
	if(currentValue==limit) return;
	
	object.text(currentValue+1);
	
	window.setTimeout(function() {$this.runCounter(object,limit);},20);
};

/******************************************************************************/

Template.prototype.createQuotationCarousel=function()
{
	$('.quotation-list').carouFredSel(
	{
		auto					:	true,
		infinite				:	true,
		circular				:	true,
		direction				:	'up',
		items: 
		{
			visible				:	1,
			minimum				:	1
		},
		pagination				:	
		{
			anchorBuilder		:	function() 
			{
				return($this.anchorBuilder($(this).parent('ul'),4));
			},
			container			:	function() {return($(this).parents('.quotation-list-wrapper').find('.pagination'));}
		},		
		scroll: 
		{
			items				:	1,
			duration			:	750,
			fx					:	'uncover-fade'
		},
		swipe					:
		{
			onTouch				:	true,
			onMouse				:	true
		},
		onCreate				:	function()
		{
			$this.updateWaypoints();
		}
	});	
};

/******************************************************************************/

Template.prototype.createAccordion=function()
{
	$('.template-accordion').accordion(
	{
		icons			:	'',
		active			:	0,
		animated		:	'easeOutExpo',
		heightStyle		:	'content',
		collapsible		:	true,
		activate		:	function(event,ui)
		{
			$this.updateWaypoints();
		},
		create			:	function(event,ui)
		{
			$this.updateWaypoints();
		}
	});
};

/******************************************************************************/

Template.prototype.createForm=function()
{
	/*
	$('#contact-form').bind('submit',function(e) 
	{
		e.preventDefault();
		submitContactForm();
	});
	*/
	$('form textarea').elastic();
	$('form label').inFieldLabels();	
};

/******************************************************************************/

Template.prototype.updateCarouselSize=function(selector)
{
	selector=selector==null ? '.caroufredsel_wrapper>ul:not(.update-carousel-disable)' : selector;
	$(selector).each(function() 
	{
		$(this).children('li').height('auto');

		var height=$this.getMax($(this),'height');

		$(this).children('li').css('height',height);
		$(this).parent('.caroufredsel_wrapper').css('height',height);

		$(this).trigger('configuration',{height:height});
	});

	$(selector).trigger('updateSizes');
};

/******************************************************************************/

Template.prototype.getMax=function(object,type)
{
	var value=0;
	object.children('li').each(function() 
	{
		var cValue=$(this).actual(type);
		value=cValue>value ? cValue : value;
	});

	return(value);
};

/******************************************************************************/

Template.prototype.createCarousel=function()
{
	$('.carousel').each(function() 
	{
		var carousel=$(this);
		var carouselContent=carousel.children('.carousel-content');
		
		var carouselList=carouselContent.find('ul:first');
		var margin=carouselList.hasClass('layout-p-20x20x20x20x20') ? 10 : 30;
	
		carouselList.children('li').css({'margin-right':margin,'float':'left','clear':'none'});
		
		var columnCount=$this.getLayoutColumnCount(carouselList);
		var columnWidth=(($contentWidth+margin)/columnCount);
		
		$this.setCarouselResponsive(carousel,columnWidth,margin);
		$(window).bind('resize',function() 
		{
			$this.setCarouselResponsive(carousel,columnWidth,margin);
		});
	
		carouselList.carouFredSel(
		{
			auto					:	false,
			infinite				:	true,
			circular				:	true,
			direction				:	'left',
			items: 
			{
				minimum				:	$this.getLayoutColumnCount(carouselList)+1		
			},	
			scroll: 
			{
				items				:	1,
				duration			:	750,
				fx					:	'scroll'
			},
			pagination				:	
			{
				anchorBuilder		:	function() 
				{
					return($this.anchorBuilder($(this).parent('ul'),4));
				},
				container			:	function() 
				{ 
					return($(this).parents('.carousel').find('.pagination')); 
				}
			},	
			swipe					:
			{
				onTouch				:	true,
				onMouse				:	true
			},
			onCreate				:	function()
			{
				$this.setCarouselResponsive(carousel,columnWidth,margin);
				$this.updateWaypoints();
			}
		});		
	})
};

/******************************************************************************/

Template.prototype.setCarouselResponsive=function(carousel,columnWidth,margin)
{	
	var parent=$(carousel).parent();
	var parentWidth=parent.actual('width');
	
	var carouselContent=$(carousel).children('.carousel-content');
	
	var list=$(carouselContent).find('ul:first');
	var listElement=list.children('li');
	
	if(parentWidth>300)
	{
		var columnCount=Math.floor((parentWidth+margin)/(columnWidth));
		if(columnCount==0) columnCount=1;
	}
	else columnCount=1;

	if(columnCount==1) columnWidth=parentWidth;
	
	var carouselWidth=columnWidth*columnCount;
	
	listElement.css('width',columnWidth-margin);
	
	carousel.css('width',carouselWidth-margin);
	carouselContent.css('width',carouselWidth);
	
	list.trigger('configuration',['width',carouselWidth]);
	list.trigger('configuration',['items.width',columnWidth]);
	list.trigger('configuration',['items.visible',columnCount]);
	list.trigger('configuration',['items.minimum',columnCount+1]);
	
	list.trigger('updateSizes');	
};

/******************************************************************************/

Template.prototype.getLayoutColumnCount=function(object)
{
	if(object.hasClass('layout-p-50x50')) return(2);
	if(object.hasClass('layout-p-33x33x33')) return(3);
	if(object.hasClass('layout-p-25x25x25x25')) return(4);
	if(object.hasClass('layout-p-20x20x20x20x20')) return(5);
	
	if(object.hasClass('layout-p-33x66')) return(2);
	if(object.hasClass('layout-p-66x33')) return(2);
	
	return(1);
};

/******************************************************************************/

Template.prototype.updateWaypoints=function()
{
	$.waypoints('refresh');
};

/******************************************************************************/

Template.prototype.animateToCurrentMenuItem=function(object)
{
	var id=object.attr('id').substring($pagePrefix.length);
	var menuItem=$('#menu>ul>li').find('a[href="#'+id+'"]').parent('li');
	$this.animateMenuHover(menuItem,500);
};

/******************************************************************************/

Template.prototype.isAnimationComplete=function(object)
{
	return(object.hasClass('animation-complete') ? true : false);
};

/******************************************************************************/

Template.prototype.completeAnimation=function(object)
{
	object.addClass('animation-complete');
};

/******************************************************************************/

Template.prototype.createWaypoints=function()
{
	/**************************************************************************/
	
	if($options.animation.enable!=1)
	{
		$this.createCounter(undefined,false);
		$this.createProgressBar(undefined,false);
		return;
	}
	
	/**************************************************************************/
	
	$('.page-list>li').waypoint(function(direction)
	{
		if(direction=='down') $this.animateToCurrentMenuItem($(this));
	},
	{
		offset	:	'50%'
	})
	.waypoint(function(direction)
	{
		if(direction=='up')
		{
			var prevPage=$(this).prev('li');
			if(prevPage.length==1) $this.animateToCurrentMenuItem(prevPage);
		}
	},
	{
		offset	:	'50%'
	});
	
	/**************************************************************************/
	
	$('.progress-bar').waypoint(function()
	{
		$this.createProgressBar($(this),true);
	},
	{
		offset	:	'90%'
	});
	
	/**************************************************************************/
	
	$('.counter').waypoint(function()
	{
		$this.createCounter($(this),true);
	},
	{
		offset	:	'90%'
	});
	
	/**************************************************************************/

	$('.feature-list>li>span.icon').waypoint(function()
	{
		if(!$this.isAnimationComplete($(this)))
		{
			$(this).animate({opacity:1},{duration:500});
			$this.completeAnimation($(this));
		}
	},
	{
		offset	:	'70%'
	})
	.waypoint(function()
	{
		if(!$this.isAnimationComplete($(this)))
			$(this).css({opacity:0.1});
	},
	{
		offset	:	'110%'
	});
	
	/**************************************************************************/

	$('.post-list.post-list-1>li').waypoint(function()
	{
		if(!$this.isAnimationComplete($(this)))
		{
			$(this).css({opacity:1}).effect('slide',{duration:500});
			$this.completeAnimation($(this));
		}
	},
	{
		offset	:	'90%'
	})
	.waypoint(function()
	{
		if(!$this.isAnimationComplete($(this)))
			$(this).css({opacity:0});
	},
	{
		offset	:	'120%'
	});
	
	/**************************************************************************/

	$('.animate-layout.layout-p-50x50').waypoint(function()
	{
		if(!$this.isAnimationComplete($(this)))
		{
			var columnLeft=$(this).children('.column-left');
			var columnRight=$(this).children('.column-right');
			
			columnLeft.css({opacity:1}).effect('slide',{duration:500});
			columnRight.css({opacity:1}).effect('slide',{duration:500,direction:'right'});

			$this.completeAnimation($(this));
		}
	},
	{
		offset	:	'90%'
	})
	.waypoint(function()
	{
		if(!$this.isAnimationComplete($(this)))
		{
			$(this).children('.column-left').css({opacity:0});
			$(this).children('.column-right').css({opacity:0});
			
		}
	},
	{
		offset	:	'120%'
	});

	/**************************************************************************/
};

/******************************************************************************/

Template.prototype.createPricingList=function()
{
	$('ul.pricing-list>li>div').qtip(
	{
		style		:	
		{ 
			classes	:	'qtip-pricing-list'
		},
		content		: 	
		{ 
			text	:	function() {return($(this).children('.pricing-list-tooltip').html());}
		},
		position	: 	
		{ 
			my		:	'bottom center',
			at		:	'top center'
		}
	});		
};

/******************************************************************************/

Template.prototype.createParallax=function()
{
	if($options.parallax.enable!=1) return;
	
	$('.section-parallax').css({'background-attachment':'fixed'}).parallax('50%',0.5,true);
};

/******************************************************************************/
/******************************************************************************/