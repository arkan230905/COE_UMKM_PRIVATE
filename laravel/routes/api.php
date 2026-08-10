<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\UmkmPresetController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your UMKM application.
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// Health Check Endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Sistem UMKM backend Laravel 11 online',
        'timestamp' => now()
    ]);
});

// Public API Routes (No Auth Required for Development)
// Note: Add auth middleware in production

// UMKM Presets Management
Route::apiResource('umkm-presets', UmkmPresetController::class);
Route::get('umkm-presets/code/{code}', [UmkmPresetController::class, 'getByCode']);

// Core Admin Resources
Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('expenses', ExpenseController::class);
Route::apiResource('customers', CustomerController::class);

// Transaction Operations
Route::apiResource('transactions', TransactionController::class);
Route::put('transactions/{id}/status', [TransactionController::class, 'updateStatus']);

// Financial Reports API
Route::get('financial-reports', [FinancialReportController::class, 'index']);
Route::get('dashboard-stats', [FinancialReportController::class, 'dashboard']);
