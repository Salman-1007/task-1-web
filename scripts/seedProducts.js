require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
        price: 129.99,
        category: 'Electronics',
        image: '/images/baba1.jpg',
        stock: 50,
        rating: 4.5,
        reviews: 234,
        featured: true
    },
    {
        name: 'Smart Watch Pro',
        description: 'Advanced smartwatch with fitness tracking, heart rate monitor, and smartphone connectivity. Water-resistant design.',
        price: 299.99,
        category: 'Electronics',
        image: '/images/becongress.png',
        stock: 30,
        rating: 4.7,
        reviews: 189,
        featured: true
    },
    {
        name: 'Designer Leather Jacket',
        description: 'Stylish genuine leather jacket with modern design. Perfect for casual and semi-formal occasions.',
        price: 249.99,
        category: 'Fashion',
        image: '/images/baba2.jpg',
        stock: 25,
        rating: 4.3,
        reviews: 156,
        featured: false
    },
    {
        name: 'Cotton T-Shirt Pack',
        description: 'Comfortable 100% cotton t-shirts in various colors. Soft fabric, perfect for everyday wear.',
        price: 29.99,
        category: 'Fashion',
        image: '/images/hc2.jpg',
        stock: 100,
        rating: 4.2,
        reviews: 312,
        featured: false
    },
    {
        name: 'Modern Coffee Table',
        description: 'Elegant wooden coffee table with glass top. Perfect centerpiece for your living room.',
        price: 399.99,
        category: 'Home & Living',
        image: '/images/hc3.jpg',
        stock: 15,
        rating: 4.6,
        reviews: 98,
        featured: true
    },
    {
        name: 'Memory Foam Mattress',
        description: 'Premium memory foam mattress for ultimate comfort and support. Available in multiple sizes.',
        price: 599.99,
        category: 'Home & Living',
        image: '/images/h4.jpg',
        stock: 20,
        rating: 4.8,
        reviews: 445,
        featured: true
    },
    {
        name: 'Skincare Essentials Set',
        description: 'Complete skincare routine with cleanser, toner, moisturizer, and serum. Suitable for all skin types.',
        price: 79.99,
        category: 'Health & Beauty',
        image: '/images/home_congress_post1-576x336.jpg',
        stock: 60,
        rating: 4.4,
        reviews: 278,
        featured: false
    },
    {
        name: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and fitness exercises.',
        price: 39.99,
        category: 'Sports & Gaming',
        image: '/images/buynow.jpeg',
        stock: 80,
        rating: 4.5,
        reviews: 567,
        featured: false
    },
    {
        name: 'Gaming Keyboard RGB',
        description: 'Mechanical gaming keyboard with RGB backlighting and customizable keys. Perfect for gamers.',
        price: 149.99,
        category: 'Sports & Gaming',
        image: '/images/pollinuk.png',
        stock: 40,
        rating: 4.6,
        reviews: 234,
        featured: true
    },
    {
        name: 'Best Seller Book Collection',
        description: 'Set of 5 bestselling novels from top authors. Perfect gift for book lovers.',
        price: 49.99,
        category: 'Books & Media',
        image: '/images/home_congress_book.jpg',
        stock: 35,
        rating: 4.7,
        reviews: 189,
        featured: false
    },
    {
        name: 'Organic Green Tea',
        description: 'Premium organic green tea leaves. Rich in antioxidants and natural flavor.',
        price: 19.99,
        category: 'Food & Beverages',
        image: '/images/comma.png',
        stock: 120,
        rating: 4.3,
        reviews: 456,
        featured: false
    },
    {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking. Long battery life and comfortable design.',
        price: 24.99,
        category: 'Electronics',
        image: '/images/home_congress_members.jpg',
        stock: 90,
        rating: 4.4,
        reviews: 678,
        featured: false
    },
    {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with cushioned sole and breathable mesh. Perfect for daily runs.',
        price: 89.99,
        category: 'Sports & Gaming',
        image: '/images/baba1.jpg',
        stock: 55,
        rating: 4.5,
        reviews: 345,
        featured: false
    },
    {
        name: 'Ceramic Dinner Set',
        description: 'Elegant ceramic dinner set for 6 people. Dishwasher safe and microwave safe.',
        price: 119.99,
        category: 'Home & Living',
        image: '/images/becongress.png',
        stock: 30,
        rating: 4.6,
        reviews: 234,
        featured: false
    },
    {
        name: 'Perfume Collection',
        description: 'Luxury perfume set with 3 different fragrances. Long-lasting scent for all occasions.',
        price: 69.99,
        category: 'Health & Beauty',
        image: '/images/baba2.jpg',
        stock: 45,
        rating: 4.4,
        reviews: 189,
        featured: false
    }
];

const seedProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert sample products
        const products = await Product.insertMany(sampleProducts);
        console.log(`Successfully seeded ${products.length} products`);

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();

