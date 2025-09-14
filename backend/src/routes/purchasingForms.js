const r = require("express").Router();
const c = require("../controllers/PurchasingFormsController");

/**
 * @openapi
 * components:
 *   schemas:
 *     PurchasingForm:
 *       type: object
 *       description: Purchasing form record. Primary key is `purFormID`.
 *       properties:
 *         purFormID:
 *           type: integer
 *           example: 12
 *         purDisposition:
 *           type: string
 *           example: "Return to supplier"
 *         purAction:
 *           type: string
 *           example: "Issue credit"
 *         purOwnerID:
 *           type: integer
 *           description: Employee ID responsible for the purchasing action
 *           example: 3
 *         purDate:
 *           type: string
 *           format: date
 *           example: "2025-09-10"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PurchasingFormCreate:
 *       type: object
 *       description: Request body to create a purchasing form
 *       properties:
 *         purDisposition: { type: string, example: "Return to supplier" }
 *         purAction: { type: string, example: "Issue credit" }
 *         purOwnerID: { type: integer, example: 3 }
 *         purDate: { type: string, format: date, example: "2025-09-10" }
 *     PurchasingFormUpdate:
 *       type: object
 *       description: Request body to update a purchasing form
 *       properties:
 *         purDisposition: { type: string }
 *         purAction: { type: string }
 *         purOwnerID: { type: integer }
 *         purDate: { type: string, format: date }
 *     PagedPurchasingForms:
 *       type: object
 *       description: Paginated response envelope
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchasingForm'
 *         page: { type: integer, example: 1 }
 *         limit: { type: integer, example: 10 }
 *         total: { type: integer, example: 37 }
 *         pages: { type: integer, example: 4 }
 */

/**
 * @openapi
 * /api/purchasingForms:
 *   get:
 *     summary: List purchasing forms (paged)
 *     tags: [PurchasingForms]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 1 }
 *         description: Page size
 *     responses:
 *       200:
 *         description: Paged purchasing forms
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedPurchasingForms'
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/purchasingForms/{id}:
 *   get:
 *     summary: Get purchasing form by ID
 *     tags: [PurchasingForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Purchasing form ID (purFormID)
 *     responses:
 *       200:
 *         description: Purchasing form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchasingForm'
 *       404:
 *         description: Not found
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
 * /api/purchasingForms:
 *   post:
 *     summary: Create a purchasing form
 *     tags: [PurchasingForms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchasingFormCreate'
 *     responses:
 *       201:
 *         description: Created purchasing form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchasingForm'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/purchasingForms/{id}:
 *   put:
 *     summary: Update a purchasing form
 *     tags: [PurchasingForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Purchasing form ID (purFormID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchasingFormUpdate'
 *     responses:
 *       200:
 *         description: Updated purchasing form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchasingForm'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Not found" }
 */
r.put("/:id", c.update);

/**
 * @openapi
 * /api/purchasingForms/{id}:
 *   delete:
 *     summary: Delete a purchasing form
 *     tags: [PurchasingForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Purchasing form ID (purFormID)
 *     responses:
 *       200:
 *         description: Deletion result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: "Not found" }
 */
r.delete("/:id", c.remove);

module.exports = r;
