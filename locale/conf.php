<?php 
$locale = "en_US";
if (isSet($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
	$locale = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 5);
  $locale = preg_replace("/(..)-(..)/e", "'\\1_'.strtoupper('\\2')", $locale);
}
if (isSet($_GET["locale"])) $locale = $_GET["locale"];

putenv("LC_ALL=$locale");
setlocale(LC_ALL, $locale);
bindtextdomain("messages", "./locale");
textdomain("messages");
?> 

