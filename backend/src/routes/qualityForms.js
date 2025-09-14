const r = require("express").Router();
const c = require("../controllers/QualityFormsController");

/**
 * @openapi
 * components:
 *   schemas:
 *     QualityForm:
 *       type: object
 *       description: Quality Form record
 *       properties:
 *         qualFormID:
 *           type: integer
 *           example: 101
 *         qualItemDesc:
 *           type: string
 *           example: "Widget Part A"
 *         qualIssueDesc:
 *           type: string
 *           example: "Surface scratches detected"
 *         qualItemID:
 *           type: integer
 *           example: 5001
 *         qualSalesOrderNo:
 *           type: integer
 *           example: 23456
 *         qualQtyReceived:
 *           type: integer
 *           example: 100
 *         qualQtyDefective:
 *           type: integer
 *           example: 5
 *         qualItemNonConforming:
 *           type: integer
 *           example: 5
 *         qualRepID:
 *           type: integer
 *           example: 12
 *         qualDate:
 *           type: string
 *           format: date
 *           example: "2025-09-10"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-10T12:34:56.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-11T08:15:30.000Z"
 *     QualityFormCreate:
 *       type: object
 *       required:
 *         - qualItemDesc
 *         - qualIssueDesc
 *         - qualDate
 *       properties:
 *         qualItemDesc: { type: string }
 *         qualIssueDesc: { type: string }
 *         qualItemID: { type: integer }
 *         qualSalesOrderNo: { type: integer }
 *         qualQtyReceived: { type: integer }
 *         qualQtyDefective: { type: integer }
 *         qualItemNonConforming: { type: integer }
 *         qualRepID: { type: integer }
 *         qualDate:
 *           type: string
 *           format: date
 *       example:
 *         qualItemDesc: "Widget Part A"
 *         qualIssueDesc: "Scratches found"
 *         qualItemID: 5001
 *         qualSalesOrderNo: 23456
 *         qualQtyReceived: 100
 *         qualQtyDefective: 5
 *         qualItemNonConforming: 5
 *         qualRepID: 12
 *         qualDate: "2025-09-10"
 *     QualityFormUpdate:
 *       type: object
 *       properties:
 *         qualIssueDesc: { type: string }
 *         qualQtyDefective: { type: integer }
 *         qualItemNonConforming: { type: integer }
 *       example:
 *         qualIssueDesc: "Rechecked – only 3 defective"
 *         qualQtyDefective: 3
 *         qualItemNonConforming: 3
 *     PagedQualityForms:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QualityForm'
 *         page: { type: integer, example: 1 }
 *         limit: { type: integer, example: 10 }
 *         total: { type: integer, example: 37 }
 *         pages: { type: integer, example: 4 }
 */

/**
 * @openapi
 * /api/qualityForms:
 *   get:
 *     summary: List quality forms (paged)
 *     tags: [QualityForms]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paged quality forms
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedQualityForms'
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/qualityForms/{id}:
 *   get:
 *     summary: Get quality form by ID
 *     tags: [QualityForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: A quality form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QualityForm'
 *       404:
 *         description: Not found
 */
r.get("/:id", c.get);

/**
 * @openapi
 * /api/qualityForms:
 *   post:
 *     summary: Create a new quality form
 *     tags: [QualityForms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QualityFormCreate'
 *     responses:
 *       201:
 *         description: Created quality form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QualityForm'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/qualityForms/{id}:
 *   put:
 *     summary: Update a quality form
 *     tags: [QualityForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QualityFormUpdate'
 *     responses:
 *       200:
 *         description: Updated quality form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QualityForm'
 *       404:
 *         description: Not found
 */
r.put("/:id", c.update);

/**
 * @openapi
 * /api/qualityForms/{id}:
 *   delete:
 *     summary: Delete a quality form
 *     tags: [QualityForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
 */
r.delete("/:id", c.remove);

module.exports = r;
