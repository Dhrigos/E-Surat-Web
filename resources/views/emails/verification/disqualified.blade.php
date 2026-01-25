<x-mail::message>
# Halo {{ $user->name }},

Mohon maaf, kami memberitahukan bahwa data pendaftaran Anda **TIDAK LULUS** verifikasi awal.

**Alasan Tidak Lulus:**
<x-mail::panel>
{{ $reason }}
</x-mail::panel>

Karena status ini, seluruh data pendaftaran dan akun Anda telah dihapus secara permanen dari sistem kami demi keamanan dan privasi.

Jika Anda merasa ini adalah kesalahan atau ingin memperbaiki data, Anda dipersilakan untuk melakukan **Registrasi Ulang** dari awal dengan data yang benar.

<x-mail::button :url="route('register.store')">
Daftar Ulang
</x-mail::button>

Terima kasih,<br>
Tim Seleksi Komponen Cadangan
</x-mail::message>
