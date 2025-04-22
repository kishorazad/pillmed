/**
 * Admin routes for managing email events and suppression list
 */
import { Router, Request, Response } from 'express';
import { mongoDBService } from './services/mongodb-service';

const router = Router();

/**
 * Check if the user is authenticated as admin
 */
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // @ts-ignore - user.role exists on the user object
  if (req.user && (req.user.role === 'admin' || req.user.role === 'subadmin')) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden' });
}

/**
 * Get all email events with pagination
 */
router.get('/events', isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const email = req.query.email as string;
    
    const collection = mongoDBService.getCollection('email_events');
    
    if (!collection) {
      return res.status(500).json({ error: 'Email events collection not available' });
    }
    
    // Build the query based on filters
    const query: any = {};
    if (type) {
      query.type = type;
    }
    if (email) {
      query['data.to'] = { $regex: email, $options: 'i' };
    }
    
    // Count total results for pagination
    const total = await collection.countDocuments(query);
    
    // Get events with pagination and sorting
    const events = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    res.json({
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching email events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get suppression list with pagination
 */
router.get('/suppression-list', isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const email = req.query.email as string;
    const reason = req.query.reason as string;
    const active = req.query.active === 'true';
    
    const collection = mongoDBService.getCollection('email_suppression_list');
    
    if (!collection) {
      return res.status(500).json({ error: 'Suppression list collection not available' });
    }
    
    // Build the query based on filters
    const query: any = {};
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    if (reason) {
      query.reason = { $regex: reason, $options: 'i' };
    }
    if (req.query.active !== undefined) {
      query.active = active;
    }
    
    // Count total results for pagination
    const total = await collection.countDocuments(query);
    
    // Get suppression list with pagination and sorting
    const suppressionList = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    res.json({
      suppressionList,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching suppression list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Add an email to the suppression list
 */
router.post('/suppression-list', isAdmin, async (req: Request, res: Response) => {
  try {
    const { email, reason } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const collection = mongoDBService.getCollection('email_suppression_list');
    
    if (!collection) {
      return res.status(500).json({ error: 'Suppression list collection not available' });
    }
    
    // Check if email already exists in the list
    const existing = await collection.findOne({ email });
    
    if (existing) {
      // Update existing entry
      await collection.updateOne(
        { email },
        { $set: { 
          reason: reason || 'manually added',
          timestamp: new Date(),
          active: true
        }}
      );
      
      res.json({ success: true, message: 'Email updated in suppression list' });
    } else {
      // Create new entry
      await collection.insertOne({
        email,
        reason: reason || 'manually added',
        timestamp: new Date(),
        active: true
      });
      
      res.status(201).json({ success: true, message: 'Email added to suppression list' });
    }
  } catch (error) {
    console.error('Error adding email to suppression list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update an email in the suppression list
 */
router.put('/suppression-list/:email', isAdmin, async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const { reason, active } = req.body;
    
    const collection = mongoDBService.getCollection('email_suppression_list');
    
    if (!collection) {
      return res.status(500).json({ error: 'Suppression list collection not available' });
    }
    
    // Check if email exists in the list
    const existing = await collection.findOne({ email });
    
    if (!existing) {
      return res.status(404).json({ error: 'Email not found in suppression list' });
    }
    
    // Update entry
    const updateData: any = { timestamp: new Date() };
    if (reason !== undefined) updateData.reason = reason;
    if (active !== undefined) updateData.active = active;
    
    await collection.updateOne(
      { email },
      { $set: updateData }
    );
    
    res.json({ success: true, message: 'Suppression list entry updated' });
  } catch (error) {
    console.error('Error updating suppression list entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Remove an email from the suppression list
 */
router.delete('/suppression-list/:email', isAdmin, async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    
    const collection = mongoDBService.getCollection('email_suppression_list');
    
    if (!collection) {
      return res.status(500).json({ error: 'Suppression list collection not available' });
    }
    
    // Delete the entry
    const result = await collection.deleteOne({ email });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Email not found in suppression list' });
    }
    
    res.json({ success: true, message: 'Email removed from suppression list' });
  } catch (error) {
    console.error('Error removing email from suppression list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get email event stats (count by type, daily stats, etc.)
 */
router.get('/email-stats', isAdmin, async (req: Request, res: Response) => {
  try {
    const eventsCollection = mongoDBService.getCollection('email_events');
    
    if (!eventsCollection) {
      return res.status(500).json({ error: 'Email events collection not available' });
    }
    
    // Count events by type
    const eventsByType = await eventsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Get daily stats for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await eventsCollection.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]).toArray();
    
    // Format the daily stats for easier consumption
    const formattedDailyStats: Record<string, Record<string, number>> = {};
    
    dailyStats.forEach(stat => {
      const date = stat._id.date;
      const type = stat._id.type;
      const count = stat.count;
      
      if (!formattedDailyStats[date]) {
        formattedDailyStats[date] = {};
      }
      
      formattedDailyStats[date][type] = count;
    });
    
    // Get suppression list stats
    const suppressionCollection = mongoDBService.getCollection('email_suppression_list');
    const suppressionCount = await suppressionCollection.countDocuments();
    const activeSuppressionCount = await suppressionCollection.countDocuments({ active: true });
    
    res.json({
      eventsByType,
      dailyStats: formattedDailyStats,
      suppression: {
        total: suppressionCount,
        active: activeSuppressionCount
      }
    });
  } catch (error) {
    console.error('Error getting email stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;