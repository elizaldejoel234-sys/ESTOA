const categories = ["Tecnología", "Hogar", "Cocina", "Deportes", "Oficina", "Accesorios"];
const images = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    "https://images.unsplash.com/photo-1526170315870-ef68a6f3dd39?w=500&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80"
];

const baseProducts = [
    { name: "Auriculares Wireless Pro", price: 199.99, desc: "Sonido de alta fidelidad con cancelación de ruido." },
    { name: "Reloj Inteligente Aura V2", price: 299.50, desc: "Monitor de salud avanzado y GPS integrado." },
    { name: "Cámara Instantánea Retro", price: 89.00, desc: "Captura momentos con estilo vintage." },
    { name: "Zapatillas Running Ultra", price: 120.00, desc: "Máximo confort para tus kilómetros diarios." },
    { name: "Lámpara de Escritorio LED", price: 45.99, desc: "Iluminación ajustable para tu oficina." },
    { name: "Cafetera Espresso Premium", price: 350.00, desc: "El mejor café en la comodidad de tu hogar." }
];

const products = [];

// Generamos 100 productos dinámicamente para asegurar variedad y cantidad
for (let i = 1; i <= 100; i++) {
    const base = baseProducts[i % baseProducts.length];
    const cat = categories[i % categories.length];
    const img = images[i % images.length];
    
    products.push({
        id: i,
        name: `${base.name} - Modelo ${i}`,
        price: base.price + (i * 0.5),
        category: cat,
        rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
        reviews: Math.floor(Math.random() * 2000),
        image: img,
        description: `${base.desc} Este es el producto número ${i} de nuestra colección exclusiva AURA.`
    });
}
