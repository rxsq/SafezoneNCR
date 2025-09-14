const r = require("express").Router();
const c = require("../controllers/ProductsController");

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       description: Product record linked to a supplier
 *       properties:
 *         prodID:
 *           type: integer
 *           example: 101
 *         prodName:
 *           type: string
 *           example: "Steel Rod"
 *         prodCategory:
 *           type: string
 *           example: "Raw Material"
 *         supID:
 *           type: integer
 *           description: Supplier foreign key
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductCreate:
 *       type: object
 *       description: Request body to create a new product
 *       required: [prodName, prodCategory, supID]
 *       properties:
 *         prodName: { type: string, example: "Steel Rod" }
 *         prodCategory: { type: string, example: "Raw Material" }
 *         supID: { type: integer, example: 5 }
 *     ProductUpdate:
 *       type: object
 *       description: Request body to update product fields
 *       properties:
 *         prodName: { type: string, example: "Updated Rod" }
 *         prodCategory: { type: string, example: "Finished Good" }
 *         supID: { type: integer, example: 7 }
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List products (paged)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Page size
 *     responses:
 *       200:
 *         description: Paged list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 count:
 *                   type: integer
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Product ID (prodID)
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Not found" }
 */
r.get("/:id", c.get);

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Product ID (prodID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
r.put("/:id", c.update);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Product ID (prodID)
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       404:
 *         description: Product not found
 */
r.delete("/:id", c.remove);

module.exports = r;
