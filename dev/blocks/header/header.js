$(function() {
	var $currentPage = $('.menu__item a[href="' + location.pathname + '"]');

	$currentPage.parent().html($currentPage.text());

	if (isAdmin) {
		$('.menu__item_admin').css('display', 'inline-block');
		$('.menu__item_user').hide();
	}

	$('#start').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: APIPath + '/show/start',
			type: 'PUT',
			headers: authHeaders
		})
		.done(function(json) {
			notify('Поехали!', null, 1500);
		})
		.fail(function(response) {
			console.log("error while starting show");
			console.log(response);
		});
	});
});