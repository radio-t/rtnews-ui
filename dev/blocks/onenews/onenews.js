$(function() {
	var $topStatus = $('#onenews__top-status'),
		$onenews = $('#onenews'),

		slug = getSlug();

	if (login && password) {
		$('#menu__back-link').attr('href', '/admin/');
	}

	if ($('#onenews').length) {
		if (typeof slug !== 'undefined' && slug.length > 0) {
			load();
		} else {
			location.href = '/';
		}
	}

	function load() {
		$.ajax({
			url: APIPath + '/news/slug/' + slug,
			type: 'GET',
			dataType: 'json',
			cache: true,
			async: true,
			beforeSend: function() {
				$topStatus.text('Загружаю..')
						  .show();
			}
		})
		.done(function(json) {
			$topStatus.hide();

			$(document).on('news-loaded', function() {
				var dqinterval = setInterval(function() {
				    var disqusHeight = $('#disqus_thread').height();
				    // 250 ≈ height of empty disqus
				    if (disqusHeight > 250) {
				    	$('#menu__item_to-comments')
				    		.css('display', 'inline-block')

				    		.find('.link')
				    		.click(function(event) {
				    			event.preventDefault();

				    			$('html,body').animate({
				    				scrollTop: $($(this).attr('href')).offset().top
				    			}, 500);
				    		});

				    	if (location.hash == '#to-comments') {
				    		$('#menu__item_to-comments .link').click();
				    	}

				        clearInterval(dqinterval);
				    }
				}, 100);
			});

			JSON2DOM(json);
			document.title = json.title;

			(function() { 
				var d = document, s = d.createElement('script');
				s.src = '//' + disqusID + '.disqus.com/embed.js';
				s.setAttribute('data-timestamp', +new Date());
				(d.head || d.body).appendChild(s);
			})();
		})
		.fail(function(response) {
			$topStatus.text('Ошибка при загрузке, попробуйте обновить страницу')
					  .slideDown();
			console.log(response);
		});
		
	}

	function JSON2DOM(json) {
		var info,
			date = new Date();

		date.setTime(Date.parse(json.ts));

		var $a = $('<a/>', {
			href: json.link,
			class: 'link',
			title: json.title,
			text: extractDomain(json.link),
			target: '_blank'
		});

		if (json.author) {
			info = json.author
				   + ' ('
				   + $a.prop('outerHTML')
				   + ')'
				   + ', '
				   + formatDate(date);
		} else {
			info = $a.prop('outerHTML')
				   + ', '
				   + formatDate(date);
		}

		$onenews.find('.onenews__title')
				.text(json.title)
				.attr('href', json.link)
				.attr('target', '_blank')
				.end()

				.find('.onenews__info')
				.html(info)
				.end()

				.find('.onenews__body')
				.html(json.content);

		$(document).trigger('news-loaded');
	}
});