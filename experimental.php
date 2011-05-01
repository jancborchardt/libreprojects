<?php try { $db = new PDO('sqlite:database.db'); } catch (Exception $e) { die($e); } ?>
<!DOCTYPE html><html><head><meta http-equiv="content-type" content="text/html;charset=utf-8" />
<title>Libre Projects</title><link rel="stylesheet" type="text/css" href="default.css" />
<link rel="shortcut icon" href="favicon.png" /><link rel="apple-touch-icon-precomposed" href="favicon-touch.png" />
</head><body>

<h1><a href="http://libreprojects.net/"><img src="favicon-touch.png" />Libre Projects</a></h1>
<?php try { $count = $db->prepare('SELECT COUNT(*) AS projectcount FROM projects;'); $count->execute(); } catch (Exception $e) { die($e); } ?>
<p><?php echo $count->fetchObject()->projectcount ?> free web services & alternatives</p>
<h2><a title="what&apos;s this about?" href="#information">?</a></h2>
<div><a href="http://2011.donation.tuxfamily.org/"><strong>Like this?</strong><img src="tuxfamily-donation.png" /><br /><span>Please donate to TuxFamily,<br />our awesome web host! :)</span></a></div>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js" type="text/javascript"></script>
<script type='text/javascript'> 
  //<![CDATA[
    $(document).ready(function(){
      var runSearch = function() {
        var value = $('#search input').val();
    
        if(!value.length)
          $('#search-results').html('');
        else {
          $.post('/search',
                {'query': value},
                function(data) {
                  $('#search-results').html(data);
                });
          _trackEvent('search', 'run', 'value');
        }
      };
    
      $('#search input.searchfield').keyup(function(event) {
        runSearch();
      });
      $('#search input.searchfield').change(function(event) {
        runSearch();
      });
      $('#search').submit(function(event) {
        runSearch();
        event.preventDefault();
      });
    });
  //]]>
</script>
<form action='/' id='search'><input class='searchfield' name='query' placeholder='Search Libre Projects' result='5' type='search'></form> 
<div id='search-results'><p class='no-results'></p></div>

<?php // get favorite projects from parameters like /?top=diaspora,identica,jappix,reddit,newsblur
if(isset($_GET['top'])): ?>
<h2 id="top"><a href="#top">&#x2605;</a></h2>
<ul>
<?php
$top = explode(',', $_GET['top']);
while($topproject = array_shift($top)) {
	try { $topprojectentry = $db->prepare('SELECT * FROM projects WHERE id="'.$topproject.'";'); $topprojectentry->execute(); } catch (Exception $e) { die ($e); }
	$project = $topprojectentry->fetchObject();
	$excludeprojects .= "'".$topproject."',"; ?>
	<li><a href="<?php echo $project->address ?>"><img src="logos/<?php echo $project->id ?>.png" /><span><strong><?php echo $project->name ?></strong> <?php echo $project->description ?></span></a></li>
<?php } ?>
</ul>
<?php $excludeprojects = substr($excludeprojects, 0 , strlen($excludeprojects)-1);
endif; ?>

<?php // get other categories
try { $categories = $db->prepare('SELECT * FROM categories ORDER BY position ASC;'); $categories->execute(); } catch (Exception $e) { die($e); }
while($category = $categories->fetchObject()): ?>
<h2 id="<?php echo $category->id ?>"><a href="#<?php echo $category->id ?>"><?php echo $category->id ?></a></h2>
<ul>
<?php try { $projects = $db->prepare('SELECT * FROM projects WHERE category="'.$category->id.'" AND id NOT IN ('.$excludeprojects.');'); $projects->execute(); } catch (Exception $e) { die($e); }
while($project = $projects->fetchObject()): ?>
	<li><a href="<?php echo $project->address ?>"><img src="logos/<?php echo $project->id ?>.png" /><span><strong><?php echo $project->name ?></strong> <?php echo $project->description ?></span></a></li>
<?php endwhile; ?>
</ul>

<?php endwhile; ?>

<h3 id="information"><a href="#information">Information</a></h3>
<p>Web services listed here have free usage &amp; sharing as a main goal &ndash; using <a href="http://gnu.org/licenses/"><abbr title="General Public License">the GNU GPL</abbr></a>, <a title="preferably Share-Alike" href="http://creativecommons.org/">a Creative Commons license</a> or similar terms. There will be no advertising for corporations that offer libre features as a niche service. On the other hand, platforms that mainly distribute free content and don&apos;t require user accounts do not have to be free themselves.</p>
<p>In the end, hosted web services are all about mutual trust. Users trust that their data is secure and the service will stay available in the future. Developers trust that the service will not be abused.</p>
<p>Ideally, you have a <a title="a plug computer running your piece of the internet" href="http://wiki.debian.org/FreedomBox">FreedomBox</a> running at home and don&apos;t need to trust anyone. But many are not in the position to do that; either because of no permanent residence, not enough money to afford it or a weak internet connection not able to serve data across the country.</p>

<h3 id="participate"><a href="#participate">Participate</a></h3>
<p><a href="http://jancborchardt.wordpress.com/">Jan-Christoph Borchardt</a> thanks the fine people at <a title="they host pure awesome" href="http://tuxfamily.org/">TuxFamily</a>, <a title="these domain guys are French as well, pretty cool" href="http://gandi.net/">Gandi</a> &amp; <a title="their German chapter, which kinda makes this a Franco-German collaboration" href="http://blog.wikimedia.de/2010/12/06/wissenswert-ergebnis-wir-unterstuetzen-acht-mutige-projekte/">Wikimedia</a> who make this possible.</p>
<p>Feel free to <a title="except the logos which are subject to their own license" href="http://creativecommons.org/licenses/by-sa/3.0/">use &amp; share everything</a>, <a title="provided by TuxFamily" href="http://stats.tuxfamily.org/libreprojects.net">view stats</a>, <a title="using the ever awesome EtherPad" href="http://jancborchardt.titanpad.com/libreprojects">add projects</a> &amp; <a title="kept in perfect sync by SparkleShare" href="https://gitorious.org/libreprojects/libreprojects/trees/master">wrangle some code</a> or simply tell your friends!</p>
<p>Check out similar projects such as <a title="a plug computer running your piece of the internet" href="http://wiki.debian.org/FreedomBox">FreedomBox</a>, <a title="a website is only source code" href="http://unhosted.org/">Unhosted</a>, <a title="alternative Android market for free software" href="http://f-droid.org/repository/">FDroid</a> and <a title="community tools for free and open source software" href="http://openhatch.org/">OpenHatch</a>.</p>

</body></html>
