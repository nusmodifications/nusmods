<?php
require_once 'vendor/facebook/php-sdk-v4/autoload.php';
use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphPage;
$config = file_get_contents('./scripts/config.json');
$configData = json_decode($config, true);
$bareNusFbId = $configData['bareNusessities']['facebookId'];
$fbAppId = $configData['facebook']['appID'];
$fbAppSecret = $configData['facebook']['appSecret'];
FacebookSession::setDefaultApplication($fbAppId, $fbAppSecret);
$session = FacebookSession::newAppSession();

try {
  $data = (new FacebookRequest(
    $session, 'GET', '/' . $bareNusFbId
  ))->execute()->getGraphObject();
  print_r($data->asArray());
} catch (FacebookRequestException $e) {
  // The Graph API returned an error
} catch (\Exception $e) {
  // Some other error occurred
}
?>


