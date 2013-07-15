<?php
require_once 'vendor/knplabs/knp-snappy/src/autoload.php';
use Knp\Snappy\Pdf;
$snappy = new Pdf('/usr/local/bin/wkhtmltopdf');
$snappy->setOption('disable-javascript', true);
$snappy->setOption('disable-local-file-access', true);
$snappy->setOption('orientation', 'Landscape');
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="My NUSMods.com Timetable.pdf"');
echo $snappy->getOutputFromHtml(urldecode($_POST['html']));