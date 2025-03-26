-- Đặt tất cả sản phẩm về FALSE
UPDATE products SET is_featured = FALSE, is_new = FALSE;

-- Cập nhật sản phẩm nổi bật (5 sản phẩm có rating cao nhất)
UPDATE products 
SET is_featured = TRUE 
WHERE id IN (
    SELECT * FROM (
        SELECT id
        FROM products
        ORDER BY rating_rate DESC
        LIMIT 5
    ) AS top_rated
);

-- Cập nhật sản phẩm mới (5 sản phẩm có id cao nhất)
UPDATE products 
SET is_new = TRUE 
WHERE id IN (
    SELECT * FROM (
        SELECT id
        FROM products
        ORDER BY id DESC
        LIMIT 5
    ) AS newest
);

-- Tạo index cho các cột mới
CREATE INDEX idx_featured ON products(is_featured);
CREATE INDEX idx_new ON products(is_new); 