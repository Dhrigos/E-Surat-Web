<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LetterCommentController extends Controller
{
    public function store(Request $request, \App\Models\Letter $letter)
    {
        $request->validate([
            'comment' => 'required|string',
        ]);

        $letter->comments()->create([
            'user_id' => auth()->id(),
            'comment' => $request->comment,
        ]);

        return redirect()->back()->with('success', 'Comment added successfully.');
    }
}
