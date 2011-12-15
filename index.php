<?php try { $db = new PDO('sqlite:database.db'); } catch (Exception $e) { die($e); } ?>
<?php require_once('locale/conf.php'); ?>
<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html;charset=utf-8" />
<title><?=_("Libre Projects")?></title><link rel="stylesheet" type="text/css" href="/default.css" />
<link rel="shortcut icon" href="/favicon.png" /><link rel="apple-touch-icon-precomposed" href="/favicon-touch.png" />
</head><body>

<h1><a href="http://libreprojects.net/top"><img src="/favicon-touch.png" /><?=_("Libre Projects")?></a></h1>
<?php try { $count = $db->prepare('SELECT COUNT(*) AS projectcount FROM projects;'); $count->execute(); } catch (Exception $e) { die($e); } ?>
<p><?=$count->fetchObject()->projectcount ?> <?=_("free web services & alternatives")?></p>
<h2><a title='<?=_("what&apos;s this about?")?>' href="/#information">?</a></h2>
<ul id="locale"><?php foreach ($langs as $lang) : ?><li><a <?= $locale == $lang ? 'class="selected" ' : '' ?>href="?locale=<?=$lang?>"><img src="/locale/<?=$lang?>/flag.png"></a></li><?php endforeach; ?></ul>

<?php // get favorite projects from parameters like /top/diaspora,identica,jappix,reddit,newsblur
if(isset($_GET['top'])): ?>
<h2 id="top"><a href="/#top">&#x2605;</a></h2>
<ul>
<?php
$top = explode(',', $_GET['top']);
while($topproject = array_shift($top)) {
	try { $topprojectentry = $db->prepare('SELECT * FROM projects WHERE id="'.$topproject.'";'); $topprojectentry->execute(); } catch (Exception $e) { die ($e); }
	$project = $topprojectentry->fetchObject();
	$excludeprojects .= "'".$topproject."',"; ?>
	<li><a href="<?=$project->address ?>"><img src="/logos/<?=$project->id ?>.png" /><span><strong><?=$project->name ?></strong> <?=$project->description ?></span></a></li>
<?php } ?>
</ul>
<?php $excludeprojects = substr($excludeprojects, 0 , strlen($excludeprojects)-1);
endif; ?>

<?php // get other categories
try { $categories = $db->prepare('SELECT * FROM categories ORDER BY position ASC;'); $categories->execute(); } catch (Exception $e) { die($e); }
while($category = $categories->fetchObject()): ?>
<h2 id="<?=$category->id ?>"><a href="/#<?=$category->id ?>"><?=_($category->id)?></a></h2>
<ul>
<?php try { $projects = $db->prepare('SELECT * FROM projects WHERE category="'.$category->id.'" ' . (isset($excludeprojects) ? 'AND id NOT IN ('.$excludeprojects.')' : '') . ';'); $projects->execute(); } catch (Exception $e) { die($e); }
while($project = $projects->fetchObject()): ?>
	<li><a href="<?=$project->address ?>"><img src="/logos/<?=$project->id ?>.png" /><span><strong><?=$project->name ?></strong> <?=$project->description ?></span></a></li>
<?php endwhile; ?>
</ul>

<?php endwhile; ?>

<h3 id="information"><a href="/#information"><?=_("Information")?></a></h3>
<p><?=_("Web services listed here have free usage &amp; sharing as a main goal &ndash; using <a href='http://gnu.org/licenses/'><abbr title='General Public License'>the GNU GPL</abbr></a>, <a title='preferably Share-Alike' href='http://creativecommons.org/'>a Creative Commons license</a> or similar terms. There will be no advertising for corporations that offer libre features as a niche service. On the other hand, platforms that mainly distribute free content and don&apos;t require user accounts do not have to be free themselves.")?></p>
<p><?=_("In the end, hosted web services are all about mutual trust. Users trust that their data is secure and the service will stay available in the future. Developers trust that the service will not be abused.")?></p>
<p><?=_("Ideally, you have a <a title='a plug computer running your piece of the internet' href='http://wiki.debian.org/FreedomBox'>FreedomBox</a> running at home and don&apos;t need to trust anyone. But many are not in the position to do that; either because of no permanent residence, not enough money to afford it or a weak internet connection not able to serve data across the country.")?></p>

<h3 id="participate"><a href="/#participate"><?=_("Participate")?></a></h3>
<p><?=_("<a href='http://jancborchardt.wordpress.com/'>Jan-Christoph Borchardt</a> thanks the fine people at <a title='they host pure awesome' href='http://tuxfamily.org/'>TuxFamily</a>, <a title='these domain guys are French as well, pretty cool' href='http://gandi.net/'>Gandi</a> &amp; <a title='their German chapter, which kinda makes this a Franco-German collaboration' href='http://blog.wikimedia.de/2010/12/06/wissenswert-ergebnis-wir-unterstuetzen-acht-mutige-projekte/'>Wikimedia</a> who make this possible.")?></p>
<p><?=_("Feel free to <a title='except the logos which are subject to their own license' href='http://creativecommons.org/licenses/by-sa/3.0/'>use &amp; share everything</a>, <a title='provided by TuxFamily' href='http://stats.tuxfamily.org/libreprojects.net'>view stats</a>, <a href='http://gitorious.org/libreprojects/pages/Home'>add projects</a> &amp; <a href='https://gitorious.org/libreprojects/libreprojects/trees/master'>wrangle some code</a> or simply tell your friends!")?></p>
<p><?=_("Check out similar projects such as <a title='a plug computer running your piece of the internet' href='http://wiki.debian.org/FreedomBox'>FreedomBox</a>, <a title='a web app is only source code' href='http://unhosted.org/'>Unhosted</a>, <a title='alternative Android market for free software' href='http://f-droid.org/repository/'>FDroid</a> and <a title='community tools for free and open source software' href='http://openhatch.org/'>OpenHatch</a>.")?></p>

</body></html>
