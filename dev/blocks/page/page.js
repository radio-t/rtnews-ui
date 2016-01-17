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