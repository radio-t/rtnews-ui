$(function() {
	var $currentPage = $('.menu__item a[href="' + location.pathname + '"]');

	$currentPage.parent().html($currentPage.text());

	if (isAdmin) {
		$('.menu__item_admin').css('display', 'inline-block');
		$('.menu__item_user').hide();
	}
});