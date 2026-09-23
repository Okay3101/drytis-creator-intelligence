<?php

return [
    // demo | live — demo serves deterministic sample data without Meta credentials
    'mode' => env('INSTAGRAM_MODE', 'demo'),
    'app_id' => env('META_APP_ID'),
    'app_secret' => env('META_APP_SECRET'),
    'redirect_uri' => env('META_REDIRECT_URI'),
    'graph_base' => env('IG_GRAPH_BASE', 'https://graph.instagram.com/v21.0'),
];
