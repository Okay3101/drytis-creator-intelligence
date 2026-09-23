<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    private function transform(SupportMessage $m): array
    {
        return [
            'id' => $m->id,
            'sender_type' => $m->is_admin ? 'admin' : 'user',
            'message' => $m->body,
            'created_at' => $m->created_at?->toIso8601String(),
        ];
    }

    public function myConversation(Request $r)
    {
        $conv = SupportConversation::firstOrCreate(
            ['user_id' => $r->user()->id],
            ['status' => 'open']
        );
        $messages = SupportMessage::where('conversation_id', $conv->id)
            ->orderBy('created_at')->get()->map(fn ($m) => $this->transform($m));

        return response()->json(['conversation' => $conv, 'messages' => $messages]);
    }

    public function sendMessage(Request $r)
    {
        $data = $r->validate(['message' => 'required|string|max:4000']);
        $conv = SupportConversation::firstOrCreate(
            ['user_id' => $r->user()->id],
            ['status' => 'open']
        );
        $msg = SupportMessage::create([
            'conversation_id' => $conv->id,
            'sender_id' => $r->user()->id,
            'is_admin' => false,
            'body' => $data['message'],
        ]);
        $conv->update(['status' => 'pending']);

        return response()->json(['message' => 'Message bhej diya.', 'data' => $this->transform($msg)], 201);
    }

    // ---- Admin side ----

    public function adminConversations(Request $r)
    {
        $convs = SupportConversation::query()
            ->with('user:id,name,email')
            ->orderByRaw("FIELD(status, 'pending', 'open', 'closed')")
            ->orderByDesc('updated_at')
            ->limit(100)->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'status' => $c->status,
                'last_message_at' => $c->updated_at?->toIso8601String(),
                'user' => $c->user?->only('id', 'name', 'email'),
            ]);

        return response()->json(['data' => $convs]);
    }

    public function adminConversation(Request $r, string $id)
    {
        $conv = SupportConversation::with('user:id,name,email')->findOrFail($id);
        $messages = SupportMessage::where('conversation_id', $conv->id)
            ->orderBy('created_at')->get()->map(fn ($m) => $this->transform($m));

        return response()->json([
            'conversation' => [
                'id' => $conv->id,
                'status' => $conv->status,
                'user' => $conv->user?->only('id', 'name', 'email'),
            ],
            'messages' => $messages,
        ]);
    }

    public function adminReply(Request $r, string $id)
    {
        $data = $r->validate(['message' => 'required|string|max:4000']);
        $conv = SupportConversation::findOrFail($id);
        $msg = SupportMessage::create([
            'conversation_id' => $conv->id,
            'sender_id' => $r->user()->id,
            'is_admin' => true,
            'body' => $data['message'],
        ]);
        $conv->update(['status' => 'open']);

        return response()->json(['message' => 'Reply sent.', 'data' => $this->transform($msg)], 201);
    }

    public function adminCloseConversation(Request $r, string $id)
    {
        $conv = SupportConversation::findOrFail($id);
        $conv->update(['status' => 'closed']);

        return response()->json(['message' => 'Conversation closed.']);
    }
}
