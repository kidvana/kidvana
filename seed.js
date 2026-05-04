require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
    // Kids Fashion - Based on existing JPEG assets
    {
        name: 'Classic Ethnic Wear Set',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 1299,
        mrp: 1999,
        image: 'assets/kids-fashion/K01.jpeg',
        images: ['assets/kids-fashion/K01.jpeg', 'assets/kids-fashion/K01.2.jpeg'],
        rating: 4.9,
        reviews: 156,
        tags: ['new', 'ethnic'],
        description: 'Premium quality ethnic wear for kids, perfect for special occasions.'
    },
    {
        name: 'Designer Kurta Set',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 899,
        mrp: 1499,
        image: 'assets/kids-fashion/K02.jpeg',
        images: ['assets/kids-fashion/K02.jpeg', 'assets/kids-fashion/K02.1.jpeg', 'assets/kids-fashion/K02.2.jpeg'],
        rating: 4.6,
        reviews: 92,
        tags: ['casual', 'trending'],
        description: 'Comfortable and stylish cotton kurta set for everyday use.'
    },
    {
        name: 'Festive Party Dress',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 1599,
        mrp: 2499,
        image: 'assets/kids-fashion/K03.jpeg',
        images: ['assets/kids-fashion/K03.jpeg', 'assets/kids-fashion/K03.1.jpeg'],
        rating: 4.8,
        reviews: 110,
        tags: ['party', 'elegant'],
        description: 'Beautiful party dress with soft inner lining for comfort.'
    },
    {
        name: 'Toddler Playwear Set',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 499,
        mrp: 999,
        image: 'assets/kids-fashion/K04.jpeg',
        images: ['assets/kids-fashion/K04.jpeg', 'assets/kids-fashion/K04.1.jpeg', 'assets/kids-fashion/K04.2.jpeg'],
        rating: 4.5,
        reviews: 240,
        tags: ['daily', 'soft'],
        description: 'Soft cotton playwear set for toddlers.'
    },
    {
        name: 'Traditional Sherwani',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 1899,
        mrp: 3499,
        image: 'assets/kids-fashion/K05.jpeg',
        images: ['assets/kids-fashion/K05.jpeg', 'assets/kids-fashion/K05.1.jpeg'],
        rating: 4.9,
        reviews: 74,
        tags: ['royal', 'premium'],
        description: 'Traditional sherwani set for a royal festive look.'
    },
    {
        name: 'Casual Western Set',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 799,
        mrp: 1299,
        image: 'assets/kids-fashion/K06.jpeg',
        images: ['assets/kids-fashion/K06.jpeg', 'assets/kids-fashion/K06.2.jpeg', 'assets/kids-fashion/K06.3.jpeg'],
        rating: 4.7,
        reviews: 45,
        tags: ['casual', 'new'],
        description: 'Modern western wear set for kids.'
    },
    {
        name: 'Floral Print Dress',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 699,
        mrp: 1199,
        image: 'assets/kids-fashion/K07.jpeg',
        images: ['assets/kids-fashion/K07.jpeg', 'assets/kids-fashion/K07.2.jpeg', 'assets/kids-fashion/K07.3.jpeg', 'assets/kids-fashion/K07.4.jpeg'],
        rating: 4.6,
        reviews: 38,
        tags: ['summer', 'floral'],
        description: 'Lightweight floral print dress for summer comfort.'
    },
    {
        name: 'Baby Boy Festive Suit',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 1399,
        mrp: 2199,
        image: 'assets/kids-fashion/K08.jpeg',
        images: ['assets/kids-fashion/K08.jpeg', 'assets/kids-fashion/K08.1.jpeg', 'assets/kids-fashion/K08.2.jpeg'],
        rating: 4.8,
        reviews: 52,
        tags: ['festive', 'suit'],
        description: 'Smart festive suit for baby boys.'
    },
    {
        name: 'Premium Cotton Kurta',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 999,
        mrp: 1799,
        image: 'assets/kids-fashion/K09.jpeg',
        images: ['assets/kids-fashion/K09.jpeg', 'assets/kids-fashion/K09.2.jpeg', 'assets/kids-fashion/K09.3.jpeg', 'assets/kids-fashion/K09.4.jpeg'],
        rating: 4.7,
        reviews: 63,
        description: 'High-quality cotton kurta for all-day comfort.'
    },
    {
        name: 'Embroidered Party Wear',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 1699,
        mrp: 2999,
        image: 'assets/kids-fashion/K10.jpeg',
        images: ['assets/kids-fashion/K10.jpeg', 'assets/kids-fashion/K10.1.jpeg', 'assets/kids-fashion/K10.2.jpeg'],
        rating: 4.9,
        reviews: 29,
        description: 'Beautifully embroidered party wear for special occasions.'
    },
    {
        name: 'Summer Shorts Set',
        brand: 'Kidvana',
        category: 'baby-kids',
        price: 599,
        mrp: 999,
        image: 'assets/kids-fashion/K11.jpeg',
        images: ['assets/kids-fashion/K11.jpeg', 'assets/kids-fashion/K11.1.jpeg', 'assets/kids-fashion/K11.2.jpeg'],
        rating: 4.5,
        reviews: 87,
        tags: ['summer', 'play'],
        description: 'Cool summer shorts set for active kids.'
    },
    // Toys & Games
    {
        name: 'Interactive Learning Toy',
        brand: 'Kidvana',
        category: 'toys',
        price: 349,
        mrp: 699,
        image: 'assets/toys/T 01.jpg',
        images: ['assets/toys/T 01.jpg'],
        rating: 4.7,
        reviews: 312,
        description: 'Engaging toy designed to improve sensory development.'
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Product.deleteMany();
        console.log('Existing products cleared');

        await Product.insertMany(products);
        console.log('Products seeded successfully');

        process.exit();
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
}

seedProducts();
