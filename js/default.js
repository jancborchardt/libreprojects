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
				if (!locale.indexOf(availableLocale.id) || !locale.indexOf(availableLocale.name)) {
					$('#locale a').removeClass('selected');
					$('#lang-' + availableLocale.id).addClass('selected');
					lp.translateTo(availableLocale.id);
				}
			} );
		}
	},

	getDictionary: function(locale) {
		$.getJSON('/js/locales/' + locale + '.json', function(dictionary) {
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
			console.log($element.data('translatable'));
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
			$element.data('translatable', $element.html());
		} );
	}
} );

$(document).ready(function() {

	// Create translations availables
	var $locale = $('#locale');
	$.each(lp.locales, function(lidx, locale) {
		var $li = $('<li />');
		var $a = $('<a href="#" id="lang-' + locale.id + '" onclick="javascript:lp.setLocale(\'' + locale.id + '\');return false;" />').html('<img src="/images/countries/' + locale.id + '" alt="' + locale.name + ' flag" />').appendTo($li);
		$li.appendTo($locale);
	} );

	// Total number of projects
	$('#nb-projects').html(lp.projects.length);

	// Create categories and adding projects
	var $categories = $('#categories')
	$.each(lp.categories, function(cidx, category) {
		var $h2 = $('<h2 id="' + category.id + '" />').
				      html('<a href="#' + category.id + '" class="translatable">' + category.id + '</a>').
				      appendTo($categories);

		var $ul = $('<ul />').appendTo($categories);
		$.each(lp.projects, function(pidx, project) {
			if (category.id == project.category) {
				$('<li />').html('<a href="' + project.address + '"><img src="logos/' + project.id + '.png" /><span><strong>' + project.name + '</strong>' + project.description + '</span></a></li>').
					    appendTo($ul);
			}
		} );
	} );

	lp.initTranslation();
	lp.setLocale();
} );
