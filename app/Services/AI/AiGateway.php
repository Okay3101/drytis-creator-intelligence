<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * OpenAI-compatible AI abstraction layer. All LLM calls go through
 * OPENAI_BASE_URL/OPENAI_API_KEY env — never a public hostname, never
 * a hardcoded key. Every prompt wraps a provider-agnostic interface so
 * the model behind it can be swapped via OPENAI_MODEL.
 */
class AiGateway
{
    public function chat(array $messages, array $opts = []): ?string
    {
        $baseUrl = rtrim((string) env('OPENAI_BASE_URL', ''), '/');
        $key = (string) env('OPENAI_API_KEY', '');

        if ($baseUrl === '' || $key === '') {
            Log::warning('AI gateway not configured (missing OPENAI_BASE_URL / OPENAI_API_KEY)');

            return null;
        }

        try {
            $res = Http::withToken($key)
                ->timeout(90)
                ->post("{$baseUrl}/chat/completions", array_merge([
                    'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
                    'messages' => $messages,
                    'temperature' => 0.8,
                ], $opts));

            if (! $res->successful()) {
                Log::error('AI gateway HTTP '.$res->status().': '.substr($res->body(), 0, 300));

                return null;
            }

            return $res->json('choices.0.message.content');
        } catch (\Throwable $e) {
            Log::error('AI gateway exception: '.$e->getMessage());

            return null;
        }
    }

    public function chatJson(array $messages, array $opts = []): ?array
    {
        $text = $this->chat($messages, $opts);
        if ($text === null) {
            return null;
        }

        // strip possible markdown fences
        $text = preg_replace('/^```(json)?|```$/m', '', trim($text));
        $decoded = json_decode($text, true);

        return is_array($decoded) ? $decoded : null;
    }

    public function isConfigured(): bool
    {
        return (string) env('OPENAI_API_KEY', '') !== '' && (string) env('OPENAI_BASE_URL', '') !== '';
    }
}
