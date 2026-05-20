<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\TransactionController;

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

// Auth Routes (Implicitly handled by Laravel Breeze / Sanctum)
Route::group(['middleware' => ['auth:sanctum']], function () {
    
    // Core Admin Resources
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('expenses', ExpenseController::class);
    
    // Transaction Operations
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::post('transactions', [TransactionController::class, 'store']);
    Route::put('transactions/{id}/status', [TransactionController::class, 'updateStatus']);
    
    // Financial Reports API
    Route::get('financial-reports', function() {
        // Sample controller hook
        return response()->json([
            'total_income' => \App\Models\IncomeRecord::sum('amount'),
            'total_expense' => \App\Models\Expense::sum('amount'),
            'net_profit' => \App\Models\IncomeRecord::sum('amount') - \App\Models\Expense::sum('amount')
        ]);
    });
});
