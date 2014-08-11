<?php
header('Content-Type: text/html');
header('Content-Disposition: attachment; filename="My NUSMods.com Timetable.html"');
echo urldecode($_POST['html']);
