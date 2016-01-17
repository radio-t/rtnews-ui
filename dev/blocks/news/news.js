$(function() {
	var $topStatus = $('#news__top-status'),	
		$newsList = $('#news__list'),

		$item = $('#news__skeleton'),
		$curItem = $item.clone(true, true),
		info,
		date = new Date(),
		filters = JSON.parse(localStorage.getItem('filters')) || {
			recent: false,
			geek: false
		},

		oldTitle = document.title;

	if ($('#news__list').length) {
		if (isMobile) {
			$('.news').addClass('news_mobile');
		}

		if ($('.news_deleted').length) {
			loadDeleted();
		} else if ($('.news_archive').length) {
			loadArchived();

			$(document).on('news-loaded', function() {
				showSortLinks();
			})

		} else {
			load();

			$(document).on('news-loaded', function() {
				var today = (new Date()).getDay();

				if (today == 6 || today == 0 || isAdmin) {
					updateCurrent();
				}

				showSortLinks();
				showFilterLinks();
			})
		}

		if (sorting) {
			activeSorting = sorting;
		} else {
			activeSorting = 'priority';

			if ($('.news_archive').length) {
				activeSorting = 'recent';
			}
		}

		$('#news__sort .sorter__link[data-sort="' + activeSorting + '"]').addClass('sorter__link_active');
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

			if (date.getFullYear() == 1) {
				date.setTime(Date.parse(json[i].ats));
			}

			if (json[i].author) {
				info =	json[i].author 
						+ ' (' 
						+ $a.prop('outerHTML')
						+ ')'
						+ ', '
						+ formatDate(date);
			} else {
				info =	$a.prop('outerHTML')
						+ ', '
						+ formatDate(date);
			}

			$curItem.find('.news__title')
					.attr('href', '/post/' + json[i].slug)
					.text(json[i].title)
					.end()
					
					.find('.news__info')
					.prepend(info)
					.end()
					
					.find('.news__desc').html(json[i].snippet)
					.end()

					.find('.news__info-stat')
					.attr('href', '/post/' + json[i].slug + '#to-comments')
					.end()

					.find('.news__comments')
					.append(json[i].comments)
					.end()

					.find('.news__light').click(function(event) {
						event.preventDefault();
						toggleArticle($(this));
					})
					.show()
					.end()

					.find('.news__likes')
					.append(json[i].likes)
					.end()

					.attr('data-id', json[i].id)
					.attr('id', '')
					.data('comments', json[i].comments)
					.data('likes', json[i].likes)
					.data('ats', json[i].ats)
					.data('pos', json[i].position)
					.data('geek', json[i].geek);

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

			$curItem.appendTo($newsList);

			if (json[i].active || json[i].enable || typeof json[i].enable == "undefined") {
				$curItem.show();
			}

			if (isAdmin && $('.news_archive').length == 0) {
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

				if (activeSorting != 'priority') {
					disableNewsSortable();
				}

				if (filters.geek || filters.recent) {
					disableNewsSortable();
				}

				if (isAdmin) {
					if (! isMobile) {
						sortableList = new Sortable($('#news__list')[0], {
							animation: 150,
							draggable: '.news__item',
							ghostClass: 'news__item_sortable',
							handle: '.news__handler',
							scrollSensitivity: 70,
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

					$('.news__button_archive').click(function(event) {
						event.preventDefault();

						archiveArticle($(this));
					});
				}

				$(document).trigger('fullpage-loaded');
			});

			filterJSON(json, filters);
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

				$('.news__button_restore')
					.click(function(event) {
							event.preventDefault();

							restoreArticle($(this));
					});
			});

			JSON2DOM(json);
		})
		.fail(function(response) {
			$topStatus.text('Ошибка при загрузке, попробуйте обновить страницу')
					  .slideDown();
			console.log(response);
		});
	}

	function loadArchived() {
		$.ajax({
			url: APIPath + '/news/archive',
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
					$('.news__button_del')
						.click(function(event) {
							event.preventDefault();

							delArticle($(this));
						});
				} else {
					$('.news__manage').remove();
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
					filterNews();

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

	function filterNews() {
		var $items = $('#news__list .news__item'),
			now = new Date(),
			day = 1000 * 60 * 60 * 24,
			month = day * 30;

		for (var i = 0; i < $items.length; i++) {
			var $item = $items.eq(i);

			if ($item.hasClass('news__item_current')) continue;

			if (filters.geek) {
				if (! $item.data('geek')) {
					$item.hide();
					continue;
				}
			}

			if (filters.recent) {
				var date = Date.parse($item.data('ats'));

				if (filters.geek && $item.data('geek')) {
					if ((now - date) / (3 * month) > 1) {
						$item.hide();
						continue;
					}
				} else if ((now - date) / (21 * day) > 1) {
					$item.hide();
					continue;
				}
			}

			$item.show();
		};
	}

	function showSortLinks() {
		$('#news__sort')
			.css('display', $('#news__sort').hasClass('news__sort') ? 'block' : 'inline-block')

			.find('.sorter__link')
			.click(function(event) {
				event.preventDefault();

				var type = $(this).data('sort');

				if (! $(this).hasClass('sorter__link_active')) {
					sortNews(type);

					$('#news__sort .sorter__link_active').removeClass('sorter__link_active');
					$(this).addClass('sorter__link_active');

					if (type == 'priority') {
						localStorage.removeItem('sorting');

						if (isAdmin) {
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
	}

	function showFilterLinks() {
		$('#news__filter')
			.css('display', 'inline-block')

			.find('.filter__link')
			.each(function() {
				var filter = $(this).data('filter');

				for (var filterName in filters) {
					if (filter == filterName && filters[filterName]) {
						$(this).parent().addClass('filter__item_active');
					}
				}
			})
			.click(function(event) {
				event.preventDefault();

				var type = $(this).data('filter');

				$(this).parent().toggleClass('filter__item_active');
				filters[$(this).data('filter')] ^= 1;

				localStorage.setItem('filters', JSON.stringify(filters));

				filterNews();

				if (!filters.geek && !filters.recent) {
					enableNewsSortable();
				} else {
					disableNewsSortable();
				}
			});
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
	.done(function() {
		resetPositions();
	})
	.fail(function(response) {
		console.log("error while moving news");
		console.log(response);
	});
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

		resetPositions();
	})
	.fail(function(response) {
		console.log("error while deleting news");
		console.log(response);
	});
}

function archiveArticle($el) {
	var $item = $el.closest('.news__item');

	$.ajax({
		url: APIPath + '/news/archive/' + $item.data('id'),
		type: 'PUT',
		headers: authHeaders
	})
	.done(function() {
		$item.remove();

		resetPositions();
	})
	.fail(function(response) {
		console.log("error while archiving news");
		console.log(response);
	});
}

function resetPositions() {
	var $items = $('#news__list .news__item'), item, id;

	$.ajax({
		url: APIPath + '/news/positions',
		type: 'GET',
		dataType: 'json',
		cache: false,
		async: true,
	})
	.done(function(json) {
		for (var i = 0; i < $items.length; i++) {
			$item = $items.eq(i);
			id = $item.data('id');

			if (!!json[id]) {
				$item.data('pos', json[id]);
			}
		};
	})
	.fail(function(response) {
		console.log("error while gettins positions");
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

function filterJSON(json, filters) {
	var now = new Date(),
		day = 1000 * 60 * 60 * 24,
		month = day * 30;

	for (var i = json.length - 1; i >= 0; i--) {
		json[i].enable = true;

		if (filters.geek) {
			if (! json[i].geek) {
				json[i].enable = false;
				continue;
			}
		}

		if (filters.recent) {
			var date = Date.parse(json[i].ats);

			if (filters.geek && json[i].geek) {
				if ((now - date) / (3 * month) > 1) {
					json[i].enable = false;
					continue;
				}
			} else if ((now - date) / (21 * day) > 1) {
				json[i].enable = false;
				continue;
			}
		}
	};
}

function disableNewsSortable() {
	$('.news').addClass('news_disabled-sort');
	$('.news__handler').hide();
}

function enableNewsSortable() {
	$('.news').removeClass('news_disabled-sort');
	$('.news__handler').show();
}