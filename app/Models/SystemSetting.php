<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
    ];

    /**
     * Get the value cast to the appropriate type.
     */
    public function getCastValueAttribute()
    {
        $value = $this->value;

        switch ($this->type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return intval($value);
            case 'json':
                return json_decode($value, true);
            case 'datetime':
                return $value; // Carbon handling could be added
            default:
                return $value;
        }
    }

    /**
     * Set a system setting value (update if exists, create if not).
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $type
     * @return SystemSetting
     */
    public static function set(string $key, $value, ?string $type = null): self
    {
        // Auto-detect type if not provided
        if ($type === null) {
            if (is_bool($value)) {
                $type = 'boolean';
                $value = $value ? '1' : '0';
            } elseif (is_int($value)) {
                $type = 'integer';
            } elseif (is_array($value)) {
                $type = 'json';
                $value = json_encode($value);
            } elseif (preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
                $type = 'datetime';
            } else {
                $type = 'string';
            }
        }

        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : $value,
                'type' => $type,
            ]
        );
    }

    /**
     * Get a system setting value.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return $setting->cast_value ?? $setting->value;
    }

    /**
     * Check if a setting exists.
     *
     * @param string $key
     * @return bool
     */
    public static function has(string $key): bool
    {
        return self::where('key', $key)->exists();
    }

    /**
     * Delete a setting.
     *
     * @param string $key
     * @return bool
     */
    public static function forget(string $key): bool
    {
        return self::where('key', $key)->delete() > 0;
    }
}
