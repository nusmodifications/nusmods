<?php
header('Content-Type: text/calendar');
header('Content-Disposition: attachment; filename="My NUSMods.com Timetable.ics"');
echo urldecode($_POST['html']);
