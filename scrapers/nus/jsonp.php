<?php
$basedir = dirname(__FILE__);
$path = realpath($basedir . strtok($_SERVER['REQUEST_URI'], '?'));
if ($path && strpos($path, $basedir) === 0) {
    header('Content-type: application/javascript');
    echo $_GET['callback'] . '(' . file_get_contents($path) . ')';
}
