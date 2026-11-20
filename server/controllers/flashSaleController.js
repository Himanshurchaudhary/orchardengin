const FlashSale = require('../models/FlashSale');
const Product   = require('../models/product_Management/Product');

const VALID_TARGETS = ['web', 'mobile'];

// @desc Create New Flash Sale
exports.addFlashSale = async (req, res) => {
    try {
        const { name, minDiscount, startDate, startTime, endDate, endTime, description, displayTarget } = req.body;
        const media = req.file ? req.file.path : null;

        if (!media) {
            return res.status(400).json({ success: false, message: "Flash Sale Thumbnail is required" });
        }

        if (!VALID_TARGETS.includes(displayTarget)) {
            return res.status(400).json({ success: false, message: "displayTarget must be 'web' or 'mobile'" });
        }

        const flashSale = await FlashSale.create({
            name, minDiscount, startDate, startTime, endDate, endTime,
            description, media, displayTarget,
        });

        res.status(201).json({ success: true, message: "Flash Sale Created!", flashSale });
    } catch (error) {
        console.error('addFlashSale error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get All Flash Sales
exports.getFlashSales = async (req, res) => {
    try {
        const { target } = req.query; // ?target=web or ?target=mobile
        const sales = await FlashSale.find(VALID_TARGETS.includes(target) ? target : null);
        res.status(200).json({ success: true, sales });
    } catch (error) {
        console.error('getFlashSales error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get Single Flash Sale (with products)
exports.getFlashSaleById = async (req, res) => {
    try {
        const sale = await FlashSale.findById(req.params.id);
        if (!sale) return res.status(404).json({ success: false, message: "Flash Sale not found" });
        res.status(200).json({ success: true, sale });
    } catch (error) {
        console.error('getFlashSaleById error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update Flash Sale
exports.updateFlashSale = async (req, res) => {
    try {
        const existing = await FlashSale.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: "Flash Sale not found" });

        const updateData = { ...req.body };
        delete updateData.thumbnail; // not a column; media is handled below

        if (updateData.displayTarget !== undefined && !VALID_TARGETS.includes(updateData.displayTarget)) {
            return res.status(400).json({ success: false, message: "displayTarget must be 'web' or 'mobile'" });
        }

        if (req.file) {
            // Write the new upload to the column for the target this sale will have after the update
            const target = updateData.displayTarget || existing.displayTarget;
            const cols = FlashSale.getMediaColumns(target);
            updateData[cols.media] = req.file.path;
            updateData[cols.type] = 'image';
        }

        const sale = await FlashSale.findByIdAndUpdate(req.params.id, updateData);
        res.status(200).json({ success: true, message: "Flash Sale Updated!", sale });
    } catch (error) {
        console.error('updateFlashSale error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Toggle Flash Sale Active Status
exports.toggleFlashSaleStatus = async (req, res) => {
    try {
        const sale = await FlashSale.toggleStatus(req.params.id);
        if (!sale) return res.status(404).json({ success: false, message: "Flash Sale not found" });
        res.status(200).json({
            success: true,
            message: `Flash Sale ${sale.isActive ? 'Activated' : 'Deactivated'}`,
            sale,
        });
    } catch (error) {
        console.error('toggleFlashSaleStatus error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Delete Flash Sale
exports.deleteFlashSale = async (req, res) => {
    try {
        const sale = await FlashSale.findByIdAndDelete(req.params.id);
        if (!sale) return res.status(404).json({ success: false, message: "Flash Sale not found" });
        res.status(200).json({ success: true, message: "Flash Sale Deleted!" });
    } catch (error) {
        console.error('deleteFlashSale error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Add Product to Flash Sale
exports.addProductToFlashSale = async (req, res) => {
    try {
        const { productId } = req.body;

        const sale = await FlashSale.findById(req.params.id);
        if (!sale) return res.status(404).json({ success: false, message: "Flash Sale not found" });

        const alreadyIn = await FlashSale.hasProduct(req.params.id, productId);
        if (alreadyIn) {
            return res.status(400).json({ success: false, message: "Product already in this Flash Sale" });
        }

        const updated = await FlashSale.addProduct(req.params.id, productId);
        res.status(200).json({ success: true, message: "Product added to Flash Sale!", sale: updated });
    } catch (error) {
        console.error('addProductToFlashSale error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update a product's price/quantity within a Flash Sale
exports.updateProductInFlashSale = async (req, res) => {
    try {
        const { price, quantity } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            { sellingPrice: price, stockQuantity: quantity }
        );
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        res.status(200).json({ success: true, message: "Product updated!", product });
    } catch (error) {
        console.error('updateProductInFlashSale error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Remove Product from Flash Sale
exports.removeProductFromFlashSale = async (req, res) => {
    try {
        const sale = await FlashSale.findById(req.params.id);
        if (!sale) return res.status(404).json({ success: false, message: "Flash Sale not found" });

        const updated = await FlashSale.removeProduct(req.params.id, req.params.productId);
        res.status(200).json({ success: true, message: "Product removed from Flash Sale!", sale: updated });
    } catch (error) {
        console.error('removeProductFromFlashSale error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};