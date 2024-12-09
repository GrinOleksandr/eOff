(function ($, root, undefined) {
	var ajaxurl = '/wp-admin/admin-ajax.php';

	$(document).ready(function() {
	// scroller
	$('#scroll_to_top_btn').on('click',function(event) {
		$('body,html').animate({
			scrollTop: 0
		}, 500);
	});	
	// footer message
	$('.fq_reminder').hover(function() {
		$('#get_info').stop(true, true).fadeIn('300');
	}, function() {
		$('#get_info').stop(true, true).delay(800).fadeOut('400');
	});

	$('#get_info').hover(function() {
		// $(this).stop(true,true);
	});

	//menu switcer
		$('#nav_switcher').on('click',function(event) {
			$('#switchers_nav').toggleClass('visible');
			$(this).toggleClass('touch');
			$('#h_type_nav_switcher').toggleClass('touch');
		});

		$('#h_type_nav_switcher').on('click',function(event) {
			$('#switchers_nav').toggleClass('visible');
			$(this).toggleClass('touch');
			$('#nav_switcher').toggleClass('touch');
		});

	// NEMU
		var main_items = $('#switchers_nav > ul > li');

		main_items.on('click', function(event) {
			main_items.removeClass('activemenuitem');
			$(this).addClass('activemenuitem');
			var this_sub_menu = $(this).find('ul.sub-menu').first();
			var isvisible = this_sub_menu.is(':visible');
			if(!isvisible){
				event.preventDefault();
				this_sub_menu.hide();
				$(this).find('ul.sub-menu').first().fadeIn();
				
			}
		});

		$(document).mouseup(function (e) {
			var container = $('#switchers_nav > ul ul.sub-menu');
			if (container.has(e.target).length === 0){
				container.fadeOut('100');
			}

			if (main_items.has(e.target).length === 0){
				main_items.removeClass('activemenuitem');
			}


			var containerr = $('.blox_wrapper');
			if (containerr.has(e.target).length === 0){
				$('div#blox_content .home_blox').fadeOut('100');
				$('div#blox_content .home_blox').removeAttr('style');
				$('#blox_tabs .home_blox').removeClass('activetab');
			}
		});

		var ico_place = $('#switchers_nav .ico_place');
		var icobg = ['otcluchenia ico.png', 'otcluchenia ico.png', 'otcluchenia ico.png', 'otcluchenia ico.png'];

		ico_place.each(function(index, el) {
			$(el).css('background-image', 'url(../img/icons/' + icobg[index] + ')');
		});	
		
	// block`s
		$('#blox_tabs .home_blox').on('click', function(event) {
			if( $(this).hasClass('activetab') == false ){
				$('#blox_tabs .home_blox').removeClass('activetab');
				$(this).addClass('activetab');
				var title = $(this).attr('title');
				$('#blox_content .home_blox').hide();
				$('#blox_content .home_blox.'+title).fadeIn('1000');
			}
		});

	// poweroff list
		$('#otcluchennie .down_obl_wrapp').each(function(index, el) {
			var oblid = $(el).data('oblid');

			var ra = $('#interactive_svg path[data-scrolto="'+ oblid +'"]').css({
				'fill': '#f44',
				'cursor': 'pointer'
			});;




			if(oblid == 265)$('#interactive_svg path[data-scrolto="'+ oblid +'"]').css('fill', '#C50101');
			/*
			$('.obl_title[data-oblid="'+ oblid +'"]').css({
				'color': '#200',
				'cursor': 'pointer',
				'font-weight': '600'
			});
			*/
			
			$('.obl_title[data-oblid="'+ oblid +'"]').addClass('active');


		});

		//scroll
		$('#interactive_svg path').on('click', function(event) {
			var target =  $(this).data('scrolto');
			var target_h = $('.down_obl_wrapp[data-oblid="' + target + '"]').offset().top;


			$('body,html').animate({
				scrollTop: (target_h - 150)
			}, 500);
			return false;
		});

		$('.obl_title').on('click', function(event) {
			var target =  $(this).data('oblid');
			var target_h = $('.down_obl_wrapp[data-oblid="' + target + '"]').offset().top;


			$('body,html').animate({
				scrollTop: (target_h - 150)
			}, 500);
			return false;
		});















	// news
	if($('#news_content').length != 0){
		var offset_news_content = $('#news_content').offset().top;
		var height_news_content = $('#news_content').height();

		$('div[id^="inset_new"]').on('click', function(event) {
			if( $(this).hasClass('activetab') == false ){

				$('div[id^="inset_new"]').removeClass('activetab');
				$(this).addClass('activetab');
				var title = $(this).attr('title');
				$('#news_content .tab_newes').hide();
				$('#news_content #'+title).fadeIn('1000');
			}
			height_news_content = $('#news_content').height();
		});
	}

	// moving vkladki
		var windows_h = $(window).height();
		var scroll_position_s = $(document).scrollTop();
		
		$(document).scroll(function(event) {



			var scroll_position = $(document).scrollTop();

			if(scroll_position >= 162){
				$('header.header').addClass('slicktotop');
			}else{
				$('header.header').removeClass('slicktotop');
			}

			if($('#news_tabs').length != 0 ){

				var h_news_tabs = $('#news_tabs').offset().top;
				var height_news_tabs = $('#news_tabs').height();

				if( scroll_position > (h_news_tabs-100) && scroll_position < (h_news_tabs+height_news_content-height_news_tabs)){
					var peremennaya_h = scroll_position - (h_news_tabs-100);
					$('#news_tabs').css('padding-top', peremennaya_h + 'px');
				}
				if( scroll_position < (h_news_tabs-100)){
					$('#news_tabs').removeAttr('style');
				}
			}

			// scrollToTop
			if(scroll_position >= windows_h){
				$('#scroll_to_top_btn').show();
				
			}else{
				$('#scroll_to_top_btn').hide();

			}

		});//document scroll

		if($('#next-down').length == 1){
			$('#next-down').on('click', function(event) {
				var after_slider = $('#home_news').offset().top;
			
				$('body,html').animate({
					scrollTop: after_slider - 50
				}, 500);
			});
		}




	});//document ready

	$(document).ready(function() {
		if( $('#faq').length != 0){
			$('.quest_block h4.questing').on('click', function(event) {
				$(this).closest('.quest_block').toggleClass('open_answ');
			});
		}

		if( $('#ccf').length != 0){

			var curr_user_type = $('input:radio[name="user_type"]').val();

			$('#ccf fieldset').each(function(index, el) {
				var hc = $(el).hasClass(curr_user_type);
				if(!hc){
					$(el).hide();
				}
			});
			
			$('input:radio[name="user_type"]').change(function(){
				if ( $(this).is(':checked') ) {
					var ch_val =  $(this).val();
				}
					

				$('#ccf fieldset, #ccf #some_ur_info').each(function(index, el) {
					var hc = $(el).hasClass(ch_val);
					if(!hc){
						$(el).hide('500');
					}else{
						$(el).show('500');
					}
				});

				if( ch_val == 'p' ){
					$('#ur_name').removeAttr('required');
					$('#own_number_p').removeAttr('required');
					$('#counter_number_p').removeAttr('required');
					$('#own_number').attr('required','required');
				}else{
					$('#ur_name').attr('required','required');
					$('#own_number_p').attr('required','required');
					$('#counter_number_p').attr('required','required');

					$('#own_number').removeAttr('required');

				}


			}); // user_type change

			$('#is_new').change(function(){
				var cut = $('input:radio[name="user_type"]').val();
				var is_new = $('#is_new').is(':checked');

				if(cut == 'p'){

					if(is_new) $('#own_number').removeAttr('required');
					else $('#own_number').attr('required','required');
					
				}

			});


			$('#fucking_big_form').submit(function(event) {
				event.preventDefault();
				$('#fucking_big_form .spinner').show();

				var serialize = $(this).serialize();
				var m = $('#fucking_big_form').data('mail');
				
				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: {
						action:'mailto_callcenter',
						info: serialize,
						mailto: m
					},
				})
				.done(function(done) {
					console.log('done', done);

					$('#fucking_big_form .spinner').hide();
					$('#fucking_big_form #sendOK').show('fast');

					// window.location.href = "http://www.zoe.com.ua";

					$('#fucking_big_form')[0].reset();

				})
				.fail(function(fail) {
					console.log('fail', fail);
				})
				.always(function(always) {
				});
				

			});

		}

	// homepage main slick
	if( $('#home_main_slider').length != 0 ){
		$('#home_main_slider').slick({
			'prevArrow':'<div class="hps slick-prev"><i class="fa fa-chevron-left"></i></div>',
			'nextArrow':'<div class="hps slick-next"><i class="fa fa-chevron-right"></i></div>',
			 'autoplay': true
		});
	}



	// ajax energycenter
	if( $('#requests').length == 1){

		$('#requests .sidebar li').on('click',function(event) {
			event.preventDefault();

			var req = $(this).data('request');
			console.log('req', req);
			/* Act on the event */

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action:'ec_request',
					req: req,
					ec_login: $('#ec_login').val(),
					ec_pass: $('#ec_pass').val()
				},
			})
			.done(function(rep) {
				
				$('#result_wrapper').html(rep);

			});
				
			
		});

	    $("#content .tab_wrp").hide(); // Скрытое содержимое
	    $("#tabs li:first").attr("id","current"); // Какой таб показать первым
	    $("#content div:first").fadeIn(); // Показ первого контента таба
	 
	    $('#tabs a').click(function(e) {
	        e.preventDefault();
	        $("#content .tab_wrp").hide(); //Скрыть всё содержимое
	        $("#tabs li").attr("id",""); //Сброс идентификаторов
	        $(this).parent().attr("id","current"); // Активация идентификаторов
	        $('#' + $(this).attr('title')).fadeIn(); // Показать содержимое текущей вкладки
	    });


	    $('#tab1_date_str').datepicker({
			dateFormat: 'yy-mm-dd',
			maxDate: new Date()
		});
	    $('#tab1_date_end').datepicker({
			dateFormat: 'yy-mm-dd',
			maxDate: new Date()
		});
	    $('#tab2_date_str').datepicker({
			dateFormat: 'yy-mm-dd',
			maxDate: '-1d'
			// maxDate: new Date()
		});
	    $('#tab2_date_end').datepicker({
			dateFormat: 'yy-mm-dd',
			maxDate: '-1d'
			// maxDate: new Date()
		});

	    $('#tab3_date_str').datepicker({
			dateFormat: 'yy-mm-dd',
			maxDate: new Date()
		});
	    $('#tab3_date_end').datepicker({
			dateFormat: 'yy-mm-dd',
			maxDate: new Date()
		});

	    /*** 	ajax do 	***/

	    //tab1
	    $('#tab1 .btn_update').on('click', function(event) {
	    	event.preventDefault();
	    	$('#tab1 .tab_loader').fadeIn();
	    	var fid_str = '';
	    	var fid_checked_count = 0;

	    	$('#tab1 .control_block.fiders input:checked').each(function(index, el) {
	    		fid_str = fid_str + $(el).val() + '*';
	    		fid_checked_count++;
	    	});

	    	var firer_count = $('#hidden_firer_count').val();
			firer_count = Number(firer_count);

	    	tab_result_width = 226 * fid_checked_count * firer_count + 5 * firer_count - 5;
	    	console.log('fid_checked_count', fid_checked_count);
	    	console.log('firer_count', firer_count);



	    	console.log('tab_result_width', tab_result_width);

	    	tab1_date_str 	= $('#tab1_date_str').val();
	    	tab1_date_end 	= $('#tab1_date_end').val();
	    	ec_login 		= $('#hidden_ec_login').val();
	    	
	    	console.log('fid_str', fid_str);
	    	$('#tab1 .tab_result').html('');
		    $.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action:'ecweb1',
					tab1_date_str: tab1_date_str,
					tab1_date_end: tab1_date_end,
					fid_str: fid_str,
					ec_login:ec_login
				},
			})
			.done(function(response) {
		    	$('#tab1 .btn_excel').removeAttr('disabled');

	    		$('#tab1 .tab_loader').fadeOut();
	    		$('#tab1 .tab_result').html(response).width(tab_result_width);
			});

	    });
		
		//tab2
	    $('#tab2 .btn_update').on('click', function(event) {
	    	event.preventDefault();
	    	$('#tab2 .tab_loader').fadeIn();
	    	var fid_str = '';
	    	var fid_checked_count = 0;

	    	$('#tab2 .control_block.fiders input:checked').each(function(index, el) {
	    		fid_str = fid_str + $(el).val() + '*';
	    		fid_checked_count++;
	    	});

	    	var firer_count = $('#hidden_firer_count').val();
			firer_count = Number(firer_count);


	    	tab2_date_str 	= $('#tab2_date_str').val();
	    	tab2_date_end 	= $('#tab2_date_end').val();
	    	ec_login 		= $('#hidden_ec_login').val();
	    	
	    	// calc width
	    	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			var firstDate = new Date( tab2_date_end );
			var secondDate = new Date( tab2_date_str );

			var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
			console.log('diffDays', diffDays + 1);

	    	tab_result_width = ( diffDays + 1 ) * 210 * fid_checked_count * firer_count;

	    	$('#tab2 .tab_result').html('');
		    $.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action:'ecweb2',
					tab2_date_str: tab2_date_str,
					tab2_date_end: tab2_date_end,
					fid_str: fid_str,
					ec_login:ec_login
				},
			})
			.done(function(response) {
		    	$('#tab2 .btn_excel').removeAttr('disabled');

	    		$('#tab2 .tab_loader').fadeOut();

	    		// $('.count_row')

	    		$('#tab2 .tab_result').html(response);
			});

	    });

		//tab3
	    $('#tab3 .btn_update').on('click', function(event) {
	    	event.preventDefault();
	    	$('#tab3 .tab_loader').fadeIn();
	    	var fid_str = '';
	    	var fid_checked_count = 0;

	    	$('#tab3 .control_block.fiders input:checked').each(function(index, el) {
	    		fid_str = fid_str + $(el).val() + '*';
	    		fid_checked_count++;
	    	});

	    	var firer_count = $('#hidden_firer_count').val();
			firer_count = Number(firer_count);


	    	tab3_date_str 	= $('#tab3_date_str').val();
	    	tab3_date_end 	= $('#tab3_date_end').val();
	    	ec_login 		= $('#hidden_ec_login').val();

	    	$('#tab3 .tab_result').html('');
	    	
		    $.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action:'ecweb3',
					tab3_date_str: tab3_date_str,
					tab3_date_end: tab3_date_end,
					fid_str: fid_str,
					ec_login:ec_login
				},
			})
			.done(function(response) {
		    	$('#tab3 .btn_excel').removeAttr('disabled');

	    		$('#tab3 .tab_loader').fadeOut();

	    		$('#tab3 .tab_result').html(response);
			});

	    });
		
	}// requests

	$( document ).ajaxComplete(function(event, xhr, settings) {
		var str = settings.data;
		if(str.indexOf('ecweb2') + 1) {
			cccc = 0;
	    	$('#tab2 .tab_result .count_row').each(function(index, el) {
	    		v = $(el).val();
	    		v = Number(v);
	    		cccc = cccc + v;
	    	});
			tab_result_width = (cccc * 220);
	    	$('#tab2 .tab_result').width(tab_result_width);
		}
	});

	if( $('#export_zges_data').length == 1 ){
		function do_step_2(){

		}


		$('#do_report').on('click', function(event) {
			event.preventDefault();
			/* Act on the event */
			$('#export_zges_data .progress').show();

			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action:'do_report1',
					status: 1
				},
			})
			.done(function(response) {
				console.log('response', response);
	    		$('#export_zges_data .progress .steps_label').html('Выполнено этапов 1 из 5');
	    		$('#export_zges_data .progress .steps_list').append('<li>1. Страница показаний отключена.</li>');

	    		

				});
		});





		// 	$.ajax({
		// 	url: ajaxurl,
		// 	type: 'POST',
		// 	data: {
		// 		action:'do_report1',
		// 		status: 0
		// 	},
		// }).done(function(response) {
		// 		$('#export_zges_data .report_errors').html(response);
		// });

	} //export_zges_data





		$('#message').on('keyup', function(event) {
			/* Act on the event */
			$('#message_count > span').text( $(this).val().length )
		});







	});//document ready2

})(jQuery, this);