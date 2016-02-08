$(function() {
	if ($('#add-news').length) {
		$('#add-news').submit(function(event) {
			var $form = $(this);

			$.ajax({
				url: APIPath + '/news',
				type: 'POST',
				async: true,
				data: '{ "link": "' + decodeURIComponent($('#add__url').val()) + '" }',
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
						i = d.createElement('div'),
						s = i.style;

					s.transition = 'all 200ms';
					s.position = 'fixed';
					s.left = '0';
					s.right = '0';
					s.top = '0';
					s.zIndex = 16777271;
					s.height = '0';
					s.width = '100%';
					s.overflow = 'hidden';
					s.background = '#fff';
					s.borderBottom = '1px solid #bdbdbd';
					s.boxShadow = '0 0 30px #828282';
					s.color = '#232323';
					s.fontSize = '30px';
					s.fontWeight = '700';
					s.fontFamily = '"PT Serif", Georgia, serif';
					s.lineHeight = '67px';
					s.textAlign = 'center';

					i.textContent = 'Сохраняю..';

					d.body.appendChild(i);

					w.setTimeout(function() {
						s.height = '70px';
					}, 100);

					w.setTimeout(function() {
						var rq = new XMLHttpRequest();  

						rq.open('POST', '#LOCATION#' + '/news', false, '#LOGIN#', '#PASSWORD#'); 
						rq.setRequestHeader('Authorization', 'Basic ' + btoa('#LOGIN#' + ':' + '#PASSWORD#')); 

						try {
							rq.send('{ "link": "' + decodeURIComponent(location.href) + '" }');

					        if (rq.readyState === 4) { 
					        	if (rq.status !== 200) {
					        		e('Не смог сохранить');
					        		r();
					        	}  else {
					        		s.color = '#090';
					        		i.textContent = 'Сохранил';
					        		r();
					        	}
					        } else {
					        	e('Не смог достучаться до сервера');
					        	r();
					        }
						} catch (err) {
					        e('Не смог сохранить');
					        r();
						}
					}, 500);

					function e(t) {
						s.color = '#d00';
				        i.textContent = t;
					}

					function r() {
						w.setTimeout(function() {
							s.height = '0';

							w.setTimeout(function() {
								i.parentNode.removeChild(i);
							}, 300);
						}, 500);
					}
				}

				var href = hrefFunc.toString()
								   .replace(/#LOCATION#/g, APIPath.indexOf('http') == 0 ? APIPath : location.protocol + '//' + location.host + APIPath)
								   .replace(/#LOGIN#/g, login)
								   .replace(/#PASSWORD#/g, password);

				return "javascript:(" + encodeURIComponent(href) + ")();";
			});
	}

	if ($('#add__switch-form').length) {
		$('#add__switch-form').click(function(event) {
			event.preventDefault();

			$('.add.form').slideToggle();

			var text = $(this).text();

			$(this).text(text == 'вручную'
							   ? 'по ссылке'
							   : 'вручную');
		});
	}

	if ($('#add-news-manual').length) {
		$('#add-news-manual').submit(function(event) {
			var $form = $(this),
				data = {
					link: decodeURIComponent($form.find('.form__input_link').val()),
					title: $form.find('.form__input_title').val(),
					snippet: $form.find('.form__input_snippet').val()
				};

			$.ajax({
				url: APIPath + '/news/manual',
				type: 'POST',
				async: true,
				data: JSON.stringify(data),
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
	}
});

