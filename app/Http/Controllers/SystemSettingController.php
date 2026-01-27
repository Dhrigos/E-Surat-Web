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

        $golongans = \App\Models\Golongan::all();

        return Inertia::render('Settings/Registration', [
            'settings' => $settings,
            'golongans' => $golongans,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($data['settings'] as $key => $value) {
            $type = 'string';
            
            if (is_array($value)) {
                $type = 'json';
                $value = json_encode($value);
            } elseif (is_bool($value) || $value === 'true' || $value === 'false') {
                $type = 'boolean';
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false';
            } elseif (is_numeric($value)) {
                // If it looks like an integer, likely number. But string is safer for generic storage unless we need strict types.
                // Quotas are numbers.
                // Leave as string storage for numeric is usually fine unless we strictly want 'integer' type.
            }

            // Generate human-readable label from key
            $label = ucwords(str_replace('_', ' ', $key));

            SystemSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => $type,
                    'group' => 'registration',
                    'label' => $label,
                ]
            );
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
