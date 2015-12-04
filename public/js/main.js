var APIPath = 'http://master.radio-t.com:8778/api/v1',
	disqusID = 'radiotnewstest',
	login = localStorage.getItem('login'),
	password = localStorage.getItem('password'),
	authHeaders = {
		'Authorization': 'Basic ' + btoa(login + ':' + password)
	};

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
	$('#login').submit(function(event) {
		$('#login .login__error').hide();

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
		isMobile =  /Android|iPhone|iPad|iPod|IEMobile|Windows Phone|Opera Mini/i.test(navigator.userAgent),
		oldTitle = document.title,

		updateInterval;

	if ($('#news__list').length) {
		if (isMobile) {
			$('.news').addClass('news_mobile');
		}

		if ($('.news_deleted').length) {
			loadDeleted();
		} else {
			load();

			$(document).on('news-loaded', function() {
				setTimeout(function() {
					updateInterval = setInterval(updateCurrent, 3000);
				}, 10000);
			})
		}
	}

	function JSON2DOM(json) {
		for (var i = 0; i < json.length; i++) {
			date.setTime(Date.parse(json[i].ts));

			if (json[i].author) {
				info = json[i].author 
					   + ' (' + extractDomain(json[i].link) + ')'
					   + ', '
					   + formatDate(date);
			} else {
				info = extractDomain(json[i].link)
					   + ', '
					   + formatDate(date)
			}

			$curItem.find('.news__title')
					.attr('href', json[i].link)
					.text(json[i].title)
					.end()
					
					.find('.news__info').html(info)
					.end()
					
					.find('.news__desc').html(json[i].snippet);

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

			if (json[i].content) {
				$curItem.find('.news__full').html(json[i].content)
						.end()

						.find('.news__light').click(function(event) {
							event.preventDefault();
							toggleArticle($(this));
						})
						.show()
						.end()

						.find('.news__comments-counter')
						.attr('href', '/post/' + json[i].slug + '#disqus_thread');
			}

			$curItem.appendTo($newsList)
					.show()
					.attr('data-id', json[i].id);

			if (isAdmin) {
				$curItem.attr('draggable', true)
						.data('geek', json[i].geek)
						.data('pos', json[i].position);

				if (json[i].geek) {
					$curItem.find('.news__button_togeek')
							.removeClass('news__button_togeek')
							.addClass('news__button_ingeek')
							.end()

							.addClass('news__item_geek');
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

				$('<script/>', {
					id: 'dsq-count-scr',
					src: '//' + disqusID + '.disqus.com/count.js',
					async: true
				}).appendTo('body');

				if (isAdmin) {
					if (! isMobile) {
						$('#news__list')
							.sortable({
								items: '.news__item'
							})
							.bind('sortupdate', function(e, $ui) {
								moveArticle($ui.item);
							});
					}

					$('.news__button_current').click(function(event) {
						event.preventDefault();

						var $item = $(this).closest('.news__item');

						$.ajax({
							url: APIPath + '/news/active/' + $item.data('id'),
							type: 'PUT',
							headers: authHeaders
						})
						.done(function() {
							$('.news__item').removeClass('news__item_current');
							$item.addClass('news__item_current');
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
			});

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
		$.ajax({
			url: APIPath + '/news/active/id',
			type: 'GET',
			dataType: 'json',
			async: true
		})
		.done(function(json) {
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
				clearInterval(updateInterval);
			}
		});
	}
});

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

function toggleArticle($link) {
	$link.siblings('.news__full').slideToggle();
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

		if (json.author) {
			info = json.author
				   + ' (' + extractDomain(json.link) + ')'
				   + ', '
				   + formatDate(date);
		} else {
			info = extractDomain(json.link)
				   + ', '
				   + formatDate(date);
		}

		$onenews.find('.onenews__title')
				.text(json.title)
				.end()

				.find('.onenews__info')
				.html(info)
				.end()

				.find('.onenews__body')
				.html(json.content);
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
/* HTML5 Sortable (http://farhadi.ir/projects/html5sortable)
 * Released under the MIT license.
 */(function(a){var b,c=a();a.fn.sortable=function(d){var e=String(d);return d=a.extend({connectWith:!1},d),this.each(function(){if(/^enable|disable|destroy$/.test(e)){var f=a(this).children(a(this).data("items")).attr("draggable",e=="enable");e=="destroy"&&f.add(this).removeData("connectWith items").off("dragstart.h5s dragend.h5s selectstart.h5s dragover.h5s dragenter.h5s drop.h5s");return}var g,h,f=a(this).children(d.items),i=a("<"+(/^ul|ol$/i.test(this.tagName)?"li":"div")+' class="sortable__placeholder">');f.find(d.handle).mousedown(function(){g=!0}).mouseup(function(){g=!1}),a(this).data("items",d.items),c=c.add(i),d.connectWith&&a(d.connectWith).add(this).data("connectWith",d.connectWith),f.attr("draggable","true").on("dragstart.h5s",function(c){if(d.handle&&!g)return!1;g=!1;var e=c.originalEvent.dataTransfer;e.effectAllowed="move",e.setData("Text","dummy"),h=(b=a(this)).addClass("sortable__dragging").index()}).on("dragend.h5s",function(){b.removeClass("sortable__dragging").show(),c.detach(),h!=b.index()&&f.parent().trigger("sortupdate",{item:b}),b=null}).not("a[href], img").on("selectstart.h5s",function(){return this.dragDrop&&this.dragDrop(),!1}).end().add([this,i]).on("dragover.h5s dragenter.h5s drop.h5s",function(e){return!f.is(b)&&d.connectWith!==a(b).parent().data("connectWith")?!0:e.type=="drop"?(e.stopPropagation(),c.filter(":visible").after(b),!1):(e.preventDefault(),e.originalEvent.dataTransfer.dropEffect="move",f.is(this)?(d.forcePlaceholderSize&&i.height(b.outerHeight()),b.hide(),a(this)[i.index()<a(this).index()?"after":"before"](i),c.not(i).detach()):!c.is(this)&&!a(this).children(d.items).length&&(c.detach(),a(this).append(i)),!1)})})}})(jQuery);
