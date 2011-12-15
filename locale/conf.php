<?php
if (eregi(basename(__FILE__),$_SERVER['REQUEST_URI'])) {die('This file cannot be accessed directly.');}

$langs = array('de_DE', 'en_US', 'fr_FR', 'it_IT', 'id_ID');
if (array_key_exists('locale', $_GET) && in_array($_GET['locale'], $langs)) {
	$locale = substr($_GET['locale'], 0, 5);
        setcookie('locale', $locale);
} elseif (array_key_exists('locale', $_COOKIE) && in_array($_COOKIE['locale'], $langs)) {
	$locale = $_COOKIE['locale'];
} elseif (array_key_exists('HTTP_ACCEPT_LANGUAGE', $_SERVER)) {
	require_once('accept-to-gettext.inc');
	$locale = al2gt($langs, 'text/html');
} else {
	$locale = 'en_US';
}

setlocale(LC_ALL, $locale);
bindtextdomain('messages', './locale');
textdomain('messages');
?>
