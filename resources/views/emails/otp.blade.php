<x-mail::message>
# Kode Verifikasi OTP

Gunakan kode berikut untuk menyelesaikan pendaftaran Anda:

<x-mail::panel>
# {{ $otp }}
</x-mail::panel>

Kode ini akan kadaluarsa dalam 5 menit.

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
