$(function() {
	if ($('#news__list').length && !$('.news__deleted').length) {
		$('#geek').click(function(event) {
			event.preventDefault();
			geekNews();
		});
	}

	if (location.hash == '#geek') {
		$(document).on('news-loaded', function() {
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

	$('#news__list').sortable('enable');
	$('.news__mobile-buttons').css('display', '');

	$('#geek').click(function(event) {
		event.preventDefault();
		geekNews();
	});
}

function geekNews() {
	$('#geek-wrap').html($('#geek').text());

	$('#news__list .news__item').filter(function(index) {
		return $(this).data('geek') != true;
	}).hide();

	createLink($('#all-wrap'), 'all');

	$('#news__list').sortable('disable');

	$('.news__mobile-buttons').css('display', 'none');

	$('#all').click(function(event) {
		event.preventDefault();
		allNews();
	});
}