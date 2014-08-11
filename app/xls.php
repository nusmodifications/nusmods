<?php
header('Content-Type: application/vnd.ms-excel');
header('Content-Disposition: attachment; filename="My NUSMods.com Timetable.xls"');
echo urldecode($_POST['html']);
