<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     * Can filter by umkm_preset_id if provided in query parameter.
     */
    public function index(Request $request)
    {
        $query = Customer::with('user');
        
        // Filter by umkm_preset_id if provided
        if ($request->has('umkm_preset_id')) {
            $query->where('umkm_preset_id', $request->input('umkm_preset_id'));
        }
        
        $customers = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $customers
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'umkm_preset_id' => 'required|integer|exists:umkm_presets,id', // Changed from umkmPresetId
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $customer = Customer::create($validated);
        $customer->load('user');

        return response()->json([
            'status' => 'success',
            'message' => 'Pelanggan berhasil ditambahkan',
            'data' => $customer
        ], 201);
    }

    /**
     * Display the specified customer.
     */
    public function show($id)
    {
        $customer = Customer::with('user')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $customer
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $customer->update($validated);
        $customer->load('user');

        return response()->json([
            'status' => 'success',
            'message' => 'Pelanggan berhasil diperbarui',
            'data' => $customer
        ]);
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pelanggan berhasil dihapus'
        ]);
    }
}
