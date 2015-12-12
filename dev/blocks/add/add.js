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
				// var hrefFunc = function() {
				// 	var w = window,
				// 		d = document,
				// 		i = d.createElement('iframe'),
				// 		s = i.style;

				// 	i.src = '#LOCATION#'
				// 			+ '?url=' + encodeURIComponent(location.href)
				// 			+ '&login=' + '#LOGIN#'
				// 			+ '&password=' + '#PASSWORD#';
				// 	i.scrolling = 'no';

				// 	s.transition = 'all 200ms';
				// 	s.position = 'fixed';
				// 	s.left = '0';
				// 	s.right = '0';
				// 	s.top = '0';
				// 	s.zIndex = 16777271;
				// 	s.height = '70px';
				// 	s.width = '100%';
				// 	s.overflow = 'hidden';
				// 	s.background = '#fff';
				// 	s.borderBottom = '1px solid #bdbdbd';
				// 	s.boxShadow = '0 0 30px #828282';

				// 	d.body.appendChild(i);
					
				// 	w.setTimeout(function() {
				// 		s.height = '0';

				// 		w.setTimeout(function() {
				// 			i.parentNode.removeChild(i);
				// 		}, 300);
				// 	}, 3000);
				// }

				var hrefFunc = function() {
					var regex = new RegExp("[\\?&]url=([^&#]*)"),
					    results = regex.exec(location.search);

					url = results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));

					var request = new XMLHttpRequest();  

					request.open('POST', '#LOCATION#' + '/news', false, '#LOGIN#', '#PASSWORD#'); 
					request.setRequestHeader('Authorization', 'Basic ' + btoa('#LOGIN#' + ':' + '#PASSWORD#')); 

					try {
						request.send('{ "link": "' + decodeURIComponent(location.href) + '" }');

				        if (request.readyState === 4) { 
				        	if (request.status !== 200) {
				        		alert('Не смог сохранить');
				        	}  else {
				        		alert('Сохранил');
				        	}
				        } else {
				        	alert('Не смог достучаться до сервера');
				        }
					} catch (err) {
						alert('Не смог сохранить');
					}
				}

				var href = hrefFunc.toString()
								   .replace(/#LOCATION#/g, APIPath.indexOf('http') == 0 ? APIPath : location.protocol + '//' + location.host + APIPath)
								   .replace(/#LOGIN#/g, login)
								   .replace(/#PASSWORD#/g, password);

				return "javascript:(" + encodeURIComponent(href) + ")();";
			});
	}
});

