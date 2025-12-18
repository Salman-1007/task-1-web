const ejs = require('ejs');
const path = 'views/products.ejs';
const data = { products: [{ name: 'A', image: '/img.jpg', featured: false, stock: 1, description: 'desc', rating: 4.5, reviews: 10, price: 9.99, category: 'cat' }], categories: ['cat'], filters: { search: '', category: 'all', minPrice: '', maxPrice: '', }, totalProducts: 1, totalPages: 1, currentPage: 1, limit: 10 };
ejs.renderFile(path, data, { filename: path }, (err, str) => { if (err) { console.error(err);
        process.exit(1); } else { console.log('render ok'); } });