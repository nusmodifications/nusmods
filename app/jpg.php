<?php
require_once 'vendor/knplabs/knp-snappy/src/autoload.php';
$size = isset($_POST['size']) ? $_POST['size'] : 1;
use Knp\Snappy\Image;
$snappy = new Image('/usr/local/bin/wkhtmltoimage');
$snappy->setOption('disable-javascript', true);
$snappy->setOption('disable-local-file-access', true);
$snappy->setOption('quality', 100);
$snappy->setOption('zoom', $size);
$description = $size == 1 ? 'Normal' : ($size == 2 ? 'Big' : 'Large');
$filename = 'My NUSMods.com Timetable (' . $description . ').jpg';
header('Content-Type: image/jpeg');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo $snappy->getOutputFromHtml(urldecode($_POST['html']));
