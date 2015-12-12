var APIPath = 'http://master.radio-t.com:8780/api/v1',
	disqusID = 'radiotnewstest',
	login = localStorage.getItem('login'),
	password = localStorage.getItem('password'),
	sorting = localStorage.getItem('sorting'),
	authHeaders = {
		'Authorization': 'Basic ' + btoa(login + ':' + password)
	},
	isMobile =  /Android|iPhone|iPad|iPod|IEMobile|Windows Phone|Opera Mini/i.test(navigator.userAgent),
	sortableList;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getSlug() {
	var path = location.pathname;

	if (path.substr(-1) === '/') {
		path = path.substr(0, path.length - 1);
	}

	var parts = path.split('/');

	return parts[parts.length - 1];
}

function formatDate(date) {
	var day = ('0' + date.getDate()).slice(-2),
		month = ('0' + (date.getMonth() + 1)).slice(-2),
		year = date.getFullYear(),
		hours = ('0' + date.getHours()).slice(-2),
		mins = ('0' + date.getMinutes()).slice(-2);

	return day + '.' + month + '.' + year + ' в&nbsp;' + hours + ':' + mins;
}

function extractDomain(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    return domain.split(':')[0];
}
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
						i = d.createElement('iframe'),
						s = i.style;

					i.src = '#LOCATION#'
							+ '?url=' + encodeURIComponent(location.href)
							+ '&login=' + '#LOGIN#'
							+ '&password=' + '#PASSWORD#';
					i.scrolling = 'no';

					s.transition = 'all 200ms';
					s.position = 'fixed';
					s.left = '0';
					s.right = '0';
					s.top = '0';
					s.zIndex = 16777271;
					s.height = '70px';
					s.width = '100%';
					s.overflow = 'hidden';
					s.background = '#fff';
					s.borderBottom = '1px solid #bdbdbd';
					s.boxShadow = '0 0 30px #828282';

					d.body.appendChild(i);
					
					w.setTimeout(function() {
						s.height = '0';

						w.setTimeout(function() {
							i.parentNode.removeChild(i);
						}, 300);
					}, 3000);
				}

				var href = hrefFunc.toString()
								   .replace(/#LOCATION#/g, location.protocol + '//' + location.host + '/qadd/')
								   .replace(/#LOGIN#/g, login)
								   .replace(/#PASSWORD#/g, password);

				return "javascript:(" + encodeURIComponent(href) + ")();";
			});
	}
});


$(function() {
	if ($('#feeds__list').length) {
		loadFeeds();

		$('#feeds__add-form').submit(function(event) {
			var $form = $(this);

			$.ajax({
				url: APIPath + '/feeds',
				type: 'POST',
				async: true,
				data: '{ "feedlink": "' + $('#feeds__add').val() + '" }',
				headers: authHeaders
			})
			.done(function() {
				loadFeeds();
				$form.trigger('reset');
			})
			.fail(function(response) {
				console.log("error while adding feed");
				console.log(response);
			});

			return false;
		});
	}
});

function loadFeeds() {
	$('#feeds__list').html('');

	$.ajax({
		url: APIPath + '/feeds',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(json) {
		var $row,
			$delCell,
			date = new Date(),
			updated;

		for (var i = 0; i < json.length; i++) {
			date.setTime(Date.parse(json[i].updated));
			updated = formatDate(date);

			$row = $('<tr/>').data('id', json[i].id);

			$('<td/>', {
					class: 'feeds__urls',
					text:  json[i].feedlink
				})
				.attr('title', json[i].feedlink)
				.appendTo($row);
			
			$('<td/>', {
				class: 'feeds__update',
				html: updated
			}).appendTo($row);

			$delCell = $('<td class="feeds__del"><a href="#" class="link">Удалить</a></td>');
			$delCell.appendTo($row);

			$delCell.find('.link').click(function(event) {
				event.preventDefault();

				delFeed($(this).closest('tr'));
			});

			$('#feeds__list').append($row);
		};
	})
	.fail(function(response) {
		console.log("error while loading feeds");
		console.log(response);
	});
}

function delFeed($row) {
	var id = $row.data('id');

	$.ajax({
		url: APIPath + '/feeds/' + id,
		type: 'DELETE',
		headers: authHeaders
	})
	.done(function() {
		$row.remove()
	})
	.fail(function(response) {
		console.log("error while deleting the feed");
		console.log(response);
	});
}
$(function() {
	var $login = $('#login');

	if ($login.length) {
		$login.submit(function(event) {
			$('.login__error', $login).hide();

			var login = $(this).find('input[name=login]').val(),
				pass = $(this).find('input[name=password]').val()

			if (login && pass) { 
				var request = new XMLHttpRequest();   

				request.open('PUT', APIPath + '/news/reload', true, login, pass);                                                                                                                               
				request.setRequestHeader('Authorization', 'Basic ' + btoa(login + ':' + pass));
				
			    request.onreadystatechange = function(event) {  
			        if (request.readyState === 4) {  
			            if (request.status !== 200) {  
							$('#login .login__error').show();  
			            } else {  
							localStorage.setItem('login', login);
							localStorage.setItem('password', pass);
							
							var back = getParameterByName('back');

							if (back) {
								location.href = back;
							} else {
								location.href = '/admin/';
							}
			            }  
			        }  
			    }; 

			    request.send();    
			} 

			return false;
		});
	}
});
$(function() {
	$('#update-feeds').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: APIPath + '/news/reload',
			type: 'PUT',
			headers: authHeaders
		})
		.done(function() {
			location.reload();
		})
		.fail(function(response) {
			console.log("error while updating feeds");
			console.log(response);
		});
	});

	$('#logout').click(function(event) {
		event.preventDefault();

		var request = new XMLHttpRequest();   

		request.open('PUT', APIPath + '/news/reload', false, 'harry', 'colloportus');                                                                                                                               
	    
	    try {
		    request.send();    
			    
	        if (request.readyState === 4) {  
				localStorage.removeItem('login');
				localStorage.removeItem('password');

				location.href = '/login/';
	        }  
	    } catch (err) {
	    	localStorage.removeItem('login');
			localStorage.removeItem('password');

			location.href = '/login/';
	    }
	});
});
$(function() {
	var $topStatus = $('#news__top-status'),	
		$newsList = $('#news__list'),

		$item = $('#news__skeleton'),
		$curItem = $item.clone(true, true),
		info,
		date = new Date(),

		isAdmin = typeof admin !== "undefined" && admin,
		oldTitle = document.title;

	if ($('#news__list').length) {
		if (isMobile) {
			$('.news').addClass('news_mobile');
		}

		if ($('.news_deleted').length) {
			loadDeleted();
		} else {
			load();

			$(document).on('news-loaded', function() {
				var today = (new Date()).getDay();

				if (today == 6 || today == 0 || isAdmin) {
					updateCurrent();
				}

				$('#news__sort')
					.show()

					.find('.link')
					.click(function(event) {
						event.preventDefault();

						var type = $(this).data('sort');

						if (! $(this).hasClass('link_active')) {
							sortNews(type);

							$('#news__sort .link_active').removeClass('link_active');
							$(this).addClass('link_active');

							if (type == 'priority') {
								localStorage.removeItem('sorting');

								if (isAdmin) {
									$('.news').removeClass('news_sorted');
									sortableList.option('disabled', false);
								}
							} else {
								localStorage.setItem('sorting', type);

								if (isAdmin) {
									$('.news').addClass('news_sorted');
									sortableList.option('disabled', true);
								}
							}
						}
					});
			})
		}

		if (sorting) {
			activeSorting = sorting;
			$('.news').addClass('news_sorted');
		} else {
			activeSorting = 'priority';
		}

		$('#news__sort .link[data-sort="' + activeSorting + '"]').addClass('link_active');
	}

	function JSON2DOM(json) {
		if (sorting && sorting != 'priority') {
			sortJSON(json, sorting);
		}

		var $a;

		for (var i = 0; i < json.length; i++) {
			date.setTime(Date.parse(json[i].ts));

			$a = $('<a/>', {
				href: json[i].link,
				class: 'link',
				title: json[i].title,
				text: extractDomain(json[i].link),
				target: '_blank'
			});

			info = '<span class="news__geek" title="Гиковская тема"></span>';

			if (json[i].author) {
				info +=	json[i].author 
						+ ' (' 
						+ $a.prop('outerHTML')
						+ ')'
						+ ', '
						+ formatDate(date);
			} else {
				info +=	$a.prop('outerHTML')
						+ ', '
						+ formatDate(date)
			}

			$curItem.find('.news__title')
					.attr('href', '/post/' + json[i].slug)
					.text(json[i].title)
					.end()
					
					.find('.news__info').html(info)
					.end()
					
					.find('.news__desc').html(json[i].snippet)
					.end()

					.find('.news__comments-counter')
					.text(
						json[i].comments > 0
						? 'Коммментарии: ' + json[i].comments
						: 'Комментариев нет'
					)
					.attr('href', '/post/' + json[i].slug + '#to-comments')
					.end()

					.find('.news__light').click(function(event) {
						event.preventDefault();
						toggleArticle($(this));
					})
					.show();

			if (json[i].pic) {
				$curItem.find('.news__image-hidden')
						.attr('src', json[i].pic)
						.load(function() {
							$(this).siblings('.news__image')
								   .css('background-image', 'url(' + $(this).attr('src') + ')')
								   .end()
								   .remove();
						});
			}

			if (json[i].active) {
				$('.news__item').removeClass('news__item_current')
							    .attr('id', '');
				$curItem.addClass('news__item_current')
						.attr('id', 'current');
				setTimeout(function() {
					// wait for paste element
					$(document).trigger('current-updated');
				}, 300);
			}

			$curItem.appendTo($newsList)
					.show()
					.attr('data-id', json[i].id)
					.attr('id', '')
					.data('comments', json[i].comments)
					.data('ats', json[i].ats)
					.data('pos', json[i].position);

			if (isAdmin) {
				$curItem.data('geek', json[i].geek);

				if (json[i].geek) {
					$curItem.find('.news__button_togeek')
							.removeClass('news__button_togeek')
							.addClass('news__button_ingeek')
							.end()

							.addClass('news__item_geek');
				}
			} else {
				if (json[i].geek) {
					$curItem.addClass('news__item_geek-light');
				}
			}

			$curItem = $item.clone(true, true);
		};

		$(document).trigger('news-loaded');
	}

	function load() {
		$.ajax({
			url: APIPath + '/news',
			type: 'GET',
			dataType: 'json',
			cache: false,
			async: true,
			beforeSend: function() {
				$topStatus.text('Загружаю..')
						  .show();
			}
		})
		.done(function(json) {
			$(document).on('news-loaded', function() {
				$topStatus.hide();

				if (isAdmin) {
					if (! isMobile) {
						sortableList = new Sortable($('#news__list')[0], {
							animation: 150,
							draggable: '.news__item',
							ghostClass: 'news__item_sortable',
							handle: '.news__handler',
							scrollSensitivity: 70,
							disabled: !!sorting,
							onUpdate: function(event) {
								moveArticle($(event.item));
							}
						});
					}

					$('.news__button_current').click(function(event) {
						event.preventDefault();

						var $item = $(this).closest('.news__item');

						$.ajax({
							url: APIPath + '/news/active/' + $item.data('id'),
							type: 'PUT',
							headers: authHeaders,
							async: false
						})
						.done(function() {
							$item.addClass('news__item_current')
								 .siblings('.news__item')
								 .removeClass('news__item_current');
						})
						.fail(function(response) {
							console.log("error while activating news");
							console.log(response);
						});
					});

					$('.news__button_first').click(function(event) {
						event.preventDefault();

						var $item = $(this).closest('.news__item');

						$item.prependTo('#news__list');
						moveArticle($item);
					});

					$('.news__button_up').click(function(event) {
						event.preventDefault();

						var $item = $(this).closest('.news__item');

						$item.prev().before($item);
						moveArticle($item);
					});

					$('.news__button_down').click(function(event) {
						event.preventDefault();

						var $item = $(this).closest('.news__item');

						$item.next().after($item);
						moveArticle($item);
					});

					$('.news__button_togeek').click(function(event) {
						event.preventDefault();

						togeekArticle($(this));
					});

					$('.news__button_ingeek').click(function(event) {
						event.preventDefault();

						nogeekArticle($(this));
					});

					$('.news__button_del').click(function(event) {
						event.preventDefault();

						delArticle($(this));
					});
				}

				$(document).trigger('fullpage-loaded');
			});

			if (sorting) {
				sortJSON(json);
			}

			JSON2DOM(json);
		})
		.fail(function(response) {
			$topStatus.text('Ошибка при загрузке, попробуйте обновить страницу')
					  .slideDown();
			console.log(response);
		});
	}

	function loadDeleted() {
		$.ajax({
			url: APIPath + '/news/del',
			type: 'GET',
			dataType: 'json',
			cache: false,
			async: true,
			beforeSend: function() {
				$topStatus.text('Загружаю..')
						  .show();
			}
		})
		.done(function(json) {
			$(document).on('news-loaded', function() {
				$topStatus.hide();

				if (isAdmin) {
					$('.news__button_restore')
						.css('display', 'inline-block')
						.click(function(event) {
								event.preventDefault();

								restoreArticle($(this));
						});
				}
			});

			JSON2DOM(json);
		})
		.fail(function(response) {
			$topStatus.text('Ошибка при загрузке, попробуйте обновить страницу')
					  .slideDown();
			console.log(response);
		});
	}

	function updateCurrent() {
		var timeout = 295;

		$.ajax({
			url: APIPath + '/news/active/wait/' + timeout,
			type: 'GET',
			dataType: 'json',
			async: true
		})
		.done(function(json) {
			if (typeof json == 'undefined') {
				// if 304 then update again
				updateCurrent();
				return;
			}

			var $current = $('.news__item[data-id=' + json.id + ']');

			if ($current.length) {
				if (!$current.hasClass('news__item_current')) {
					$('.news__item_current').removeClass('news__item_current');
					$current.addClass('news__item_current');

					document.title = "** Тема обновилась **";
					notify('Тема обновилась. Нажмите, чтобы перейти к ней.', function() {
						$('html, body').animate({
							scrollTop: $('.news__item_current').offset().top
						}, 700);

						document.title = oldTitle;
					});
				}
				
				updateCurrent();
			} else {
				document.title = "** Ошибка **";
				notify('Текущей темы нет в этом списке. Вероятно, он устарел. Нажмите, чтобы его обновить.', function() {
					$('#news__list').html('');
					load();

					$(document).one('current-updated', function() {
						$('html, body').animate({
							scrollTop: $('.news__item_current').offset().top
						}, 700);
					});

					document.title = oldTitle;
				});
			}
		})
		.fail(function(response) {
			updateCurrent();
		});
	}

	function sortNews(type) {
		var $items = $('#news__list .news__item');

		switch (type) {
			case 'comments':
				// X → x sort by comments count
				$items.sort(function(a, b) {
					return $(b).data('comments') - $(a).data('comments');
				}).appendTo($newsList);
				break;

			case 'recent':
				// X → x sort by adding date
				$items.sort(function(a, b) {
					if ($(a).data('ats') > $(b).data('ats')) {
						return -1;
					}

					if ($(a).data('ats') < $(b).data('ats')) {
						return 1;
					}

					return 0;
				}).appendTo($newsList);
				break;

			case 'priority':
				// X → x sort by admin's priority
				$items.sort(function(a, b) {
					return $(b).data('pos') - $(a).data('pos');
				}).appendTo($newsList);
				break;
		}
	}
});

function toggleArticle($link) {
	var $full = $link.siblings('.news__full'),
		$loader = $('.news__full-loader', $full),
		body = $('body')[0],
		v = 0;

	if ($full.is(':visible')) {
		$full.hide();
	} else {
		var $visibleNews = $('.news__full:visible'),
			$visibleLink = $visibleNews.siblings('.news__light');

		if ($visibleNews.length) {
			if ($full.offset().top > $visibleNews.offset().top) {
				var height = $visibleNews.outerHeight(true),
					st = $(document).scrollTop() - height;

			    $(document).scrollTop(st);
				$visibleNews.hide();
			} else {
				$visibleNews.hide();
			}

			toggleArticleLink($visibleLink);
		}
		
		$full.show();

		if ($loader.is(':visible')) {
			var id = $full.closest('.news__item').data('id');

			$.ajax({
				url: APIPath + '/news/id/' + id,
				type: 'GET',
				dataType: 'json',
				async: true
			})
			.done(function(json) {
				if (json.content.length) {
					$loader.after(json.content).hide();
				} else {
					$loader.text('Увы, но у этой новости нет подробного текста');
				}
			})
			.fail(function(response) {
				$loader.text('Ошибка. Не получилось загрузить новость');
			});
		}
	}
	
	toggleArticleLink($link);
}

function toggleArticleLink($link) {
	$link.text(function(i, text) {
		return text == 'Подробнее' ? 'Скрыть' : 'Подробнее';
	});
}

function moveArticle($item) {
	var $items = $('#news__list .news__item'),
		length = $items.length,
		pos = $item.data('pos'),
		index = $item.index(),
		offset = length - pos - index - 1;

	$.ajax({
		url: APIPath + '/news/move/' + pos + '/' + offset,
		type: 'PUT',
		headers: authHeaders
	})
	.fail(function(response) {
		console.log("error while moving news");
		console.log(response);
	});

	for (var i = $items.length - 1; i >= 0; i--) {
		$items.eq(i).data('pos', $items.length - $items.eq(i).index() - 1)
	};
}

function togeekArticle($el) {
	var $item = $el.closest('.news__item');

	$.ajax({
		url: APIPath + '/news/geek/' + $item.data('id'),
		type: 'PUT',
		headers: authHeaders
	})
	.done(function() {
		$item.data('geek', true)
			 .addClass('news__item_geek');
		$el.removeClass('news__button_togeek')
		   .addClass('news__button_ingeek')
		   .off()
		   .click(function(event) {
		   		event.preventDefault();

		   		nogeekArticle($(this));
		   });
	})
	.fail(function(response) {
		console.log("error while geeking news");
		console.log(response);
	});
}

function nogeekArticle($el) {
	var $item = $el.closest('.news__item');

	$.ajax({
		url: APIPath + '/news/nogeek/' + $item.data('id'),
		type: 'PUT',
		headers: authHeaders
	})
	.done(function() {
		$item.data('geek', false)
			 .removeClass('news__item_geek');
		$el.removeClass('news__button_ingeek')
		   .addClass('news__button_togeek')
		   .off()
		   .click(function(event) {
		   		event.preventDefault();

		   		togeekArticle($(this));
		   });
	})
	.fail(function(response) {
		console.log("error while nogeeking news");
		console.log(response);
	});
}

function restoreArticle($el) {
	var $item = $el.closest('.news__item');

	$.ajax({
		url: APIPath + '/news/undelete/' + $item.data('id'),
		type: 'PUT',
		headers: authHeaders
	})
	.done(function() {
		$item.remove();
	})
	.fail(function(response) {
		console.log("error while deleting news");
		console.log(response);
	});
}

function delArticle($el) {
	var $item = $el.closest('.news__item');

	$.ajax({
		url: APIPath + '/news/' + $item.data('id'),
		type: 'DELETE',
		headers: authHeaders
	})
	.done(function() {
		$item.remove();
	})
	.fail(function(response) {
		console.log("error while deleting news");
		console.log(response);
	});
}

function sortJSON(json, type) {
	switch (type) {
		case 'comments':
			// X → x sort by comments count
			json.sort(function(a, b) {
				return b.comments - a.comments;
			});
			break;

		case 'recent':
			// X → x sort by adding date
			json.sort(function(a, b) {
				if (a.ats > b.ats) {
					return -1;
				}

				if (a.ats < b.ats) {
					return 1;
				}

				return 0;
			});
			break;

		case 'priority':
			// X → x sort by admin's priority
			json.sort(function(a, b) {
				return b.position - a.position;
			});
			break;
	}
}
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
$(function() {
	var $topStatus = $('#onenews__top-status'),
		$onenews = $('#onenews'),

		slug = getSlug();

	if (login && password) {
		$('#menu__back-link').attr('href', '/admin/');
	}

	if ($('#onenews').length) {
		if (typeof slug !== 'undefined' && slug.length > 0) {
			load();
		} else {
			location.href = '/';
		}
	}

	function load() {
		$.ajax({
			url: APIPath + '/news/slug/' + slug,
			type: 'GET',
			dataType: 'json',
			cache: true,
			async: true,
			beforeSend: function() {
				$topStatus.text('Загружаю..')
						  .show();
			}
		})
		.done(function(json) {
			$topStatus.hide();

			$(document).on('news-loaded', function() {
				var dqinterval = setInterval(function() {
				    var disqusHeight = $('#disqus_thread').height();
				    // 250 ≈ height of empty disqus
				    if (disqusHeight > 250) {
				    	$('#menu__item_to-comments')
				    		.css('display', 'inline-block')

				    		.find('.link')
				    		.click(function(event) {
				    			event.preventDefault();

				    			$('html,body').animate({
				    				scrollTop: $($(this).attr('href')).offset().top
				    			}, 500);
				    		});

				    	if (location.hash == '#to-comments') {
				    		$('#menu__item_to-comments .link').click();
				    	}

				        clearInterval(dqinterval);
				    }
				}, 100);
			});

			JSON2DOM(json);
			document.title = json.title;

			(function() { 
				var d = document, s = d.createElement('script');
				s.src = '//' + disqusID + '.disqus.com/embed.js';
				s.setAttribute('data-timestamp', +new Date());
				(d.head || d.body).appendChild(s);
			})();
		})
		.fail(function(response) {
			$topStatus.text('Ошибка при загрузке, попробуйте обновить страницу')
					  .slideDown();
			console.log(response);
		});
		
	}

	function JSON2DOM(json) {
		var info,
			date = new Date();

		date.setTime(Date.parse(json.ts));

		var $a = $('<a/>', {
			href: json.link,
			class: 'link',
			title: json.title,
			text: extractDomain(json.link),
			target: '_blank'
		});

		info = '<span class="onenews__geek" title="Гиковская тема"></span>';

		if (json.author) {
			info +=	json.author
					+ ' ('
					+ $a.prop('outerHTML')
					+ ')'
					+ ', '
					+ formatDate(date);
		} else {
			info +=	$a.prop('outerHTML')
					+ ', '
					+ formatDate(date);
		}

		$onenews.find('.onenews__title')
				.text(json.title)
				.attr('href', json.link)
				.attr('target', '_blank')
				.end()

				.find('.onenews__info')
				.html(info)
				.end()

				.find('.onenews__body')
				.html(json.content);

		if (json.geek) {
			$onenews.find('.onenews__geek').show();
		}

		$(document).trigger('news-loaded');
	}
});
$(function() {
	if ($('#news__list').length && !$('.news_deleted').length) {
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

	$('.news__mobile-buttons').css('display', '');
	sortableList.option('disabled', false);

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

	$('.news__mobile-buttons').css('display', 'none');
	sortableList.option('disabled', true);

	$('#all').click(function(event) {
		event.preventDefault();
		allNews();
	});

	history.pushState("", document.title, window.location.pathname + '#geek');
}
/*! Sortable 1.3.0 - MIT | git://github.com/rubaxa/Sortable.git */
!function(a){"use strict";"function"==typeof define&&define.amd?define(a):"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=a():"undefined"!=typeof Package?Sortable=a():window.Sortable=a()}(function(){"use strict";function a(a,b){if(!a||!a.nodeType||1!==a.nodeType)throw"Sortable: `el` must be HTMLElement, and not "+{}.toString.call(a);this.el=a,this.options=b=r({},b),a[L]=this;var c={group:Math.random(),sort:!0,disabled:!1,store:null,handle:null,scroll:!0,scrollSensitivity:30,scrollSpeed:10,draggable:/[uo]l/i.test(a.nodeName)?"li":">*",ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",ignore:"a, img",filter:null,animation:0,setData:function(a,b){a.setData("Text",b.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:"data-id",delay:0,forceFallback:!1,fallbackClass:"sortable-fallback",fallbackOnBody:!1};for(var d in c)!(d in b)&&(b[d]=c[d]);V(b);for(var f in this)"_"===f.charAt(0)&&(this[f]=this[f].bind(this));this.nativeDraggable=b.forceFallback?!1:P,e(a,"mousedown",this._onTapStart),e(a,"touchstart",this._onTapStart),this.nativeDraggable&&(e(a,"dragover",this),e(a,"dragenter",this)),T.push(this._onDragOver),b.store&&this.sort(b.store.get(this))}function b(a){v&&v.state!==a&&(h(v,"display",a?"none":""),!a&&v.state&&w.insertBefore(v,s),v.state=a)}function c(a,b,c){if(a){c=c||N,b=b.split(".");var d=b.shift().toUpperCase(),e=new RegExp("\\s("+b.join("|")+")(?=\\s)","g");do if(">*"===d&&a.parentNode===c||(""===d||a.nodeName.toUpperCase()==d)&&(!b.length||((" "+a.className+" ").match(e)||[]).length==b.length))return a;while(a!==c&&(a=a.parentNode))}return null}function d(a){a.dataTransfer&&(a.dataTransfer.dropEffect="move"),a.preventDefault()}function e(a,b,c){a.addEventListener(b,c,!1)}function f(a,b,c){a.removeEventListener(b,c,!1)}function g(a,b,c){if(a)if(a.classList)a.classList[c?"add":"remove"](b);else{var d=(" "+a.className+" ").replace(K," ").replace(" "+b+" "," ");a.className=(d+(c?" "+b:"")).replace(K," ")}}function h(a,b,c){var d=a&&a.style;if(d){if(void 0===c)return N.defaultView&&N.defaultView.getComputedStyle?c=N.defaultView.getComputedStyle(a,""):a.currentStyle&&(c=a.currentStyle),void 0===b?c:c[b];b in d||(b="-webkit-"+b),d[b]=c+("string"==typeof c?"":"px")}}function i(a,b,c){if(a){var d=a.getElementsByTagName(b),e=0,f=d.length;if(c)for(;f>e;e++)c(d[e],e);return d}return[]}function j(a,b,c,d,e,f,g){var h=N.createEvent("Event"),i=(a||b[L]).options,j="on"+c.charAt(0).toUpperCase()+c.substr(1);h.initEvent(c,!0,!0),h.to=b,h.from=e||b,h.item=d||b,h.clone=v,h.oldIndex=f,h.newIndex=g,b.dispatchEvent(h),i[j]&&i[j].call(a,h)}function k(a,b,c,d,e,f){var g,h,i=a[L],j=i.options.onMove;return g=N.createEvent("Event"),g.initEvent("move",!0,!0),g.to=b,g.from=a,g.dragged=c,g.draggedRect=d,g.related=e||b,g.relatedRect=f||b.getBoundingClientRect(),a.dispatchEvent(g),j&&(h=j.call(i,g)),h}function l(a){a.draggable=!1}function m(){R=!1}function n(a,b){var c=a.lastElementChild,d=c.getBoundingClientRect();return(b.clientY-(d.top+d.height)>5||b.clientX-(d.right+d.width)>5)&&c}function o(a){for(var b=a.tagName+a.className+a.src+a.href+a.textContent,c=b.length,d=0;c--;)d+=b.charCodeAt(c);return d.toString(36)}function p(a){var b=0;if(!a||!a.parentNode)return-1;for(;a&&(a=a.previousElementSibling);)"TEMPLATE"!==a.nodeName.toUpperCase()&&b++;return b}function q(a,b){var c,d;return function(){void 0===c&&(c=arguments,d=this,setTimeout(function(){1===c.length?a.call(d,c[0]):a.apply(d,c),c=void 0},b))}}function r(a,b){if(a&&b)for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a}var s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J={},K=/\s+/g,L="Sortable"+(new Date).getTime(),M=window,N=M.document,O=M.parseInt,P=!!("draggable"in N.createElement("div")),Q=function(a){return a=N.createElement("x"),a.style.cssText="pointer-events:auto","auto"===a.style.pointerEvents}(),R=!1,S=Math.abs,T=([].slice,[]),U=q(function(a,b,c){if(c&&b.scroll){var d,e,f,g,h=b.scrollSensitivity,i=b.scrollSpeed,j=a.clientX,k=a.clientY,l=window.innerWidth,m=window.innerHeight;if(z!==c&&(y=b.scroll,z=c,y===!0)){y=c;do if(y.offsetWidth<y.scrollWidth||y.offsetHeight<y.scrollHeight)break;while(y=y.parentNode)}y&&(d=y,e=y.getBoundingClientRect(),f=(S(e.right-j)<=h)-(S(e.left-j)<=h),g=(S(e.bottom-k)<=h)-(S(e.top-k)<=h)),f||g||(f=(h>=l-j)-(h>=j),g=(h>=m-k)-(h>=k),(f||g)&&(d=M)),(J.vx!==f||J.vy!==g||J.el!==d)&&(J.el=d,J.vx=f,J.vy=g,clearInterval(J.pid),d&&(J.pid=setInterval(function(){d===M?M.scrollTo(M.pageXOffset+f*i,M.pageYOffset+g*i):(g&&(d.scrollTop+=g*i),f&&(d.scrollLeft+=f*i))},24)))}},30),V=function(a){var b=a.group;b&&"object"==typeof b||(b=a.group={name:b}),["pull","put"].forEach(function(a){a in b||(b[a]=!0)}),a.groups=" "+b.name+(b.put.join?" "+b.put.join(" "):"")+" "};return a.prototype={constructor:a,_onTapStart:function(a){var b=this,d=this.el,e=this.options,f=a.type,g=a.touches&&a.touches[0],h=(g||a).target,i=h,k=e.filter;if(!("mousedown"===f&&0!==a.button||e.disabled)&&(h=c(h,e.draggable,d))){if(D=p(h),"function"==typeof k){if(k.call(this,a,h,this))return j(b,i,"filter",h,d,D),void a.preventDefault()}else if(k&&(k=k.split(",").some(function(a){return a=c(i,a.trim(),d),a?(j(b,a,"filter",h,d,D),!0):void 0})))return void a.preventDefault();(!e.handle||c(i,e.handle,d))&&this._prepareDragStart(a,g,h)}},_prepareDragStart:function(a,b,c){var d,f=this,h=f.el,j=f.options,k=h.ownerDocument;c&&!s&&c.parentNode===h&&(G=a,w=h,s=c,t=s.parentNode,x=s.nextSibling,F=j.group,d=function(){f._disableDelayedDrag(),s.draggable=!0,g(s,f.options.chosenClass,!0),f._triggerDragStart(b)},j.ignore.split(",").forEach(function(a){i(s,a.trim(),l)}),e(k,"mouseup",f._onDrop),e(k,"touchend",f._onDrop),e(k,"touchcancel",f._onDrop),j.delay?(e(k,"mouseup",f._disableDelayedDrag),e(k,"touchend",f._disableDelayedDrag),e(k,"touchcancel",f._disableDelayedDrag),e(k,"mousemove",f._disableDelayedDrag),e(k,"touchmove",f._disableDelayedDrag),f._dragStartTimer=setTimeout(d,j.delay)):d())},_disableDelayedDrag:function(){var a=this.el.ownerDocument;clearTimeout(this._dragStartTimer),f(a,"mouseup",this._disableDelayedDrag),f(a,"touchend",this._disableDelayedDrag),f(a,"touchcancel",this._disableDelayedDrag),f(a,"mousemove",this._disableDelayedDrag),f(a,"touchmove",this._disableDelayedDrag)},_triggerDragStart:function(a){a?(G={target:s,clientX:a.clientX,clientY:a.clientY},this._onDragStart(G,"touch")):this.nativeDraggable?(e(s,"dragend",this),e(w,"dragstart",this._onDragStart)):this._onDragStart(G,!0);try{N.selection?N.selection.empty():window.getSelection().removeAllRanges()}catch(b){}},_dragStarted:function(){w&&s&&(g(s,this.options.ghostClass,!0),a.active=this,j(this,w,"start",s,w,D))},_emulateDragOver:function(){if(H){if(this._lastX===H.clientX&&this._lastY===H.clientY)return;this._lastX=H.clientX,this._lastY=H.clientY,Q||h(u,"display","none");var a=N.elementFromPoint(H.clientX,H.clientY),b=a,c=" "+this.options.group.name,d=T.length;if(b)do{if(b[L]&&b[L].options.groups.indexOf(c)>-1){for(;d--;)T[d]({clientX:H.clientX,clientY:H.clientY,target:a,rootEl:b});break}a=b}while(b=b.parentNode);Q||h(u,"display","")}},_onTouchMove:function(b){if(G){a.active||this._dragStarted(),this._appendGhost();var c=b.touches?b.touches[0]:b,d=c.clientX-G.clientX,e=c.clientY-G.clientY,f=b.touches?"translate3d("+d+"px,"+e+"px,0)":"translate("+d+"px,"+e+"px)";I=!0,H=c,h(u,"webkitTransform",f),h(u,"mozTransform",f),h(u,"msTransform",f),h(u,"transform",f),b.preventDefault()}},_appendGhost:function(){if(!u){var a,b=s.getBoundingClientRect(),c=h(s);u=s.cloneNode(!0),g(u,this.options.ghostClass,!1),g(u,this.options.fallbackClass,!0),h(u,"top",b.top-O(c.marginTop,10)),h(u,"left",b.left-O(c.marginLeft,10)),h(u,"width",b.width),h(u,"height",b.height),h(u,"opacity","0.8"),h(u,"position","fixed"),h(u,"zIndex","100000"),h(u,"pointerEvents","none"),this.options.fallbackOnBody&&N.body.appendChild(u)||w.appendChild(u),a=u.getBoundingClientRect(),h(u,"width",2*b.width-a.width),h(u,"height",2*b.height-a.height)}},_onDragStart:function(a,b){var c=a.dataTransfer,d=this.options;this._offUpEvents(),"clone"==F.pull&&(v=s.cloneNode(!0),h(v,"display","none"),w.insertBefore(v,s)),b?("touch"===b?(e(N,"touchmove",this._onTouchMove),e(N,"touchend",this._onDrop),e(N,"touchcancel",this._onDrop)):(e(N,"mousemove",this._onTouchMove),e(N,"mouseup",this._onDrop)),this._loopId=setInterval(this._emulateDragOver,50)):(c&&(c.effectAllowed="move",d.setData&&d.setData.call(this,c,s)),e(N,"drop",this),setTimeout(this._dragStarted,0))},_onDragOver:function(a){var d,e,f,g=this.el,i=this.options,j=i.group,l=j.put,o=F===j,p=i.sort;if(void 0!==a.preventDefault&&(a.preventDefault(),!i.dragoverBubble&&a.stopPropagation()),I=!0,F&&!i.disabled&&(o?p||(f=!w.contains(s)):F.pull&&l&&(F.name===j.name||l.indexOf&&~l.indexOf(F.name)))&&(void 0===a.rootEl||a.rootEl===this.el)){if(U(a,i,this.el),R)return;if(d=c(a.target,i.draggable,g),e=s.getBoundingClientRect(),f)return b(!0),void(v||x?w.insertBefore(s,v||x):p||w.appendChild(s));if(0===g.children.length||g.children[0]===u||g===a.target&&(d=n(g,a))){if(d){if(d.animated)return;r=d.getBoundingClientRect()}b(o),k(w,g,s,e,d,r)!==!1&&(s.contains(g)||(g.appendChild(s),t=g),this._animate(e,s),d&&this._animate(r,d))}else if(d&&!d.animated&&d!==s&&void 0!==d.parentNode[L]){A!==d&&(A=d,B=h(d),C=h(d.parentNode));var q,r=d.getBoundingClientRect(),y=r.right-r.left,z=r.bottom-r.top,D=/left|right|inline/.test(B.cssFloat+B.display)||"flex"==C.display&&0===C["flex-direction"].indexOf("row"),E=d.offsetWidth>s.offsetWidth,G=d.offsetHeight>s.offsetHeight,H=(D?(a.clientX-r.left)/y:(a.clientY-r.top)/z)>.5,J=d.nextElementSibling,K=k(w,g,s,e,d,r);if(K!==!1){if(R=!0,setTimeout(m,30),b(o),1===K||-1===K)q=1===K;else if(D){var M=s.offsetTop,N=d.offsetTop;q=M===N?d.previousElementSibling===s&&!E||H&&E:N>M}else q=J!==s&&!G||H&&G;s.contains(g)||(q&&!J?g.appendChild(s):d.parentNode.insertBefore(s,q?J:d)),t=s.parentNode,this._animate(e,s),this._animate(r,d)}}}},_animate:function(a,b){var c=this.options.animation;if(c){var d=b.getBoundingClientRect();h(b,"transition","none"),h(b,"transform","translate3d("+(a.left-d.left)+"px,"+(a.top-d.top)+"px,0)"),b.offsetWidth,h(b,"transition","all "+c+"ms"),h(b,"transform","translate3d(0,0,0)"),clearTimeout(b.animated),b.animated=setTimeout(function(){h(b,"transition",""),h(b,"transform",""),b.animated=!1},c)}},_offUpEvents:function(){var a=this.el.ownerDocument;f(N,"touchmove",this._onTouchMove),f(a,"mouseup",this._onDrop),f(a,"touchend",this._onDrop),f(a,"touchcancel",this._onDrop)},_onDrop:function(b){var c=this.el,d=this.options;clearInterval(this._loopId),clearInterval(J.pid),clearTimeout(this._dragStartTimer),f(N,"mousemove",this._onTouchMove),this.nativeDraggable&&(f(N,"drop",this),f(c,"dragstart",this._onDragStart)),this._offUpEvents(),b&&(I&&(b.preventDefault(),!d.dropBubble&&b.stopPropagation()),u&&u.parentNode.removeChild(u),s&&(this.nativeDraggable&&f(s,"dragend",this),l(s),g(s,this.options.ghostClass,!1),g(s,this.options.chosenClass,!1),w!==t?(E=p(s),E>=0&&(j(null,t,"sort",s,w,D,E),j(this,w,"sort",s,w,D,E),j(null,t,"add",s,w,D,E),j(this,w,"remove",s,w,D,E))):(v&&v.parentNode.removeChild(v),s.nextSibling!==x&&(E=p(s),E>=0&&(j(this,w,"update",s,w,D,E),j(this,w,"sort",s,w,D,E)))),a.active&&((null===E||-1===E)&&(E=D),j(this,w,"end",s,w,D,E),this.save())),w=s=t=u=x=v=y=z=G=H=I=E=A=B=F=a.active=null)},handleEvent:function(a){var b=a.type;"dragover"===b||"dragenter"===b?s&&(this._onDragOver(a),d(a)):("drop"===b||"dragend"===b)&&this._onDrop(a)},toArray:function(){for(var a,b=[],d=this.el.children,e=0,f=d.length,g=this.options;f>e;e++)a=d[e],c(a,g.draggable,this.el)&&b.push(a.getAttribute(g.dataIdAttr)||o(a));return b},sort:function(a){var b={},d=this.el;this.toArray().forEach(function(a,e){var f=d.children[e];c(f,this.options.draggable,d)&&(b[a]=f)},this),a.forEach(function(a){b[a]&&(d.removeChild(b[a]),d.appendChild(b[a]))})},save:function(){var a=this.options.store;a&&a.set(this)},closest:function(a,b){return c(a,b||this.options.draggable,this.el)},option:function(a,b){var c=this.options;return void 0===b?c[a]:(c[a]=b,void("group"===a&&V(c)))},destroy:function(){var a=this.el;a[L]=null,f(a,"mousedown",this._onTapStart),f(a,"touchstart",this._onTapStart),this.nativeDraggable&&(f(a,"dragover",this),f(a,"dragenter",this)),Array.prototype.forEach.call(a.querySelectorAll("[draggable]"),function(a){a.removeAttribute("draggable")}),T.splice(T.indexOf(this._onDragOver),1),this._onDrop(),this.el=a=null}},a.utils={on:e,off:f,css:h,find:i,is:function(a,b){return!!c(a,b,a)},extend:r,throttle:q,closest:c,toggleClass:g,index:p},a.create=function(b,c){return new a(b,c)},a.version="1.3.0",a});