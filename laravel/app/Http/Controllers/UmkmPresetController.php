<?php

namespace App\Http\Controllers;

use App\Models\UmkmPreset;
use Illuminate\Http\Request;

class UmkmPresetController extends Controller
{
    /**
     * Display a listing of all UMKM presets.
     */
    public function index()
    {
        $presets = UmkmPreset::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $presets
        ]);
    }

    /**
     * Store a newly created UMKM preset.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'umkm_code' => 'required|string|unique:umkm_presets,umkm_code',
            'business_name' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'logo_text' => 'nullable|string|max:10',
            'primary_color' => 'nullable|string|max:7',
            'accent_color' => 'nullable|string|max:7',
            'currency' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:umkm_presets,admin_email',
            'is_active' => 'boolean',
        ]);

        $preset = UmkmPreset::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'UMKM berhasil didaftarkan',
            'data' => $preset
        ], 201);
    }

    /**
     * Display the specified UMKM preset.
     */
    public function show($id)
    {
        $preset = UmkmPreset::with([
            'categories',
            'products',
            'customers',
            'transactions',
            'expenses',
            'incomeRecords'
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $preset
        ]);
    }

    /**
     * Get UMKM by code.
     */
    public function getByCode($code)
    {
        $preset = UmkmPreset::where('umkm_code', $code)->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $preset
        ]);
    }

    /**
     * Update the specified UMKM preset.
     */
    public function update(Request $request, $id)
    {
        $preset = UmkmPreset::findOrFail($id);

        $validated = $request->validate([
            'umkm_code' => 'sometimes|string|unique:umkm_presets,umkm_code,' . $id,
            'business_name' => 'sometimes|string|max:255',
            'industry' => 'sometimes|string|max:255',
            'logo_text' => 'nullable|string|max:10',
            'primary_color' => 'nullable|string|max:7',
            'accent_color' => 'nullable|string|max:7',
            'currency' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'admin_name' => 'sometimes|string|max:255',
            'admin_email' => 'sometimes|email|unique:umkm_presets,admin_email,' . $id,
            'is_active' => 'boolean',
        ]);

        $preset->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Data UMKM berhasil diperbarui',
            'data' => $preset
        ]);
    }

    /**
     * Remove the specified UMKM preset.
     */
    public function destroy($id)
    {
        $preset = UmkmPreset::findOrFail($id);
        $preset->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'UMKM berhasil dihapus'
        ]);
    }
}
