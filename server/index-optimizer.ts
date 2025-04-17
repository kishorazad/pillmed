/**
 * MongoDB Index Optimizer for large datasets (up to 700,000 products)
 * This module creates and manages indexes for optimal query performance with large datasets
 */

import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

/**
 * Optimizes MongoDB collections for performance with large datasets
 * @param uri MongoDB connection URI
 */
export async function optimizeDatabaseForLargeDatasets() {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, skipping optimization');
      return false;
    }
    
    console.log('Optimizing MongoDB for large datasets...');
    
    // Get the Product model
    const Product = mongoose.connection.models.Product;
    if (!Product) {
      console.log('Product model not found, skipping optimization');
      return false;
    }
    
    // Create compound indexes for search performance
    await Product.collection.createIndex({ 
      name: "text", 
      description: "text", 
      brand: "text",
      composition: "text",
      manufacturer: "text" 
    }, {
      weights: {
        name: 10,         // Prioritize name matches
        composition: 5,    // Composition is second most important
        brand: 3,          // Brand is third
        description: 1,    // Description is least important
      },
      name: "product_search_text_index",
      default_language: "english"
    });
    
    // Create regular indexes for filters and sorting
    await Promise.all([
      // For category filters
      Product.collection.createIndex({ categoryId: 1 }),
      
      // For price sorting and filtering
      Product.collection.createIndex({ price: 1 }),
      Product.collection.createIndex({ discountedPrice: 1 }),
      
      // For featured products
      Product.collection.createIndex({ isFeatured: 1 }),
      
      // For product name searches (prefix search)
      Product.collection.createIndex({ name: 1 }),
      
      // For medicine composition searches
      Product.collection.createIndex({ composition: 1 }),
      
      // For brand filtering
      Product.collection.createIndex({ brand: 1 }),
      
      // Compound index for category + price for category pages with sorting
      Product.collection.createIndex({ categoryId: 1, price: 1 }),
      
      // Compound index for inStock + categoryId for filtering in-stock items by category
      Product.collection.createIndex({ inStock: 1, categoryId: 1 })
    ]);
    
    console.log('MongoDB optimized for large datasets');
    return true;
  } catch (error) {
    console.error('Failed to optimize MongoDB:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Runs explain plan on a query to understand performance
 * @param collection Collection to analyze
 * @param query Query to analyze
 */
export async function analyzeQueryPerformance(collection: string, query: any) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, skipping query analysis');
      return null;
    }
    
    const model = mongoose.connection.models[collection];
    if (!model) {
      console.log(`${collection} model not found, skipping query analysis`);
      return null;
    }
    
    // Run explain plan
    const explainResult = await model.collection.find(query).explain('executionStats');
    
    // Extract key performance metrics
    const executionStats = explainResult.executionStats;
    
    return {
      executionTimeMillis: executionStats.executionTimeMillis,
      totalDocsExamined: executionStats.totalDocsExamined,
      totalKeysExamined: executionStats.totalKeysExamined,
      indexesUsed: explainResult.queryPlanner.winningPlan.inputStage?.indexName || 'None'
    };
  } catch (error) {
    console.error('Failed to analyze query performance:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}