<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    /**
     * Display the registration settings page.
     */
    public function registration()
    {
        $settings = SystemSetting::where('group', 'registration')->get()
            ->mapWithKeys(function ($item) {
                return [$item->key => $item->cast_value];
            });

        return Inertia::render('Settings/Registration', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|exists:system_settings,key',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($data['settings'] as $key => $value) {
            // Handle boolean specifically if it comes as boolean from frontend but stored as string 'true'/'false'
            // or just update directly if model handles casting.
            // For simplicity, we assume frontend sends the correct value format or we convert.
            
            $setting = SystemSetting::where('key', $key)->firstOrFail();

            if ($setting->type === 'boolean') {
                 $value = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false';
            }

            $setting->update(['value' => $value]);
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
