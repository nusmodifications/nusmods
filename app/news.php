<?php
require_once 'vendor/facebook/php-sdk-v4/autoload.php';
use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphPage;
$config = file_get_contents('./config/secrets.json');
$configData = json_decode($config, true);

define('FB_PAGE_ID', $_GET['fbPageId']);
define('EDGE', 'posts');
define('FIELDS', 'comments{comments{comments,message,id,like_count,comment_count,
  created_time,from},message,id,like_count,comment_count,created_time,from},
  description,object_id,message,type,caption');
define('LIMIT', 10);

$limit = isset($_GET['limit']) ? $_GET['limit'] : LIMIT;

$fbAppId = $configData['facebook']['appID'];
$fbAppSecret = $configData['facebook']['appSecret'];
FacebookSession::setDefaultApplication($fbAppId, $fbAppSecret);
$session = FacebookSession::newAppSession();

$path = '/' . FB_PAGE_ID . '/' . EDGE . '?fields=' . FIELDS . '&limit=' . $limit;
if (isset($_GET['since'])) {
	$path .= '&since=' . $_GET['since'];
} elseif (isset($_GET['until'])) {
	$path .= '&until=' . $_GET['until'];
}

try {
  $data = (new FacebookRequest(
    $session, 'GET', $path
  ))->execute()->getGraphObject()->asArray();

  $data['paging']->previous = transformUrl($data['paging']->previous);
  $data['paging']->next = transformUrl($data['paging']->next);

  header('Content-type: application/json');
  header('Access-Control-Allow-Origin: *');
  echo json_encode($data);
} catch (FacebookRequestException $e) {
  // The Graph API returned an error
} catch (\Exception $e) {
  // Some other error occurred
}

/**
 * A function to convert the fb paging url to nusmods url and hide token
 */
function transformUrl($url) {
	// extract the GET params as an array
	parse_str(parse_url($url, PHP_URL_QUERY), $query);
	$allowed = array('limit', 'since', 'until');
	// use array_flip + array_intersect_key to filter by key
	$extractedQuery = http_build_query(array_intersect_key($query, array_flip($allowed)));
  $extractedQuery = 'fbPageId=' . FB_PAGE_ID . '&' . $extractedQuery;
	return (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . 
          $_SERVER['PHP_SELF'] . '?' . $extractedQuery;
}
