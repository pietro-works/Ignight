<?php
declare(strict_types=1);

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Content-Type: application/json; charset=utf-8');

function reply_turn(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function default_ice_servers(): array {
    return [
        ['urls' => 'stun:stun.l.google.com:19302'],
        ['urls' => 'stun:global.stun.twilio.com:3478'],
    ];
}

function clean_ice_servers($servers): array {
    if (!is_array($servers)) return [];
    $clean = [];
    foreach ($servers as $server) {
        if (!is_array($server) || !isset($server['urls'])) continue;
        $urls = $server['urls'];
        if (is_string($urls)) {
            $urls = [$urls];
        }
        if (!is_array($urls)) continue;
        $urls = array_values(array_filter(array_map('strval', $urls), function ($url) {
            return preg_match('/^(stun|turn|turns):/i', $url);
        }));
        if (!$urls) continue;
        $entry = ['urls' => count($urls) === 1 ? $urls[0] : $urls];
        if (isset($server['username']) && is_string($server['username'])) $entry['username'] = $server['username'];
        if (isset($server['credential']) && is_string($server['credential'])) $entry['credential'] = $server['credential'];
        $clean[] = $entry;
    }
    return $clean;
}

function env_any(array $names): string {
    foreach ($names as $name) {
        $value = getenv($name);
        if (is_string($value) && $value !== '') return $value;
        if (isset($_SERVER[$name]) && is_string($_SERVER[$name]) && $_SERVER[$name] !== '') return $_SERVER[$name];
    }
    return '';
}

function http_json(string $url, array $headers = [], ?string $body = null, string $method = 'GET'): ?array {
    $opts = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'timeout' => 8,
            'ignore_errors' => true,
        ]
    ];
    if ($body !== null) $opts['http']['content'] = $body;
    $raw = @file_get_contents($url, false, stream_context_create($opts));
    if (!is_string($raw) || $raw === '') return null;
    $json = json_decode($raw, true);
    return is_array($json) ? $json : null;
}

$local = __DIR__ . '/turn-config.local.php';
if (is_file($local)) {
    $cfg = include $local;
    if (is_array($cfg)) {
        $servers = clean_ice_servers($cfg['iceServers'] ?? $cfg['ice_servers'] ?? []);
        if ($servers) reply_turn([
            'ok' => true,
            'configured' => true,
            'source' => $cfg['source'] ?? 'local',
            'iceServers' => $servers,
        ]);
    }
}

$jsonConfig = env_any(['IGNIGHT_ICE_SERVERS_JSON', 'ICE_SERVERS_JSON']);
if ($jsonConfig) {
    $decoded = json_decode($jsonConfig, true);
    $servers = clean_ice_servers($decoded['iceServers'] ?? $decoded['ice_servers'] ?? $decoded);
    if ($servers) reply_turn([
        'ok' => true,
        'configured' => true,
        'source' => 'env-json',
        'iceServers' => $servers,
    ]);
}

$cfKeyId = env_any(['CLOUDFLARE_TURN_KEY_ID', 'CF_TURN_KEY_ID']);
$cfToken = env_any(['CLOUDFLARE_TURN_API_TOKEN', 'CF_TURN_API_TOKEN']);
if ($cfKeyId && $cfToken) {
    $ttl = max(300, min(86400, (int)(env_any(['CLOUDFLARE_TURN_TTL', 'CF_TURN_TTL']) ?: 3600)));
    $roomParam = is_string($_GET['room'] ?? null) ? $_GET['room'] : 'ignight';
    $payload = json_encode([
        'ttl' => $ttl,
        'customIdentifier' => substr(preg_replace('/[^a-zA-Z0-9_-]/', '', $roomParam), 0, 64),
    ], JSON_UNESCAPED_SLASHES);
    $url = 'https://rtc.live.cloudflare.com/v1/turn/keys/' . rawurlencode($cfKeyId) . '/credentials/generate-ice-servers';
    $data = http_json($url, [
        'Authorization: Bearer ' . $cfToken,
        'Content-Type: application/json',
    ], $payload, 'POST');
    $servers = clean_ice_servers($data['iceServers'] ?? []);
    if ($servers) reply_turn([
        'ok' => true,
        'configured' => true,
        'source' => 'cloudflare',
        'iceServers' => $servers,
    ]);
}

$meteredApp = env_any(['METERED_APP_NAME', 'METERED_TURN_APP']);
$meteredKey = env_any(['METERED_TURN_API_KEY', 'METERED_API_KEY']);
if ($meteredApp && $meteredKey) {
    $safeApp = preg_replace('/[^a-zA-Z0-9-]/', '', $meteredApp);
    if ($safeApp) {
        $url = 'https://' . $safeApp . '.metered.live/api/v1/turn/credentials?apiKey=' . rawurlencode($meteredKey);
        $data = http_json($url);
        $servers = clean_ice_servers($data ?? []);
        if ($servers) reply_turn([
            'ok' => true,
            'configured' => true,
            'source' => 'metered',
            'iceServers' => $servers,
        ]);
    }
}

$twilioSid = env_any(['TWILIO_ACCOUNT_SID']);
$twilioToken = env_any(['TWILIO_AUTH_TOKEN']);
if ($twilioSid && $twilioToken) {
    $ttl = max(300, min(86400, (int)(env_any(['TWILIO_TURN_TTL']) ?: 3600)));
    $url = 'https://api.twilio.com/2010-04-01/Accounts/' . rawurlencode($twilioSid) . '/Tokens.json';
    $data = http_json($url, [
        'Authorization: Basic ' . base64_encode($twilioSid . ':' . $twilioToken),
        'Content-Type: application/x-www-form-urlencoded',
    ], http_build_query(['Ttl' => $ttl]), 'POST');
    $servers = clean_ice_servers($data['ice_servers'] ?? []);
    if ($servers) reply_turn([
        'ok' => true,
        'configured' => true,
        'source' => 'twilio',
        'iceServers' => $servers,
    ]);
}

reply_turn([
    'ok' => true,
    'configured' => false,
    'source' => 'default-stun',
    'iceServers' => default_ice_servers(),
]);
