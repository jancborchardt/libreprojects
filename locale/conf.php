<?php
if (eregi(basename(__FILE__),$_SERVER['REQUEST_URI'])) {die('This file cannot be accessed directly.');}

if (isSet($_GET["locale"])) {
	$locale = substr($_GET["locale"], 0, 5);

} elseIf (isSet($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
	require_once('accept-to-gettext.inc');
	$langs=array('de_DE', 'en_US', 'it_IT');
	$locale=al2gt($langs, 'text/html');

} else { $locale="en_US"; }

setlocale('LC_ALL', $locale);
bindtextdomain("messages", "./locale");
textdomain("messages");
?>
