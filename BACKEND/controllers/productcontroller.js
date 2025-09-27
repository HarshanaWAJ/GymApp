const Product = require('../models/productModel');  // renamed for clarity

const multer = require('multer');
const upload = multer();

// Create a new product
exports.createProduct = [
  upload.single('img'), // 'img' is the name of the file field in form-data
  async (req, res) => {
    try {
      const productData = req.body;
      if (req.file) {
        productData.img = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      }

      const product = new Product(productData);
      await product.save();

      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
];

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().exec();

    const productsWithBase64 = products.map(product => {
      let imgSrc = null;
      if (product.img && product.img.data) {
        imgSrc = `data:${product.img.contentType};base64,${product.img.data.toString('base64')}`;
      }
      return {
        ...product.toObject(),
        img_src: imgSrc,
      };
    });

    res.json(productsWithBase64);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product by ID
exports.updateProduct = [
  upload.single('img'),
  async (req, res) => {
    try {
      console.log('req.body:', req.body);
      console.log('req.file:', req.file);

      const updateData = {
        name: req.body.name,
        price: parseFloat(req.body.price),
        description: req.body.description,
        category: req.body.category,
        qty: parseInt(req.body.qty, 10),
        expiry_date: req.body.expiry_date,
      };

      if (req.file) {
        updateData.img = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error('Error in updateProduct:', error);
      res.status(500).json({ message: 'Error updating product', error });
    }
  }
];

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total product count for dashboard
exports.getAllProductsCount = async (req, res) => {
  try {
    const allProductCount = await Product.countDocuments();
    res.status(200).json({ allProductCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Get product counts grouped by category
exports.getProductCountsByCategory = async (req, res) => {
  try {
    const counts = await Product.aggregate([
      {
        $group: {
          _id: "$category", // group by category field
          count: { $sum: 1 } // count each group
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({ counts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
