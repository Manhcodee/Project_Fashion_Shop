-- Tạo database mới
DROP DATABASE IF EXISTS fashion_shop;
CREATE DATABASE fashion_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fashion_shop;

-- Tạo bảng users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(15) NULL,
    address TEXT,
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    profile_picture VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    auth_provider ENUM('LOCAL', 'GOOGLE', 'FACEBOOK') DEFAULT 'LOCAL',
    access_token TEXT,
    refresh_token TEXT,
    token_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME,
    INDEX idx_email (email),
    INDEX idx_facebook_id (facebook_id),
    INDEX idx_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS products;

-- Tạo lại bảng với độ dài cột lớn hơn
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,  -- Tăng từ 255 lên 500
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    image VARCHAR(500),          -- Tăng từ 255 lên 500
    rating_rate DECIMAL(3, 2),
    rating_count INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Phần 1: 10 sản phẩm đầu tiên
INSERT INTO products (title, price, description, category, image, rating_rate, rating_count) 
VALUES 
("Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops", 109.95, "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday", "men's clothing", "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", 3.9, 120),
("Mens Casual Premium Slim Fit T-Shirts", 22.3, "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing.", "men's clothing", "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg", 4.1, 259),
("Mens Cotton Jacket", 55.99, "great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors.", "men's clothing", "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg", 4.7, 500),
("Mens Casual Slim Fit", 15.99, "The color could be slightly different between on the screen and in practice.", "men's clothing", "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg", 2.1, 430),
("John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet", 695, "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl.", "jewelery", "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg", 4.6, 400),
("Solid Gold Petite Micropave", 168, "Satisfaction Guaranteed. Return or exchange any order within 30 days.", "jewelery", "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg", 3.9, 70),
("White Gold Plated Princess", 9.99, "Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her.", "jewelery", "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg", 3, 400),
("Pierced Owl Rose Gold Plated Stainless Steel Double", 10.99, "Rose Gold Plated Double Flared Tunnel Plug Earrings.", "jewelery", "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg", 1.9, 100),
("WD 2TB Elements Portable External Hard Drive - USB 3.0", 64, "USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity.", "electronics", "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg", 3.3, 203),
("SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s", 109, "Easy upgrade for faster boot up, shutdown, application load and response.", "electronics", "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg", 2.9, 470);

-- Phần 2: 10 sản phẩm còn lại
INSERT INTO products (title, price, description, category, image, rating_rate, rating_count) 
VALUES 
("Silicon Power 256GB SSD 3D NAND A55 SLC Cache Performance Boost SATA III 2.5", 109, "3D NAND flash are applied to deliver high transfer speeds Remarkable transfer speeds that enable faster bootup and improved overall system performance.", "electronics", "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg", 4.8, 319),
("WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive", 114, "Expand your PS4 gaming experience, Play anywhere Fast and easy, setup Sleek design with high capacity, 3-year manufacturer's limited warranty", "electronics", "https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg", 4.8, 400),
("Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin", 599, "21.5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon free Sync technology.", "electronics", "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg", 2.9, 250),
("Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor", 999.99, "49 INCH SUPER ULTRAWIDE 32:9 CURVED GAMING MONITOR with dual 27 inch screen side by side QUANTUM DOT (QLED) TECHNOLOGY.", "electronics", "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg", 2.2, 140),
("BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats", 56.99, "Note:The Jackets is US standard size, Please choose size as your usual wear Material: 100% Polyester.", "women's clothing", "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg", 2.6, 235),
("Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket", 29.95, "100% POLYURETHANE(shell) 100% POLYESTER(lining) 75% POLYESTER 25% COTTON (SWEATER).", "women's clothing", "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg", 2.9, 340),
("Rain Jacket Women Windbreaker Striped Climbing Raincoats", 39.99, "Lightweight perfect for trip or casual wear.", "women's clothing", "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg", 3.8, 679),
("MBJ Women's Solid Short Sleeve Boat Neck V", 9.85, "95% RAYON 5% SPANDEX, Made in USA or Imported.", "women's clothing", "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg", 4.7, 130),
("Opna Women's Short Sleeve Moisture", 7.95, "100% Polyester, Machine wash, 100% cationic polyester interlock.", "women's clothing", "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg", 4.5, 146),
("DANVOUY Womens T Shirt Casual Cotton Short", 12.99, "95%Cotton,5%Spandex, Features: Casual, Short Sleeve, Letter Print,V-Neck,Fashion Tees.", "women's clothing", "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg", 3.6, 145);

