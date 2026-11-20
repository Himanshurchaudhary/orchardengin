const { pool } = require('../config/db');

// Only these columns can be changed through findByIdAndUpdate.
// Prevents unknown or malicious keys from reaching the SQL statement.
const ALLOWED_UPDATE_FIELDS = [
    'name', 'minDiscount', 'startDate', 'startTime', 'endDate', 'endTime',
    'description', 'isActive', 'displayTarget',
    'desktopMedia', 'desktopMediaType', 'mobileMedia', 'mobileMediaType',
];

// Maps display target to its media columns. Values come from this fixed map,
// never from user input, so using them in SQL is safe.
const getMediaColumns = (target) =>
    target === 'mobile'
        ? { media: 'mobileMedia', type: 'mobileMediaType' }
        : { media: 'desktopMedia', type: 'desktopMediaType' };

const createFlashSaleTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS flash_sales (
            id                INT AUTO_INCREMENT PRIMARY KEY,
            name              VARCHAR(255)  NOT NULL,
            minDiscount       DECIMAL(5,2)  NOT NULL,
            startDate         DATE          NOT NULL,
            startTime         VARCHAR(20)   NOT NULL,
            endDate           DATE          NOT NULL,
            endTime           VARCHAR(20)   NOT NULL,
            description       TEXT          NOT NULL,
            desktopMedia      VARCHAR(500)  NULL,
            desktopMediaType  ENUM('image','video') NULL DEFAULT 'image',
            mobileMedia       VARCHAR(500)  NULL,
            mobileMediaType   ENUM('image','video') NULL DEFAULT 'image',
            displayTarget     ENUM('web','mobile') NOT NULL DEFAULT 'web',
            isActive          BOOLEAN       DEFAULT true,
            createdAt         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
            updatedAt         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Join table: replaces the old products array
    await pool.query(`
        CREATE TABLE IF NOT EXISTS flash_sale_products (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            flash_sale_id INT NOT NULL,
            product_id    INT NOT NULL,
            UNIQUE KEY unique_sale_product (flash_sale_id, product_id),
            FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE
        )
    `);
};

// Run at startup, but surface failures instead of leaving them unhandled.
createFlashSaleTables().catch((err) => {
    console.error('Flash sale table setup failed:', err);
});

/* ── Internal helpers ────────────────────────────────────────────────────── */

const fetchProducts = async (flashSaleId) => {
    const [rows] = await pool.query(`
        SELECT p.*
        FROM flash_sale_products fsp
        JOIN products p ON fsp.product_id = p.id
        WHERE fsp.flash_sale_id = ?
    `, [flashSaleId]);
    return rows;
};

const hydrateOne = async (row) => {
    if (!row) return null;
    // Frontend reads `thumbnail`, so expose the media for this sale's target under that name
    const cols = getMediaColumns(row.displayTarget);
    row.thumbnail = row[cols.media] || null;
    row.products = await fetchProducts(row.id);
    return row;
};

const hydrateMany = (rows) => Promise.all(rows.map(hydrateOne));

/* ── Model methods ───────────────────────────────────────────────────────── */

const FlashSale = {

    create: async ({ name, minDiscount, startDate, startTime, endDate, endTime, description, media, displayTarget = 'web' }) => {
        const cols = getMediaColumns(displayTarget);

        const [result] = await pool.query(`
            INSERT INTO flash_sales
                (name, minDiscount, startDate, startTime, endDate, endTime, description,
                 ${cols.media}, ${cols.type}, displayTarget)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'image', ?)
        `, [name, minDiscount, startDate, startTime, endDate, endTime, description, media, displayTarget]);

        const [rows] = await pool.query(`SELECT * FROM flash_sales WHERE id = ?`, [result.insertId]);
        return hydrateOne(rows[0]);
    },

    find: async (displayTarget = null) => {
        let query = `SELECT * FROM flash_sales ORDER BY startDate ASC`;
        const params = [];

        if (displayTarget) {
            query = `SELECT * FROM flash_sales WHERE displayTarget = ? ORDER BY startDate ASC`;
            params.push(displayTarget);
        }

        const [rows] = await pool.query(query, params);
        return hydrateMany(rows);
    },

    findById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM flash_sales WHERE id = ? LIMIT 1`, [id]);
        return hydrateOne(rows[0] ?? null);
    },

    findByIdAndUpdate: async (id, data) => {
        const fields = Object.keys(data).filter((f) => ALLOWED_UPDATE_FIELDS.includes(f));
        if (fields.length === 0) return FlashSale.findById(id);

        const setClause = fields.map((f) => `\`${f}\` = ?`).join(', ');
        const values = fields.map((f) => data[f]);

        await pool.query(
            `UPDATE flash_sales SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
        return FlashSale.findById(id);
    },

    toggleStatus: async (id) => {
        const existing = await FlashSale.findById(id);
        if (!existing) return null;
        await pool.query(`UPDATE flash_sales SET isActive = NOT isActive WHERE id = ?`, [id]);
        return FlashSale.findById(id);
    },

    findByIdAndDelete: async (id) => {
        const existing = await FlashSale.findById(id);
        if (!existing) return null;
        // ON DELETE CASCADE removes flash_sale_products rows automatically
        await pool.query(`DELETE FROM flash_sales WHERE id = ?`, [id]);
        return existing;
    },

    /* ── Product association methods ───────────────────────────────────── */

    hasProduct: async (flashSaleId, productId) => {
        const [rows] = await pool.query(
            `SELECT id FROM flash_sale_products WHERE flash_sale_id = ? AND product_id = ? LIMIT 1`,
            [flashSaleId, productId]
        );
        return rows.length > 0;
    },

    addProduct: async (flashSaleId, productId) => {
        await pool.query(
            `INSERT INTO flash_sale_products (flash_sale_id, product_id) VALUES (?, ?)`,
            [flashSaleId, productId]
        );
        return FlashSale.findById(flashSaleId);
    },

    removeProduct: async (flashSaleId, productId) => {
        await pool.query(
            `DELETE FROM flash_sale_products WHERE flash_sale_id = ? AND product_id = ?`,
            [flashSaleId, productId]
        );
        return FlashSale.findById(flashSaleId);
    },
};

FlashSale.getMediaColumns = getMediaColumns;

module.exports = FlashSale;