$(function() {
	if ($('#add-news').length) {
		$('#add-news').submit(function(event) {
			var $form = $(this);

			$.ajax({
				url: APIPath + '/news',
				type: 'POST',
				async: true,
				data: '{ "link": "' + $('#add__url').val() + '" }',
				headers: authHeaders
			})
			.done(function() {
				$form.trigger('reset');
				notify('Новость добавлена', null, 1500);
			})
			.fail(function(response) {
				notify('Ошибка при добавлении новости.');
				console.log("error while adding news");
				console.log(response);
			});

			return false;
		});
		
		var url = getParameterByName('url');

		if (url.length) {
			$('#add__url').val(decodeURIComponent(url));
			$('#add-news').submit();
		}
	}

	if ($('#add__bookmark').length) {
		$('#add__bookmark')
			.attr('href', function() {
				var hrefFunc = function() {
					var w = window,
						d = document,
						i = d.createElement('iframe'),
						s = i.style;

					i.src = "#LOCATION#" + '?url=' + location.href + '#add__form';
					i.scrolling = 'no';

					s.background = '#fff';
					s.position = 'absolute';
					s.top = '50%';
					s.transform = 'translateY(-50%)';
					s.left = 0;
					s.right = 0; 
					s.width = '300px';
					s.height = '130px';
					s.margin = '0 auto';
					s.border = '1px solid #ccc';
					s.borderRadius = '3px';
					s.boxShadow = '2px 2px 10px #eee';
					s.overflow = 'hidden';
					s.zIndex = 99999;
					
					d.body.appendChild(i);

					w.setTimeout(function() {
						s.display = 'none';
						delete i;
					}, 3000);
				}

				var href = hrefFunc.toString().replace(/#LOCATION#/g, location.href);

				return "javascript:(" + encodeURIComponent(href) + ")();";
			});
	}
});

