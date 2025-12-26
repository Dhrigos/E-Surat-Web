<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone_number' => 'required|string',
        ]);

        $otp = rand(100000, 999999);
        $email = $request->email;
        $phone = $request->phone_number;

        // Store OTP in cache for 5 minutes
        // We use the email as the key for simplicity, or a combination
        Cache::put('otp_' . $email, $otp, 300);

        // Log for debugging/SMS placeholder
        Log::info("OTP for {$email} / {$phone}: {$otp}");

        try {
            Mail::to($email)->send(new OtpMail($otp));

            // Kirim SMS (Jika ada provider)
            $this->sendSms($phone, $otp);

        } catch (\Exception $e) {
            Log::error("Failed to send OTP email: " . $e->getMessage());
            return response()->json(['message' => 'Gagal mengirim email OTP, namun OTP tercatat di log (dev mode).'], 500);
        }

        return response()->json(['message' => 'OTP sent successfully']);
    }

    /**
     * Verify the provided OTP and reset the user's password.
     * Expected payload: email, phone_number, otp, password, password_confirmation
     */
    public function verifyAndReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone_number' => 'required|string',
            'otp' => 'required|string',
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $email = $request->email;
        $phone = $request->phone_number;
        $otp = $request->otp;

        $cachedOtp = Cache::get('otp_' . $email);

        if (! $cachedOtp || $cachedOtp != $otp) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'], 422);
        }

        $user = User::where('email', $email)->where('phone_number', $phone)->first();

        if (! $user) {
            return response()->json(['message' => 'User tidak ditemukan atau nomor telepon tidak cocok.'], 404);
        }

        // Update the user's password
        $user->password = Hash::make($request->password);
        $user->save();

        // Clear the OTP from cache
        Cache::forget('otp_' . $email);

        return response()->json(['message' => 'Password berhasil diubah']);
    }

    /**
     * Placeholder untuk mengirim SMS.
     * Anda perlu mendaftar ke penyedia SMS Gateway (contoh: Twilio, Zenziva, Wablas, dll)
     */
    private function sendSms($phoneNumber, $otp)
    {
        // Contoh implementasi generik menggunakan Http Client Laravel
        // Silakan sesuaikan dengan dokumentasi API provider Anda.

        /*
        try {
            \Illuminate\Support\Facades\Http::post('https://api.provider-sms.com/send', [
                'api_key' => env('SMS_API_KEY'),
                'phone' => $phoneNumber,
                'message' => "Kode OTP Anda adalah: {$otp}",
            ]);
        } catch (\Exception $e) {
            Log::error("Gagal mengirim SMS: " . $e->getMessage());
        }
        */

        // Untuk saat ini, kita hanya log saja
        Log::info("SMS dikirim ke {$phoneNumber}: Kode OTP Anda adalah {$otp}");
    }
}
