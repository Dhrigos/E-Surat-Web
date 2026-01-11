<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class RegionController extends Controller
{
    public function provinces()
    {
        return response()->json(Province::orderBy('name')->pluck('name', 'code'));
    }

    public function cities(Request $request)
    {
        return response()->json(City::where('province_code', $request->province_code)->pluck('name', 'code'));
    }

    public function districts(Request $request)
    {
        return response()->json(District::where('city_code', $request->city_code)->pluck('name', 'code'));
    }

    public function villages(Request $request)
    {
        return response()->json(Village::where('district_code', $request->district_code)->pluck('name', 'code'));
    }
}
