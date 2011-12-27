/**
 * Libre Projects namespace
 */

lp = $.extend(lp, {

	/**
	 * Actual user locale
	 */
	locale: 'en',

	/**
	 * Translation dictionaries
	 */
	dictionaries: {},

	/**
	 * The project we're viewing the details of in the lightbox
	 */
	actualProject: null,

	getProject: function(id) {
		var found = null;
		$.each(lp.projects, function(idxp, project) {
			if (project.id == id) {
				found = project;
				return false;
			}
		} );
		return found;
	},

	setLocale: function(locale) {
		if (!locale) {
			locale = $.cookie('locale');
		}
		if (!locale) {
			locale = window.navigator.language ? window.navigator.language : window.navigator.userLanguage;
		}

		if (locale != lp.locale) {
			$.cookie('locale', locale);
			lp.locale = locale;

			$.each(lp.locales, function(lidx, availableLocale) {
				if (locale.indexOf(availableLocale.id) != -1 || !locale.indexOf(availableLocale.name != -1)) {
					$('#locale a').removeClass('selected');
					$('#lang-' + availableLocale.id).addClass('selected');
					lp.translateTo(availableLocale.id);
				}
			} );
		}
	},

	getDictionary: function(locale) {
		$.getJSON('js/locales/' + locale + '.json', function(dictionary) {
			lp.dictionaries[locale] = dictionary;
			lp.translateTo(locale);
		} );
	},

	translateTo: function(locale) {
		if (!locale) {
			return;
		}

		if (typeof lp.dictionaries[locale] == 'undefined') {
			lp.getDictionary(locale);
			return;
		}

		$('.translatable').each(function(idxe, element) {
			var $element = $(element);
			var translation = '';

			if (typeof lp.dictionaries[locale][$element.data('translatable')] == 'string') {
				translation = lp.dictionaries[locale][$element.data('translatable')];
			} else {
				translation = $element.data('translatable');
			}
			$element.html(translation);
		} );
	},

	initTranslation: function() {
		$('.translatable').each(function(idxe, element) {
			var $element = $(element);
			$element.data('translatable', $element.html().replace(/"/g, '\''));
		} );
	},

	search: function() {
		var $search = $(this);

		// Only do the following after 100ms if keyup is not being used again
		$search.doTimeout('lp.search', 100, function() {
			var value = $search.val().toLowerCase();

			// Hide or show projects depending if they match or not
			$('#categories ul li span.description').each(function(idx, project) {
				var $project = $(project);
				if (value && $project.text().toLowerCase().indexOf(value) == -1) {
					$project.parents('li').hide();
				} else {
					$project.parents('li').show();
				}
			} );

			lp.categoriesDisplay();
		} );
	},

	/**
	 * Hide or show categories depending if all their projects are hidden or
	 * not.
	 */
	categoriesDisplay: function(category) {
		var $categories = null;
		if (! category) {
			$categories = $('#categories ul');
		} else {
			$categories = $('#categories h2#' + category).next();
		}
		$categories.each(function() {
			var $category = $(this);
			if ($category.find('li').filter(function() {
				return $(this).css('display') != 'none';
			} ).length) {
				$category.show().prev().show();
			} else {
				$category.hide().prev().hide();
			}
		} );
	},

	moveProjectToFavorites: function($li, $star) {
		if (!$star) {
			$star = $li.find('.star')
		}
		$star.removeClass('star-off')
		     .addClass('star-on');
		$li.appendTo($('h2#favorites').next());
		$('h2#favorites').show().next().show();
		lp.categoriesDisplay($li.data('category'));
		lp.categoriesDisplay('favorites');
	},

	removeProjectFromFavorites: function($li, $star) {
		if (!$star) {
			$star = $li.find('.star')
		}
		$star.removeClass('star-on')
		     .addClass('star-off');
		$li.appendTo($('h2#' + $li.data('category')).next());
		lp.categoriesDisplay($li.data('category'));
		lp.categoriesDisplay('favorites');
	},

	getFromUrl: function(fragment) {
		var frags = $.deparam.fragment();
		if (typeof frags[fragment] == 'undefined') {
			frags[fragment] = '';
		}
		return frags[fragment];
	},

	saveToUrl: function(fragment, value) {
		var frags = $.deparam.fragment();
		frags[fragment] = value;
		$.bbq.pushState(frags);
	},

	getFavoritesFromUrl: function() {
		var favs = lp.getFromUrl('favs');
		return favs.split(',').filter(function(element){return element.length != ''});
	},

	saveFavoritesToUrl: function(favs) {
		if (favs.length == 0) {
			favs = '';
		} else {
			favs = favs.join(',');
		}
		lp.saveToUrl('favs', favs);
	},

	addProjectToUrl: function(project) {
		var favs = lp.getFavoritesFromUrl();
		if (favs.indexOf(project) == -1) {
			favs.push(project);
		}
		lp.saveFavoritesToUrl(favs);
	},

	removeProjectFromUrl: function(project) {
		var favs = lp.getFavoritesFromUrl();
		if (favs.indexOf(project) != -1) {
			favs = favs.filter(function(element){return element != project});
		}
		lp.saveFavoritesToUrl(favs);
	},

	getFavoritesFromStorage: function() {
		var favs = $.Storage.get('favorites');
		if (!favs) {
			favs = '';
		}
		return favs.split(',').filter(function(element){return element.length != ''});
	},

	saveFavoritesToStorage: function(favs) {
		if (favs.length == 0) {
			favs = '';
		} else {
			favs = favs.join(',');
		}
		$.Storage.set('favorites', favs);
	},

	setUrlFromStorage: function() {
		var favs = lp.getFavoritesFromStorage();
		if (favs.length > 0) {
			$.each(favs, function(idxf, fav) {
				lp.addProjectToUrl(fav);
			} );
		}
	},

	addFavoriteToStorage: function(fav) {
		var favs = lp.getFavoritesFromStorage();
		if (favs.indexOf(fav) == -1) {
			favs.push(fav);
			lp.saveFavoritesToStorage(favs);
		}
	},

	removeFavoriteFromStorage: function(fav) {
		var favs = lp.getFavoritesFromStorage();
		favs = favs.filter(function(element){return element != fav});
		lp.saveFavoritesToStorage(favs);
	},

	/**
	 * When the state change, we have to check if all projects in favorites
	 * still are there or if they have to be added or sent back to their
	 * categories.
	 *
	 * We also have to check if the event is for showing a project details.
	 */
	onStateChange: function(e) {
		var favs = lp.getFavoritesFromUrl();

		// Adding to favorites
		$.each(favs, function(idxf, fav) {
			if (fav) {
				var $project = $('#favorites').next().find('#' + fav);
				if ($project.length == 0) {
					lp.moveProjectToFavorites($('#' + fav));
					lp.addFavoriteToStorage(fav);
				}
			}
		} );

		// Removing from favorites
		$('#favorites').next().find('li').each(function(idxf, fav) {
			var $fav = $(fav);
			if (favs.indexOf($fav.attr('id')) == -1 && fav != '') {
				lp.removeProjectFromFavorites($fav);
				lp.removeFavoriteFromStorage($fav.attr('id'));
			}
		} );

		// Showing project details lightbox
		if (project = lp.getFromUrl('project')) {
			var $details = $('#project-details');
			// In case we just arrive on the website with #project in the URL
			if (!lp.actualProject) {
				lp.actualProject = lp.getProject(project);
			}
			$details.modal( {
				onOpen: function(dialog) {
					// Filling up details
					$details.find('.url').attr('href', lp.actualProject.address)
					$details.find('.name').html(lp.actualProject.name);
					$details.find('.description').html(lp.actualProject.description);
					$details.find('.logo').attr('src', 'logos/' + lp.actualProject.id + '.png');

					dialog.overlay.fadeIn('fast', function() {
						dialog.data.show();
						dialog.container.fadeIn('fast');
					} );
				},
				onClose: function(dialog) {
					lp.saveToUrl('project', '');
				},
				minWidth: 400,
				minHeight: 300,
				closeHTML: 'X',
				overlayClose: true
			} );
		} else if (lp.actualProject) {
			// Hiding project details lightbox
			$.modal.close();
			lp.actualProject = null;
		}
	}
} );

$(document).ready(function() {

	// Create translations availables
	var $locale = $('#locale');
	$.each(lp.locales, function(lidx, locale) {
		var $li = $('<li />');
		var $a = $('<a href="#" id="lang-' + locale.id + '" onclick="javascript:lp.setLocale(\'' + locale.id + '\');return false;" />').html('<img src="images/countries/' + locale.id + '.png" alt="' + locale.name + ' flag" />').appendTo($li);
		$li.appendTo($locale);
	} );

	// Total number of projects
	$('#nb-projects').html(lp.projects.length);

	// Create categories and adding projects
	var $categories = $('#categories')
	$.each(lp.categories, function(cidx, category) {
		var $h2 = $('<h2 id="' + category.id + '" />')
			          .html('<a href="#' + category.id + '" class="translatable">' + category.id + '</a>')
				  .appendTo($categories);

		var $ul = $('<ul />').appendTo($categories);
		$.each(lp.projects, function(pidx, project) {
			if (category.id == project.category) {
				$('<li id="' + project.id + '" />').html('<a href="' + project.address + '"><img src="logos/' + project.id + '.png" alt="" /><span class="description"><strong>' + project.name + '</strong>' + project.description + '</span><span class="star star-off"></span></a></li>')
					   .data('category', category.id)
					   .appendTo($ul);
			}
		} );
	} );

	lp.initTranslation();
	lp.setLocale();

	// Search
	$("label").inFieldLabels();
	$('#searching').keyup(lp.search).keyup();

	$('.star').click(function() {
		var $star = $(this);
		var $li = $star.parents('li');
		var $category = $star.parents('ul').prev();
		if ($category.attr('id') != 'favorites') {
			lp.addProjectToUrl($li.attr('id'));
		} else {
			lp.removeProjectFromUrl($li.attr('id'));
		}
		return false;
	} );

	$('#categories ul li a').click(function() {
		var $a = $(this);

		lp.actualProject = lp.getProject($a.parent().attr('id'));
		lp.saveToUrl('project', lp.actualProject.id);

		return false;
	} );

	lp.setUrlFromStorage();
	$(window).bind('hashchange', lp.onStateChange).trigger('hashchange');
} );
