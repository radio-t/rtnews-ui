$(function() {
	var $topStatus = $('#onenews__top-status'),
		$onenews = $('#onenews'),

		slug = getSlug();

		login = localStorage.getItem('login'),
		pass = localStorage.getItem('password');

	if (login && pass) {
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

		if (json.author) {
			info = json.author
				   + ' (' + extractDomain(json.link) + ')'
				   + ', '
				   + formatDate(date);
		} else {
			info = extractDomain(json.link)
				   + ', '
				   + formatDate(date);
		}

		$onenews.find('.onenews__title')
				.text(json.title)
				.end()

				.find('.onenews__info')
				.html(info)
				.end()

				.find('.onenews__body')
				.html(json.content);
	}
});