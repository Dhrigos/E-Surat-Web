<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\RegisterResponse;

class RegisterController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function store(Request $request, CreateNewUser $creator)
    {
        \Illuminate\Support\Facades\Log::info('RegisterController::store hit');
        $creator->create($request->all());

        return redirect()->route('login')->with('status', 'Registrasi berhasil! Silakan login.');
    }
}
