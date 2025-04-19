/**
 * MongoDB Index Optimizer for large datasets (up to 700,000 products)
 * This module creates and manages indexes for optimal query performance with large datasets
 */

import { mongoDBService } from './services/mongodb-service';

/**
 * Optimizes MongoDB collections for performance with large datasets
 */
export async function optimizeDatabaseForLargeDatasets() {
  try {
    if (!mongoDBService.isConnectedToDb()) {
      console.log('MongoDB not connected, skipping optimization');
      return false;
    }
    
    console.log('Optimizing MongoDB for large datasets...');
    
    // Get the Product collection
    const productsCollection = mongoDBService.getCollection('products');
    if (!productsCollection) {
      console.log('Products collection not found, skipping optimization');
      return false;
    }
    
    // Create compound indexes for search performance
    await productsCollection.createIndex({ 
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
      productsCollection.createIndex({ categoryId: 1 }),
      
      // For price sorting and filtering
      productsCollection.createIndex({ price: 1 }),
      productsCollection.createIndex({ discountedPrice: 1 }),
      
      // For featured products
      productsCollection.createIndex({ isFeatured: 1 }),
      
      // For product name searches (prefix search)
      productsCollection.createIndex({ name: 1 }),
      
      // For medicine composition searches
      productsCollection.createIndex({ composition: 1 }),
      
      // For brand filtering
      productsCollection.createIndex({ brand: 1 }),
      
      // Compound index for category + price for category pages with sorting
      productsCollection.createIndex({ categoryId: 1, price: 1 }),
      
      // Compound index for inStock + categoryId for filtering in-stock items by category
      productsCollection.createIndex({ inStock: 1, categoryId: 1 })
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
 * @param collectionName Collection to analyze
 * @param query Query to analyze
 */
export async function analyzeQueryPerformance(collectionName: string, query: any) {
  try {
    if (!mongoDBService.isConnectedToDb()) {
      console.log('MongoDB not connected, skipping query analysis');
      return null;
    }
    
    const collection = mongoDBService.getCollection(collectionName);
    if (!collection) {
      console.log(`${collectionName} collection not found, skipping query analysis`);
      return null;
    }
    
    // Run explain plan
    const explainResult = await collection.find(query).explain('executionStats');
    
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