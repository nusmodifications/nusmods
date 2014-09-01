<?php

header('Access-Control-Allow-Methods: GET');
header('Access-Control-Max-Age: 1000');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

function getRedirectUrl ($url) {
  stream_context_set_default(array(
    'http' => array(
      'method' => 'HEAD'
    )
  ));
  $headers = get_headers($url, 1);
  if ($headers !== false && isset($headers['Location'])) {
    return $headers['Location'];
  }
  return false;
}

$timetableUrl = $_GET['timetable'];
$redirectedUrl = getRedirectUrl($timetableUrl);

if (!$redirectedUrl) {
  $redirectedUrl = $timetableUrl;
}

echo json_encode(array(
  'redirectedUrl' => $redirectedUrl
));

?>
