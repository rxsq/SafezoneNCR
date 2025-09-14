const r = require("express").Router();
const c = require("../controllers/SuppliersController");

/**
 * @openapi
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       description: A supplier that provides products.
 *       properties:
 *         supID:
 *           type: integer
 *           example: 1
 *         supName:
 *           type: string
 *           example: "Acme Components Ltd."
 *         supContactName:
 *           type: string
 *           example: "Jane Doe"
 *         supContactEmail:
 *           type: string
 *           format: email
 *           example: "jane.doe@acme.com"
 *         supContactPhone:
 *           type: string
 *           example: "+1-555-123-4567"
 *         supAddress:
 *           type: string
 *           example: "123 Industrial Park Road"
 *         supCity:
 *           type: string
 *           example: "Los Angeles"
 *         supCountry:
 *           type: string
 *           example: "USA"
 *     SupplierCreate:
 *       type: object
 *       required: [supName]
 *       properties:
 *         supName: { type: string, example: "New Supplier" }
 *         supContactName: { type: string }
 *         supContactEmail: { type: string, format: email }
 *         supContactPhone: { type: string }
 *         supAddress: { type: string }
 *         supCity: { type: string }
 *         supCountry: { type: string }
 *     SupplierUpdate:
 *       type: object
 *       properties:
 *         supName: { type: string }
 *         supContactName: { type: string }
 *         supContactEmail: { type: string, format: email }
 *         supContactPhone: { type: string }
 *         supAddress: { type: string }
 *         supCity: { type: string }
 *         supCountry: { type: string }
 */

/**
 * @openapi
 * /api/suppliers:
 *   get:
 *     summary: List suppliers
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *         description: Items per page (default 10)
 *     responses:
 *       200:
 *         description: A paged list of suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Supplier'
 *                 count:
 *                   type: integer
 *                   example: 42
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Supplier ID (supID)
 *     responses:
 *       200:
 *         description: Supplier found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Not found
 */
r.get("/:id", c.get);

/**
 * @openapi
 * /api/suppliers:
 *   post:
 *     summary: Create a supplier
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierCreate'
 *     responses:
 *       201:
 *         description: Created supplier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/suppliers/{id}:
 *   put:
 *     summary: Update a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Supplier ID (supID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierUpdate'
 *     responses:
 *       200:
 *         description: Updated supplier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Not found
 */
r.put("/:id", c.update);

/**
 * @openapi
 * /api/suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted supplier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       404:
 *         description: Not found
 */
r.delete("/:id", c.remove);

module.exports = r;
