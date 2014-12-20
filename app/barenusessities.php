<?php
require_once 'vendor/facebook/php-sdk-v4/autoload.php';
use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphPage;
$config = file_get_contents('./scripts/config.json');
$configData = json_decode($config, true);

$bareNusNote = $configData['bareNusessities']['noteName'];
$bareNusEdge = $configData['bareNusessities']['edgeName'];
$bareNusFields = $configData['bareNusessities']['fields'];
$bareNusLimit = isset($_GET['limit']) ? $_GET['limit'] 
				: $configData['bareNusessities']['limit'];

$fbAppId = $configData['facebook']['appID'];
$fbAppSecret = $configData['facebook']['appSecret'];
$fbAccessToken = $configData['facebook']['accessToken'];
FacebookSession::setDefaultApplication($fbAppId, $fbAppSecret);
$session = new FacebookSession($fbAccessToken);


$path = '/' . $bareNusNote . 
    	'/' . $bareNusEdge . 
    	'?fields=' . $bareNusFields . 
    	'&limit=' . $bareNusLimit;

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
  echo json_encode($data, JSON_PRETTY_PRINT);
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
	return 'http://nusmods.com/barenusessities.php?' . $extractedQuery;
}