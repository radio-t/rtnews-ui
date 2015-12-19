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

								if (isAdmin && location.hash != '#geek') {
									enableNewsSortable();
								}
							} else {
								localStorage.setItem('sorting', type);

								if (isAdmin) {
									disableNewsSortable();
								}
							}
						}
					});
			})
		}

		if (sorting) {
			activeSorting = sorting;
			$('.news').addClass('news_disabled-sort');
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
				info =	json[i].author 
						+ ' (' 
						+ $a.prop('outerHTML')
						+ ')'
						+ ', '
						+ formatDate(date)
						+ info;
			} else {
				info =	$a.prop('outerHTML')
						+ ', '
						+ formatDate(date)
						+ info;
			}

			$curItem.find('.news__title')
					.attr('href', '/post/' + json[i].slug)
					.text(json[i].title)
					.end()
					
					.find('.news__info')
					.append(info)
					.end()
					
					.find('.news__desc').html(json[i].snippet)
					.end()

					.find('.news__footer-right')
					.attr('href', '/post/' + json[i].slug + '#to-comments')
					.end()

					.find('.news__comments')
					.text(json[i].comments)
					.end()

					.find('.news__light').click(function(event) {
						event.preventDefault();
						toggleArticle($(this));
					})
					.show()
					.end()

					.find('.news__likes')
					.text(json[i].likes)
					.end()

					.attr('data-id', json[i].id)
					.attr('id', '')
					.data('comments', json[i].comments)
					.data('likes', json[i].likes)
					.data('ats', json[i].ats)
					.data('pos', json[i].position);

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
				$curItem.addClass('news__item_current')
						.attr('id', 'current');
				setTimeout(function() {
					// wait for paste element
					$(document).trigger('current-updated');
				}, 300);
			}

			$curItem.appendTo($newsList)
					.show();

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

			case 'likes':
				// X → x sort by likes count
				$items.sort(function(a, b) {
					return $(b).data('likes') - $(a).data('likes');
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

		case 'likes':
			// X → x sort by likes count
			json.sort(function(a, b) {
				return b.likes - a.likes;
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

function disableNewsSortable() {
	$('.news').addClass('news_disabled-sort');
	$('.news__handler').hide();
}

function enableNewsSortable() {
	$('.news').removeClass('news_disabled-sort');
	$('.news__handler').show();
}