import { read, utils } from 'xlsx';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import { InsertProduct } from '@shared/schema';

interface MedicineData {
  name: string;
  brand?: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  categoryId: number;
  inStock?: boolean;
  quantity: string;
  rating?: number | null;
  ratingCount?: number | null;
  isFeatured?: boolean;
  composition?: string | null;
  uses?: string | null;
  sideEffects?: string | null;
  contraindications?: string | null;
  manufacturer?: string | null;
  packSize?: string | null;
}

export async function importMedicinesFromExcel(): Promise<boolean> {
  try {
    console.log("Starting Excel import process...");
    
    // Check how many products we already have
    // For handling large datasets (10 lakh+ products) like PharmEasy, we'd use:
    // 1. Batch processing with pagination
    // 2. Database count vs full retrieval
    // 3. Incremental imports with change tracking
    const existingProducts = await storage.getProducts();
    if (existingProducts.length > 1000) {
      console.log(`Already have ${existingProducts.length} products in storage. Skipping import.`);
      return true;
    }
    
    const xlsxFilePath = path.join(process.cwd(), 'attached_assets', 'DB_1K samples (1).xlsx');
    
    console.log('Reading Excel from:', xlsxFilePath);
    
    // Check if file exists
    if (!fs.existsSync(xlsxFilePath)) {
      console.error(`Excel file not found at ${xlsxFilePath}`);
      return false;
    }
    
    // Read the Excel file
    const workbook = read(xlsxFilePath, { type: 'file' });
    
    // Loop through all sheets to find one with data
    let results: any[] = [];
    let worksheetFound = false;
    
    console.log(`Excel file has ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}`);
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = utils.sheet_to_json(worksheet);
      
      console.log(`Sheet ${sheetName} has ${sheetData.length} rows`);
      
      if (sheetData.length > 0) {
        results = sheetData;
        worksheetFound = true;
        console.log(`Using data from sheet: ${sheetName}`);
        break;
      }
    }
    
    if (!worksheetFound) {
      console.error('No sheet with data found in the Excel file');
      return false;
    }
    
    console.log(`Excel parsing complete. Found ${results.length} medicines.`);
    
    // Get all categories
    const categories = await storage.getCategories();
    const categoryMap = new Map<string, number>();
    
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });
    
    // Process more medicines for scaling like PharmEasy (which handles 10 lakh+ products)
    // In production, we would use:
    // 1. Batch processing (1000 products at a time)
    // 2. Parallel processing with worker threads
    // 3. Chunked database inserts with bulk operations
    // 4. Redis-based job queue for background processing
    const medicineData: MedicineData[] = (results as any[]).slice(0, 1000).map((item: any) => {
      // Debugging - log the keys of the first item to understand structure
      if (results.indexOf(item) === 0) {
        console.log('First item keys:', Object.keys(item));
        console.log('First item sample values:', JSON.stringify(item).substring(0, 500) + '...');
      }
      
      // Map Excel fields to our schema - handle various field naming conventions
      // Determine category based on primary use or medicine type
      let categoryId: number;
      
      // Extract potential fields with various casing
      const fieldKeys = Object.keys(item);
      const getPossibleValue = (possibleNames: string[]): string => {
        for (const name of possibleNames) {
          const matchingKey = fieldKeys.find(k => k.toLowerCase() === name.toLowerCase());
          if (matchingKey && item[matchingKey]) return item[matchingKey].toString();
        }
        return '';
      };
      
      const primaryUse = getPossibleValue(['primary_use', 'PRIMARY_USE', 'primaryUse', 'uses', 'USES']);
      const composition = getPossibleValue(['composition', 'COMPOSITION', 'salt_composition', 'SALT_COMPOSITION']);
      
      // Default category mapping logic (adjust field names as needed based on actual Excel structure)
      if (primaryUse.toString().toLowerCase().includes('pregnancy')) {
        categoryId = categoryMap.get('Pregnancy & Maternal Care') || 1;
      } else if (composition.toString().toLowerCase().includes('amox') || 
                composition.toString().toLowerCase().includes('clav') ||
                composition.toString().toLowerCase().includes('cefixime')) {
        categoryId = categoryMap.get('Antibiotics & Infections') || 2;
      } else if (primaryUse.toString().toLowerCase().includes('pain') || 
                primaryUse.toString().toLowerCase().includes('fever') ||
                primaryUse.toString().toLowerCase().includes('relief')) {
        categoryId = categoryMap.get('Pain & Fever') || 3;
      } else if (primaryUse.toString().toLowerCase().includes('diabetes') || 
                primaryUse.toString().toLowerCase().includes('sugar') ||
                primaryUse.toString().toLowerCase().includes('metabolic')) {
        categoryId = categoryMap.get('Diabetes & Metabolic') || 4;
      } else if (primaryUse.toString().toLowerCase().includes('anxiety') || 
                primaryUse.toString().toLowerCase().includes('depression') ||
                primaryUse.toString().toLowerCase().includes('mental')) {
        categoryId = categoryMap.get('Mental Health') || 5;
      } else if (primaryUse.toString().toLowerCase().includes('skin') || 
                primaryUse.toString().toLowerCase().includes('acne') ||
                primaryUse.toString().toLowerCase().includes('rash')) {
        categoryId = categoryMap.get('Skin Care') || 6;
      } else {
        // If we can't determine a category, assign to Pain & Fever as default
        categoryId = categoryMap.get('Pain & Fever') || 3;
      }
      
      // Calculate discounted price (10-20% off)
      const price = Number(item.mrp || item.MRP || item.price || Math.floor(Math.random() * 500) + 100);
      const discountPercent = Math.floor(Math.random() * 10) + 10;
      const discountedPrice = Math.floor(price * (1 - discountPercent / 100));
      
      // Format medication name
      const productName = item.PRODUCT_NAME || item.Product_Name || item.name || item.PRODUCT_ID || item.Product_ID || ('Medicine ' + Math.floor(Math.random() * 1000));
      
      // Create description from composition and introduction
      const intro = item.introduction || item.INTRODUCTION || '';
      const descriptionParts = [];
      if (composition) descriptionParts.push(composition);
      if (intro) {
        const introText = intro.toString().substring(0, 200);
        descriptionParts.push(introText + (intro.toString().length > 200 ? '...' : ''));
      }
      
      const description = descriptionParts.join(' - ') || 'No description available';
      
      // Map quantity and packaging info
      const packSize = item.PACKAGE || item.Package || item.PACKAGING_DETAIL || item.Packaging_Detail || '';
      
      return {
        name: productName.toString(),
        description: description,
        price: price,
        discountedPrice: discountedPrice,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',  // Default image
        categoryId: categoryId,
        brand: (item.MARKETER_MANUFACTURER || item.Marketer_Manufacturer || 'Generic').toString(),
        inStock: true,
        quantity: packSize.toString() || 'Strip of 10 Tablets',
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),  // Random rating between 3 and 5
        ratingCount: Math.floor(Math.random() * 300) + 50,  // Random rating count
        isFeatured: Math.random() > 0.7,  // About 30% of products are featured
        composition: composition.toString() || null,
        uses: (item.PRIMARY_USE || item.primary_use || '').toString() || null,
        manufacturer: (item.MARKETER_MANUFACTURER || item.Marketer_Manufacturer || '').toString() || null,
        packSize: packSize.toString() || null
      };
    });
    
    // Add medicines to storage
    console.log(`Importing ${medicineData.length} medicine products...`);
    
    for (const medicine of medicineData) {
      try {
        await storage.createProduct(medicine as InsertProduct);
        console.log(`Imported ${medicine.name}`);
      } catch (error) {
        console.error(`Error importing medicine ${medicine.name}:`, error);
      }
    }
    
    console.log("Medicine import from Excel completed successfully");
    return true;
  } catch (error) {
    console.error('Error importing medicines from Excel:', error);
    return false;
  }
}