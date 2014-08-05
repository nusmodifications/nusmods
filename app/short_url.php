<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://modsn.us/yourls-api.php');
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, array(
  'action'    => 'shorturl',
  'format'    => 'json',
  'username'  => $_SERVER['YOURLS_USER'],
  'password'  => $_SERVER['YOURLS_PASS'],
  'url'       => $_GET['url'],
));
$data = curl_exec($ch);
curl_close($ch);
echo $data;
