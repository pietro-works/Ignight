<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function reply_json(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_token($value, int $max = 96): string {
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[^a-zA-Z0-9_-]/', '', $value);
    return substr($value ?: '', 0, $max);
}

function read_payload(): array {
    $raw = file_get_contents('php://input') ?: '';
    $json = json_decode($raw, true);
    if (is_array($json)) return $json;
    return $_POST ?: [];
}

function room_template(): array {
    $now = time();
    return [
        'created' => $now,
        'updated' => $now,
        'members' => [],
        'messages' => []
    ];
}

$input = read_payload();
$action = clean_token($input['action'] ?? '', 24);
$roomId = clean_token($input['roomId'] ?? $input['room'] ?? '', 96);
$role = clean_token($input['role'] ?? '', 12);
$clientId = clean_token($input['clientId'] ?? '', 72);
$peerId = clean_token($input['peerId'] ?? '', 96);

if (!in_array($action, ['join', 'poll', 'send', 'leave'], true)) reply_json(['ok' => false, 'error' => 'bad-action'], 400);
if (!$roomId || !in_array($role, ['host', 'guest'], true) || !$clientId) reply_json(['ok' => false, 'error' => 'bad-room'], 400);

$dir = __DIR__ . '/__mp_rooms';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) reply_json(['ok' => false, 'error' => 'storage'], 500);

$deny = $dir . '/.htaccess';
if (!file_exists($deny)) {
    @file_put_contents($deny, "Require all denied\nDeny from all\n");
}

if (mt_rand(1, 40) === 1) {
    foreach (glob($dir . '/*.json') ?: [] as $oldFile) {
        if (time() - (filemtime($oldFile) ?: time()) > 86400) @unlink($oldFile);
    }
}

$file = $dir . '/' . $roomId . '.json';
$fp = fopen($file, 'c+');
if (!$fp) reply_json(['ok' => false, 'error' => 'open'], 500);
flock($fp, LOCK_EX);

$rawRoom = stream_get_contents($fp);
$room = $rawRoom ? json_decode($rawRoom, true) : null;
if (!is_array($room)) $room = room_template();

$now = time();
$freshCutoff = $now - 18;
$messageCutoff = $now - 360;

$room['members'] = array_filter($room['members'] ?? [], function ($member) use ($freshCutoff) {
    return is_array($member) && (int)($member['seen'] ?? 0) >= $freshCutoff;
});

if ($action === 'leave') {
    if (($room['members'][$role]['clientId'] ?? '') === $clientId) unset($room['members'][$role]);
} else {
    $room['members'][$role] = [
        'role' => $role,
        'clientId' => $clientId,
        'peerId' => $peerId,
        'seen' => $now,
        'ua' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 180)
    ];
}

if ($action === 'send') {
    $message = is_array($input['message'] ?? null) ? $input['message'] : [];
    $id = clean_token($message['id'] ?? '', 120);
    if (!$id) $id = $clientId . '-' . $now . '-' . substr(bin2hex(random_bytes(4)), 0, 8);
    $message['id'] = $id;
    $message['role'] = $role;
    $room['messages'][] = [
        'id' => $id,
        'role' => $role,
        'clientId' => $clientId,
        'time' => $now,
        'payload' => $message
    ];
}

$messages = array_values(array_filter($room['messages'] ?? [], function ($message) use ($messageCutoff) {
    return is_array($message) && (int)($message['time'] ?? 0) >= $messageCutoff;
}));
if (count($messages) > 220) $messages = array_slice($messages, -220);
$room['messages'] = $messages;
$room['updated'] = $now;

$seen = is_array($input['seen'] ?? null) ? array_flip(array_map('strval', $input['seen'])) : [];
$outMessages = [];
if ($action === 'poll' || $action === 'join') {
    foreach ($messages as $message) {
        if (($message['clientId'] ?? '') === $clientId) continue;
        if (isset($seen[(string)($message['id'] ?? '')])) continue;
        $outMessages[] = $message;
    }
}

rewind($fp);
ftruncate($fp, 0);
fwrite($fp, json_encode($room, JSON_UNESCAPED_SLASHES));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

$partnerRole = $role === 'host' ? 'guest' : 'host';
$partner = $room['members'][$partnerRole] ?? null;
$partnerPresent = is_array($partner) && (int)($partner['seen'] ?? 0) >= $freshCutoff;

reply_json([
    'ok' => true,
    'action' => $action,
    'roomId' => $roomId,
    'partnerPresent' => $partnerPresent,
    'members' => $room['members'],
    'messages' => $outMessages,
    'serverTime' => $now
]);

