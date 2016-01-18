$(function() {
	$('.filter__item_parent').click(function(event) {
		var $item = $(this),
			$dropdown = $('.filter__dropdown', $item);

		event.preventDefault();

		$dropdown.toggleClass('filter__dropdown_visible');

		$('body').click(function(e) {
			if (!$item.is(e.target) && $item.has(e.target).length === 0) {
				$dropdown.removeClass('filter__dropdown_visible');
			}
		});
	});
});