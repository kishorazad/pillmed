import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { storage } from './storage';

// This function parses the CSV file and adds the medicines to the storage
export async function importMedicinesFromCSV() {
  try {
    console.log("Starting CSV import process...");
    
    // Check how many products we already have
    const existingProducts = await storage.getProducts();
    if (existingProducts.length > 6) {
      console.log(`Already have ${existingProducts.length} products in database. Skipping import.`);
      return;
    }
    
    // Get all categories first
    const categories = await storage.getCategories();
    const categoryMap = new Map();
    
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });
    
    // Create categories if needed
    if (categories.length === 0) {
      console.log("Creating medicine categories...");
      const categoryDefinitions = [
        { name: 'Pregnancy & Maternal Care', description: 'Medications for expecting mothers and maternal health', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae' },
        { name: 'Antibiotics & Infections', description: 'Medications treating bacterial and other infections', imageUrl: 'https://images.unsplash.com/photo-1576671234524-ed58c95eab38' },
        { name: 'Pain & Fever', description: 'Relief medications for pain, inflammation and fever', imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8' },
        { name: 'Diabetes & Metabolic', description: 'Medications for diabetes and metabolic conditions', imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2' },
        { name: 'Mental Health', description: 'Medications for anxiety, depression and other mental health conditions', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
        { name: 'Skin Care', description: 'Topical medications for skin conditions and infections', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e' },
      ];
      
      for (const catDef of categoryDefinitions) {
        const newCategory = await storage.createCategory(catDef);
        categoryMap.set(newCategory.name, newCategory.id);
      }
    }
    
    const results: any[] = [];
    const csvFilePath = path.join(process.cwd(), 'attached_assets', '[March 25 Updated] Medicines and OTC samples - Medicines.csv');
    
    console.log('Reading CSV from:', csvFilePath);
    
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found at ${csvFilePath}`);
      return;
    }
    
    // Read the CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`CSV parsing complete. Found ${results.length} medicines.`);
          
          try {
            // First 50 products only to avoid overwhelming the system
            const medicineData = results.slice(0, 50).map(item => {
              // Determine category based on primary use or medicine type
              let categoryId;
              const primaryUse = item.primary_use || '';
              const saltComposition = item.salt_composition || '';
              
              // Default category mapping logic
              if (primaryUse.toLowerCase().includes('pregnancy')) {
                categoryId = categoryMap.get('Pregnancy & Maternal Care');
              } else if (saltComposition.toLowerCase().includes('amox') || 
                         saltComposition.toLowerCase().includes('clav') ||
                         saltComposition.toLowerCase().includes('cefixime')) {
                categoryId = categoryMap.get('Antibiotics & Infections');
              } else if (primaryUse.toLowerCase().includes('pain') || 
                         primaryUse.toLowerCase().includes('fever') ||
                         primaryUse.toLowerCase().includes('relief')) {
                categoryId = categoryMap.get('Pain & Fever');
              } else if (primaryUse.toLowerCase().includes('diabetes') || 
                         primaryUse.toLowerCase().includes('sugar') ||
                         primaryUse.toLowerCase().includes('metabolic')) {
                categoryId = categoryMap.get('Diabetes & Metabolic');
              } else if (primaryUse.toLowerCase().includes('anxiety') || 
                         primaryUse.toLowerCase().includes('depression') ||
                         primaryUse.toLowerCase().includes('mental')) {
                categoryId = categoryMap.get('Mental Health');
              } else if (primaryUse.toLowerCase().includes('skin') || 
                         primaryUse.toLowerCase().includes('acne') ||
                         primaryUse.toLowerCase().includes('rash')) {
                categoryId = categoryMap.get('Skin Care');
              } else {
                // If we can't determine a category, assign to Pain & Fever as default
                categoryId = categoryMap.get('Pain & Fever');
              }
              
              // Calculate discounted price (10-20% off)
              const price = Number(item.mrp) || Math.floor(Math.random() * 500) + 100;
              const discountPercent = Math.floor(Math.random() * 10) + 10;
              const discountedPrice = Math.floor(price * (1 - discountPercent / 100));
              
              // Format medication name
              const productName = item.Product_Name || item.Product_ID || 'Medicine ' + (Math.random() * 1000).toFixed(0);
              
              // Create description from salt composition and introduction
              const descriptionParts = [];
              if (saltComposition) descriptionParts.push(saltComposition);
              if (item.introduction) {
                const intro = item.introduction.substring(0, 200);
                descriptionParts.push(intro + (item.introduction.length > 200 ? '...' : ''));
              }
              
              const description = descriptionParts.join(' - ') || 'No description available';
              
              return {
                name: productName,
                description: description,
                price: price,
                discountedPrice: discountedPrice,
                imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',  // Default image
                categoryId: categoryId,
                brand: item.Marketer_Manufacturer || 'Generic',
                inStock: true,
                quantity: item.Package || item.Packaging_Detail || 'Strip of 10 Tablets',
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),  // Random rating between 3 and 5
                ratingCount: Math.floor(Math.random() * 300) + 50,  // Random rating count
                isFeatured: Math.random() > 0.7,  // About 30% of products are featured
              };
            });
            
            // Add medicines one by one to avoid overwhelming the system
            console.log(`Importing ${medicineData.length} medicine products...`);
            
            for (const medicine of medicineData) {
              try {
                await storage.createProduct(medicine);
              } catch (error) {
                console.error(`Error importing medicine ${medicine.name}:`, error);
              }
            }
            
            console.log("Medicine import from CSV completed successfully");
            resolve(true);
          } catch (error) {
            console.error("Error processing CSV data:", error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error("Error reading CSV:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error importing medicines from CSV:', error);
    throw error;
  }
}