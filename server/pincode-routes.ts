import { Router, Request, Response } from 'express';
import { mongoDBService } from './services/mongodb-service';
import fetch from 'node-fetch';

const router = Router();

// Get pincode from coordinates using MongoDB data if available
router.get('/', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude parameters are required' 
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    // First attempt: Check if we have this location in our MongoDB pincode database
    // Using GeoJSON near query
    if (mongoDBService.isConnectedToDb()) {
      try {
        const pincodeCollection = mongoDBService.getCollection('pincodes');
        
        if (pincodeCollection) {
          // Check if the collection exists and has data
          const count = await pincodeCollection.countDocuments();
          
          if (count > 0) {
            // Perform a geospatial query to find the nearest pincode
            const nearestPincode = await pincodeCollection.findOne(
              {
                location: {
                  $near: {
                    $geometry: {
                      type: "Point",
                      coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000 // 10km in meters
                  }
                }
              }
            );
            
            if (nearestPincode) {
              return res.json({
                success: true,
                pincode: nearestPincode.pincode,
                city: nearestPincode.city,
                source: 'mongodb'
              });
            }
          }
        }
      } catch (error) {
        console.log('MongoDB pincode lookup failed, falling back to external API:', error);
        // Continue to fallback if MongoDB query fails
      }
    }

    // Second attempt: Use Google Maps Geocoding API (if configured)
    if (process.env.VITE_GOOGLE_MAPS_API_KEY) {
      try {
        const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          
          // Look for postal code in the results
          const postalCode = addressComponents.find((component: any) => 
            component.types.includes('postal_code')
          );
          
          if (postalCode) {
            // Optionally store this in MongoDB for future use
            return res.json({
              success: true,
              pincode: postalCode.long_name,
              city: data.results[0].formatted_address.split(',')[0],
              source: 'google'
            });
          }
        }
      } catch (error) {
        console.error('Google Maps Geocoding API error:', error);
        // Continue to next fallback
      }
    }

    // Third attempt: Use a free Geocoding API as a last resort
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PillNow/1.0' // Nominatim requires a user agent
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address && data.address.postcode) {
        return res.json({
          success: true,
          pincode: data.address.postcode,
          city: data.address.city || data.address.town || data.address.village || '',
          source: 'nominatim'
        });
      }
    } catch (error) {
      console.error('Nominatim API error:', error);
    }

    // If all attempts fail, return an error
    return res.status(404).json({ 
      success: false, 
      message: 'Could not determine pincode for the provided coordinates' 
    });
    
  } catch (error) {
    console.error('Error in pincode API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while determining pincode' 
    });
  }
});

export default router;