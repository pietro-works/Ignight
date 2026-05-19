<?php
declare(strict_types=1);

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function clean_token($value, int $max = 96): string {
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[^a-zA-Z0-9_-]/', '', $value);
    return substr($value ?: '', 0, $max);
}

function reply_json(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function read_payload(): array {
    $raw = file_get_contents('php://input') ?: '';
    $json = json_decode($raw, true);
    if (is_array($json)) return $json;
    return $_POST ?: [];
}

function mkdir_safe(string $dir): void {
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        reply_json(['ok' => false, 'error' => 'storage'], 500);
    }
    $deny = $dir . '/.htaccess';
    if (!file_exists($deny)) @file_put_contents($deny, "Require all denied\nDeny from all\n");
}

$input = read_payload();
$action = clean_token($input['action'] ?? $_GET['action'] ?? '', 24);
$roomId = clean_token($input['roomId'] ?? $_GET['roomId'] ?? '', 96);
$role = clean_token($input['role'] ?? $_GET['role'] ?? '', 12);
$targetRole = clean_token($input['targetRole'] ?? $_GET['targetRole'] ?? '', 12);

if (!$roomId) reply_json(['ok' => false, 'error' => 'bad-room'], 400);

$frameDir = __DIR__ . '/__mp_cam_frames';
mkdir_safe($frameDir);

if (mt_rand(1, 55) === 1) {
    foreach (glob($frameDir . '/*') ?: [] as $file) {
        if (is_file($file) && time() - (filemtime($file) ?: time()) > 86400) @unlink($file);
    }
}

if ($action === 'image') {
    if (!in_array($role, ['host', 'guest'], true)) {
        http_response_code(400);
        exit;
    }
    $file = $frameDir . '/' . $roomId . '-' . $role . '.jpg';
    if (!is_file($file) || time() - (filemtime($file) ?: 0) > 12) {
        http_response_code(404);
        exit;
    }
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

if (!in_array($action, ['frame', 'poll', 'leave'], true)) {
    reply_json(['ok' => false, 'error' => 'bad-action'], 400);
}

if ($action === 'frame') {
    if (!in_array($role, ['host', 'guest'], true)) reply_json(['ok' => false, 'error' => 'bad-role'], 400);
    $image = is_string($input['image'] ?? null) ? $input['image'] : '';
    if (!str_starts_with($image, 'data:image/jpeg;base64,')) reply_json(['ok' => false, 'error' => 'bad-image'], 400);
    $data = base64_decode(substr($image, strlen('data:image/jpeg;base64,')), true);
    if ($data === false || strlen($data) < 256 || strlen($data) > 420000) {
        reply_json(['ok' => false, 'error' => 'image-size'], 400);
    }
    $file = $frameDir . '/' . $roomId . '-' . $role . '.jpg';
    file_put_contents($file, $data, LOCK_EX);
    reply_json(['ok' => true, 'updated' => filemtime($file) ?: time(), 'bytes' => strlen($data)]);
}

if ($action === 'leave') {
    if (in_array($role, ['host', 'guest'], true)) @unlink($frameDir . '/' . $roomId . '-' . $role . '.jpg');
    reply_json(['ok' => true]);
}

if (!in_array($targetRole, ['host', 'guest'], true)) reply_json(['ok' => false, 'error' => 'bad-target'], 400);
$file = $frameDir . '/' . $roomId . '-' . $targetRole . '.jpg';
$mtime = is_file($file) ? (filemtime($file) ?: 0) : 0;
$fresh = $mtime && time() - $mtime <= 12;
reply_json([
    'ok' => true,
    'present' => (bool)$fresh,
    'updated' => $fresh ? $mtime : 0,
    'role' => $targetRole,
]);
