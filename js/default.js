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

	getData: function(type, id) {
		var found = null;
		if (typeof lp[type] != 'undefined') {
			$.each(lp[type], function(idx, value) {
				if (value.id == id) {
					found = value;
					return false;
				}
			} );
		}
		return found;
	},

	getProject: function(id) {
		return lp.getData('projects', id);
	},

	getAlternative: function(id) {
		return lp.getData('alternatives', id);
	},

	getLicense: function(id) {
		return lp.getData('licenses', id);
	},

	findSimilarProjectsTo: function(project, max) {
		var similar = [];
		var found = [];
		project = project || lp.actualProject;
		max = max || 6;

		if (! project.tags || project.tags.length == 0) {
			return similar;
		}

		$.each(lp.projects, function(idxp, pj) {
			if (pj.tags && pj.tags.length > 0 && pj.id != project.id) {
				var score = 0;
				$.each(project.tags, function(idxt, tag) {
					if (pj.tags.indexOf(tag) != -1) {
						score = (-1 * (idxt - project.tags.length)) + score; // 1st tag is worth more than 2nd that is worth more than 3rd etc.
					}
				} );
				if (score) {
					// Check if we don't already have max project that have >= score
					var nbBetterFound = 0;
					$.each(found, function(idxf, f) {
						if (f.score >= score) {
							nbBetterFound++;
						}
					} );
					if (nbBetterFound < max) {
						found.push({score:score,project:pj});
					}
				}
			}
		} );

		// Build similar
		$.each(found.sort(function(a, b){return b.score - a.score}), function(idxf, f) {
			similar.push(f.project);
		} );

		return similar;
	},

	setLocale: function(locale) {
		if (!locale) {
			locale = localStorage.getItem('locale');
		}
		if (!locale) {
			locale = window.navigator.language ? window.navigator.language : window.navigator.userLanguage;
		}

		if (locale != lp.locale) {
			localStorage.setItem('locale', locale);
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

	translateTo: function(locale, $from) {
		if (!locale) {
			return;
		}

		if (typeof lp.dictionaries[locale] == 'undefined') {
			lp.getDictionary(locale);
			return;
		}

		var $toTranslate = $from ? $from.find('.translatable') : $('.translatable');
		$toTranslate.each(function(idxe, element) {
			var $element = $(element);
			var translation = '';

			var key = $element.data('translatable');
			if(! key) {
				// element was (probably) dynamically loaded, hence original text
				// hasn't been cached yet.
				key = lp.determineTranslationKey($element);
				if(! key) {
					// still no translation key (i.e. element is empty).
					// giving up.
					return;
				}
			}

			if (typeof lp.dictionaries[locale][key] == 'string') {
				translation = lp.dictionaries[locale][key];
			} else {
				translation = key;
			}
			if ($element.html()) {
				$element.html(translation);
			}
			// need i18n
//			if ($element.data('text')) {
//				$element.data('text', translation);
//			}
		} );
	},

	determineTranslationKey: function($element) {
		var value = $element.html().replace(/"/g, '\'');
		$element.data('translatable', value);
		return value;
	},

	initTranslation: function($from) {
		var $toInit = $from ? $from.find('.translatable') : $('.translatable');
		$toInit.each(function(idxe, element) {
			var $element = $(element);
			lp.determineTranslationKey($element);
		} );
	},

	search: function() {
		var $search = $(this);

		// Only do the following after 100ms if keyup is not being used again
//		$search.doTimeout('lp.search', 100, function() { // Removing timeout for now to make it more instant
			var value = $search.val().toLowerCase();

			// Hide or show projects depending if they match or not
			$('#categories ul li .name').each(function(idx, project) {
				var $project = $(project);
				if (value && $project.text().toLowerCase().indexOf(value) == -1) {
					$project.parents('li').hide();
				} else {
					$project.parents('li').show();
				}
			} );

			lp.categoriesDisplay();
//		} );
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

	getFromAddress: function(fragment) {
		var frags = $.deparam.fragment();
		if (typeof frags[fragment] == 'undefined') {
			frags[fragment] = '';
		}
		return frags[fragment];
	},

	saveToAddress: function(fragment, value) {
		var frags = $.deparam.fragment();
		frags[fragment] = value;
		// To prevent scrolling on every actions, we remove it if not adding it right now
		if (fragment != 'scroll') {
			frags['scroll'] = '';
		}
		$.bbq.pushState(frags);
	},

	getFavoritesFromAddress: function() {
		var favs = lp.getFromAddress('favs');
		return favs.split(',').filter(function(element){return element.length != ''});
	},

	saveFavoritesToAddress: function(favs) {
		if (favs.length == 0) {
			favs = '';
		} else {
			favs = favs.join(',');
		}
		lp.saveToAddress('favs', favs);
	},

	addProjectToAddress: function(project) {
		var favs = lp.getFavoritesFromAddress();
		if (favs.indexOf(project) == -1) {
			favs.push(project);
		}
		lp.saveFavoritesToAddress(favs);
	},

	removeProjectFromAddress: function(project) {
		var favs = lp.getFavoritesFromAddress();
		if (favs.indexOf(project) != -1) {
			favs = favs.filter(function(element){return element != project});
		}
		lp.saveFavoritesToAddress(favs);
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

	setAddressFromStorage: function() {
		var favs = lp.getFavoritesFromStorage();
		if (favs.length > 0) {
			$.each(favs, function(idxf, fav) {
				lp.addProjectToAddress(fav);
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

	getLightboxOptions: function() {
		var $details = $('#project-details');
		return {
			onOpen: function(dialog) {
				dialog.overlay.fadeIn('fast', function() {
					// Filling up details
					$details.find('.address').attr('href', lp.actualProject.address).data('text', 'Check it out !');
					$details.find('.name').html(lp.actualProject.name);
					$details.find('.description').html(lp.actualProject.description);
					$details.find('.category').attr('href', '#' + lp.actualProject.category).html(lp.actualProject.category).data('text', 'Check the ' + lp.actualProject.category + ' category');
					$details.find('.logo').attr('src', 'logos/' + lp.actualProject.id + '.png');

					var $tags = $details.find('.tags').html('');
					if (lp.actualProject.tags && lp.actualProject.tags.length) {
						$.each(lp.actualProject.tags, function(idxt, tag) {
							$('<li />').html('#' + tag)
								   .appendTo($tags);
						} );
					}

					var $alternative = $details.find('.alternative-to ul').html('');
					if (lp.actualProject.alternative && lp.actualProject.alternative.length) {
						$.each(lp.actualProject.alternative, function(idxa, alternative) {
							alternative = lp.getAlternative(alternative);
							if (alternative) {
								var $li = $('<li />').html('<a href="' + alternative.address + '"><img src="logos/alternatives/' + alternative.id + '.png" alt="' + alternative.name + ' logo"/></a>')
										     .appendTo($alternative);
								$li.find('a').data('text', alternative.name);
							}
						} );
					}

					var $license = $details.find('.license ul').html('');
					if (lp.actualProject.licenses && lp.actualProject.licenses.length) {
						$.each(lp.actualProject.licenses, function(idx, license) {
							license = lp.getLicense(license);
							if (license) {
								var $li = $('<li />').html('<a href="' + license.address + '"><img src="logos/licenses/' + license.id + '.png" alt="' + license.name + ' logo"/></a>')
										     .appendTo($license);
								$li.find('a').data('text', license.name);
							}
						} );
					}

					var $similar = $details.find('.similar-to ul').html('');
					$.each(lp.findSimilarProjectsTo(), function(idxs, similar) {
						var $li = $('<li />').html('<a href="#"><img src="logos/' + similar.id + '.png" alt="' + similar.name + ' logo"/></a>')
								     .appendTo($similar);
						$li.find('a').data('text', similar.name + ' - ' + similar.description)
							     .click(function() {
									$.modal.close();
									lp.actualProject = similar;
									lp.saveToAddress('project', lp.actualProject.id);
									return false;
							     } );
					} );

					var $introduction = $details.find('.introduction');
					if (typeof lp.actualProject.introduction == 'string') {
						$introduction.html(lp.actualProject.introduction)
							     .data('text', lp.actualProject.introduction);
					}

					if ($alternative.find('li').length == 0 ||
					    $similar.find('li').length == 0 ||
					    $introduction.html().length == 0 ||
					    $license.find('li').length == 0) {
						$details.find('.tip').html('This sheet is not complete <a href=\'#participate\'>help us</a> improve it.')
								     .data('translatable', 'This sheet is not complete <a href=\'#participate\'>help us</a> improve it.')
								     .show();
					}

					$details.find('a').unbind('hover').hover(function() {
						var $a = $(this);
						if ($a.data('text')) {
							$details.find('.tip').html($a.data('text')).show();
						}
					}, function() {
						var $tip = $details.find('.tip');
						if ($tip.data('translatable')) {
							$tip.html($tip.data('translatable'));
							lp.translateTo(lp.locale, $tip.parent());
						} else {
							$details.find('.tip').html('').hide();
						}
					} );

					lp.initTranslation($details);
					lp.translateTo(lp.locale, $details);

					$details.find('a[href*=#]').click(function() {
						$.modal.close();
						lp.saveToAddress('scroll', $(this).attr('href').substr(1));

						return false;
					} );

					dialog.data.show();
					dialog.container.fadeIn('fast');
				} );
			},
			onClose: function(dialog) {
				lp.saveToAddress('project', '');
				$.modal.close();
			},
			minWidth: 450,
			minHeight: 350,
			closeHTML: 'X',
			overlayClose: true
		};
	},

	/**
	 * When the state change, we have to check if all projects in favorites
	 * still are there or if they have to be added or sent back to their
	 * categories.
	 *
	 * We also have to check if the event is for showing a project details.
	 */
	onStateChange: function(e) {
		var favs = lp.getFavoritesFromAddress();

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
		if (project = lp.getFromAddress('project')) {
			// In case we just arrive on the website with #project in the address
			if (!lp.actualProject) {
				lp.actualProject = lp.getProject(project);
			}
			$('#project-details').modal( lp.getLightboxOptions() );
		} else {
			// Hiding project details lightbox
			$.modal.close();
			lp.actualProject = null;
		}

		if (scroll = lp.getFromAddress('scroll')) {
			$.smoothScroll({scrollTarget: $('#' + scroll)});
//			lp.saveToAddress('scroll', '');
		}
	}
} );

$(document).ready(function() {

	// Create translations availables
	var $locale = $('#locale');
	$.each(lp.locales, function(lidx, locale) {
		var $li = $('<li />');
		var $a = $('<a href="#" id="lang-' + locale.id + '" />')
			 .html('<img src="images/countries/' + locale.id + '.png" alt="' + locale.name + ' flag" />')
			 .click(function() {
				 lp.setLocale(locale.id);
				 return false;
			 } )
			 .appendTo($li);
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
				$('<li id="' + project.id + '" />').html('<a href="' + project.address + '"><img src="logos/' + project.id + '.png" alt="" /><span class="project"><strong class="name">' + project.name + '</strong><span class="translatable">' + project.description + '</span></span><span class="star star-off"></span></a></li>')
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
			lp.addProjectToAddress($li.attr('id'));
		} else {
			lp.removeProjectFromAddress($li.attr('id'));
		}
		return false;
	} );

	$('#categories ul li a').click(function() {
		lp.actualProject = lp.getProject($(this).parent().attr('id'));
		lp.saveToAddress('project', lp.actualProject.id);

		return false;
	} );

	$('a[href*=#]').click(function() {
		lp.saveToAddress('scroll', $(this).parent().attr('id'));

		return false;
	} );

	lp.setAddressFromStorage();
	$(window).bind('hashchange', lp.onStateChange).trigger('hashchange');
} );
