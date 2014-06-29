<?php
require_once 'vendor/knplabs/knp-snappy/src/autoload.php';
use Knp\Snappy\Image;
$snappy = new Image('/usr/local/bin/wkhtmltoimage');
$snappy->setOption('disable-javascript', true);
$snappy->setOption('disable-local-file-access', true);
header('Content-Type: image/jpeg');
header('Content-Disposition: attachment; filename="My NUSMods.com Timetable.jpg"');
echo $snappy->getOutputFromHtml(urldecode($_POST['html']));