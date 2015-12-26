$(function() {
	if ($('#news__list').length
		&& !$('.news_deleted').length
		&& !$('.news_archive').length) {
		$('#geek').click(function(event) {
			event.preventDefault();
			geekNews();
		});
	}

	if (location.hash == '#geek') {
		$(document).on('fullpage-loaded', function() {
			$('#geek').click();
		});
	}
});

$(document).on('current-updated', function() {
	var $currentNews = $('#current'),
		$toCurrent = $('#to-current');

	if ($toCurrent.length && $currentNews.length) {
		$toCurrent.css('display', 'inline-block');

		if (location.hash == '#current') {
			scrollToEl($currentNews);
		}

		$toCurrent.click(function(event) {
			event.preventDefault();
			scrollToEl($currentNews);
		});
	} 
});

function scrollToEl($el) {
	$('html, body').animate({
		scrollTop: $el.offset().top
	}, 700);
}

function createLink($el, type) {
	var text = $el.text(),
		$link = $('<a/>', {
			href: '#' + type,
			class: 'link',
			id: type,
			text: text
		});

	$el.html('').append($link);
}

function allNews() {
	$('#all-wrap').html($('#all').text());

	$('#news__list .news__item').filter(function(index) {
		return $(this).data('geek') != true;
	}).show();

	createLink($('#geek-wrap'), 'geek');

	if (sorting == 'priority') {
		enableNewsSortable();
	}

	$('#geek').click(function(event) {
		event.preventDefault();
		geekNews();
	});

	history.pushState("", document.title, window.location.pathname);
}

function geekNews() {
	$('#geek-wrap').html($('#geek').text());

	$('#news__list .news__item').filter(function(index) {
		return $(this).data('geek') != true;
	}).hide();

	createLink($('#all-wrap'), 'all');

	disableNewsSortable();

	$('#all').click(function(event) {
		event.preventDefault();
		allNews();
	});

	history.pushState("", document.title, window.location.pathname + '#geek');
}