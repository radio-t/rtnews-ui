function notify(message, cb, timeout) {
	$('.notify').remove();

	var $message = $('<div/>', {
		class: 'notify',
		text: message
	});

	$message.appendTo('body')
			.slideDown('500')
			.click(function(event) {
				$(this).slideUp(500, function() {
					$message.remove();
				});

				if (cb) {
					cb();
				}
			});

	if (timeout) {
		setTimeout(function() {
			$message.slideUp(500, function() {
				$message.remove();
			});

			if (cb) {
				cb();
			}
		}, timeout);
	}
}