import express from 'express';
import protect from '../middleware/authMiddleware.js';
import Customer from '../models/customerModel.js';
import ServiceProvider from '../models/serviceProviderModel.js';
import ChatHistory from '../models/chatHistoryModel.js'

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Admin dashboard (protected)
// @access  Private
router.get('/dashboard', protect, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard' });
});


router.get('/stats', protect, async (req, res) => {
  try {
    // Get the total number of customers
    const customerCount = await Customer.countDocuments();

    // Get the total number of service providers
    const serviceProviderCount = await ServiceProvider.countDocuments();

    // Return the counts in the response
    res.status(200).json({
      totalCustomers: customerCount,
      totalServiceProviders: serviceProviderCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/customers', protect, async (req, res) => {

  let page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;

  const query = {}
  req.query.name && (query.name = new RegExp(req.query.name.trim(), 'i'));
  req.query.email && (query.email = new RegExp(req.query.email.trim(), 'i'))


  try {

    const totalCount = await Customer.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages) {
      page = totalPages;
    }

    const skip = (page - 1) * limit;

    if (totalCount === 0) {
      return res.status(200).json({ 
        customers: [],
        currentPage: 0,
        totalPages: 0,
        message: 'No more records available.'
      });
    }

    const customers = await Customer.find(query, 'name email')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      customers: customers,
      currentPage: page,
      totalPages: totalPages,
      message: 'Success'
  });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not retrieve customers list' });
  }
});

router.get('/customers/:id', protect, async (req, res) => {

  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: `Customer with id ${req.params.id} not found` });
    }

    res.status(200).json({
      customer: customer
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Could not retrieve customer details with id ${req.params.id}` });
  }

});


router.get('/service-providers', protect, async (req, res) => {

  let page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;

  const query = {}
  req.query.name && (query.name = new RegExp(req.query.name.trim(), 'i'));
  req.query.email && (query.email = new RegExp(req.query.email.trim(), 'i'))
  req.query.serviceType && (query.serviceType = new RegExp(req.query.serviceType.trim(), 'i'))


  try {
    
    const totalCount = await ServiceProvider.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages) {
      page = totalPages;
    }

    const skip = (page - 1) * limit;

    if (totalCount === 0) {
      return res.status(200).json({ 
        serviceProviders: [],
        currentPage: 0,
        totalPages: 0,
        message: 'No more records available.'
      });
    }

    const serviceProviders = await ServiceProvider.find(query, 'name email serviceType')
    .skip(skip)
    .limit(limit);

    res.status(200).json({
      serviceProviders: serviceProviders,
      currentPage: page,
      totalPages: totalPages,
      message: 'Success'
  });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not retrieve service providers list' });
  }
});

router.get('/service-providers/:id', protect, async (req, res) => {

  try {
    const serviceProvider = await ServiceProvider.findById(req.params.id);

    if (!serviceProvider) {
      return res.status(404).json({ message: `Service Provider with id ${req.params.id} not found` });
    }

    res.status(200).json({
      serviceProvider: serviceProvider
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Could not retrieve service provider details with id ${req.params.id}` });
  }

});


router.get('/chats', protect, async (req, res) => {

  let page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;

  const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    
  // Extract customer and serviceProvider queries
  const customerQuery = filter.customer || {};
  const serviceProviderQuery = filter.serviceProvider || {};
    

  try {
    
    const skip = (page - 1) * limit;

    const chats = await ChatHistory.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $lookup: {
          from: 'serviceproviders',
          localField: 'serviceProvider',
          foreignField: '_id',
          as: 'serviceProvider',
        },
      },
      { 
        $unwind: '$customer' 
      },  // Deconstructs customer array into single object
      { 
        $unwind: '$serviceProvider' 
      },  // Deconstructs serviceProvider array into single object
      {
        $match: {
          ...(customerQuery.name && { 'customer.name': new RegExp(customerQuery.name.trim(), 'i') }),
          ...(customerQuery.email && { 'customer.email': new RegExp(customerQuery.email.trim(), 'i') }),
          ...(serviceProviderQuery.name && { 'serviceProvider.name': new RegExp(serviceProviderQuery.name.trim(), 'i') }),
          ...(serviceProviderQuery.email && { 'serviceProvider.email': new RegExp(serviceProviderQuery.email.trim(), 'i') })
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          chats: [
            { $skip: skip },                 // Skip records for pagination
            { $limit: limit },               // Limit the number of records for pagination
            {
              $project: {
                customer: { name: 1, email: 1 },
                serviceProvider: { name: 1, email: 1 },
              },
            },
          ],
        },
      },
    ]);
    
  
    // Get the total count of chats
    const totalCount = chats[0].metadata[0]?.total || 0;
    
    // Calculate total pages based on limit
    const totalPages = Math.ceil(totalCount / limit);
    
    // Extract chats data
    const resultChats = chats[0].chats;
    
    
    if (resultChats.length === 0) {
      return res.status(200).json({ 
        chats: [],
        currentPage: 0,
        totalPages: totalPages,
        message: 'No more chats available.'
      });
    }

    res.status(200).json({
      chats: resultChats,
      currentPage: page,
      totalPages: totalPages,
      message: 'Success'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not retrieve chats' });
  }
});

router.get('/chats/:id', protect, async (req, res) => {

  try {
    const chat = await ChatHistory.findById(req.params.id)
    .populate('customer', 'name email')
    .populate('serviceProvider', 'name email');

    if (!chat) {
      return res.status(404).json({ message: `Chat with id ${req.params.id} not found` });
    }

    res.status(200).json({
      chat: chat
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Could not retrieve chat with id ${req.params.id}` });
  }

});


export default router;
