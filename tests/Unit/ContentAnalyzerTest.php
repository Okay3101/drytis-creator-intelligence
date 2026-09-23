<?php

namespace Tests\Unit;

use App\Models\Content;
use App\Jobs\ContentAnalyzer;
use Tests\TestCase;

class ContentAnalyzerTest extends \Tests\TestCase
{
    private function makeContent(array $insights, string $caption = 'Test caption with a few words #demo #reels #trending'): Content
    {
        $c = new Content();
        $c->insights = $insights;
        $c->caption = $caption;
        $c->posted_at = now();

        return $c;
    }

    private function reelSet(int $n): \Illuminate\Support\Collection
    {
        $out = [];
        for ($i = 0; $i < $n; $i++) {
            $out[] = $this->makeContent([
                'plays' => 10000 + $i * 500,
                'reach' => 8000,
                'likes' => 400,
                'comments' => 30,
                'saved' => 150,
                'shares' => 80,
                'watch_percent_avg' => 55 + $i,
                'follower_gains' => 40,
            ]);
        }

        return collect($out);
    }

    public function test_produces_complete_result_structure(): void
    {
        $result = ContentAnalyzer::analyze($this->reelSet(8), ['reels_count' => 8]);

        $this->assertArrayHasKey('problems', $result);
        $this->assertArrayHasKey('strengths', $result);
        $this->assertArrayHasKey('evidence', $result);
        $this->assertArrayHasKey('recommendations', $result);
        $this->assertArrayHasKey('top_problem_keys', $result);
        $this->assertArrayHasKey('content_health', $result);
        $this->assertArrayHasKey('patterns', $result);

        $this->assertGreaterThanOrEqual(0, $result['content_health']);
        $this->assertLessThanOrEqual(100, $result['content_health']);
        $this->assertLessThanOrEqual(3, count($result['top_problem_keys']));
        $this->assertGreaterThanOrEqual(1, count($result['top_problem_keys']));
    }

    public function test_weak_watch_time_flags_hook_problem(): void
    {
        $reels = collect(range(1, 6))->map(fn ($i) => $this->makeContent([
            'plays' => 5000, 'likes' => 100, 'comments' => 2,
            'saved' => 5, 'shares' => 3, 'watch_percent_avg' => 20, 'follower_gains' => 2,
        ]));

        $result = ContentAnalyzer::analyze($reels, ['reels_count' => 6]);
        $keys = array_column($result['problems'], 'key');

        $this->assertContains('weak_hook', $keys);
    }

    public function test_no_numeric_scores_in_qualitative_labels(): void
    {
        $result = ContentAnalyzer::analyze($this->reelSet(6), ['reels_count' => 6]);

        foreach ($result['problems'] as $p) {
            $this->assertArrayNotHasKey('score', $p);
            $this->assertContains($p['severity'], ['critical', 'needswork', 'average', 'good']);
        }
    }

    public function test_patterns_carry_evidence(): void
    {
        $result = ContentAnalyzer::analyze($this->reelSet(10), ['reels_count' => 10]);

        foreach ($result['patterns'] as $p) {
            $this->assertNotNull($p['evidence']);
            $this->assertContains($p['confidence'], ['low', 'moderate', 'high']);
        }
    }
}
