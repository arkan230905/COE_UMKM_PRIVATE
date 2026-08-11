<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     * Can filter by umkm_preset_id if provided in query parameter.
     */
    public function index(Request $request)
    {
        $query = Product::with('category');
        
        // Filter by umkm_preset_id if provided
        if ($request->has('umkm_preset_id')) {
            $query->where('umkm_preset_id', $request->input('umkm_preset_id'));
        }
        
        $products = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'umkm_preset_id' => 'required|exists:umkm_presets,id', // Validate UMKM ID (snake_case from frontend)
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'barcode' => 'nullable|string|max:50',
        ]);

        // Map validated data to database column names
        $data = [
            'umkm_preset_id' => $validated['umkm_preset_id'],
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'barcode' => $validated['barcode'] ?? null,
            'slug' => Str::slug($validated['name']) . '-' . time(),
        ];

        $product = Product::create($data);
        $product->load('category');

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil ditambahkan',
            'data' => $product
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'barcode' => 'nullable|string|max:50', // Add barcode validation
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . time();

        $product->update($validated);
        $product->load('category');

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil diperbarui',
            'data' => $product
        ]);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil dihapus'
        ]);
    }
}
