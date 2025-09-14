const r = require("express").Router();
const c = require("../controllers/NCRFormsController");

/**
 * @openapi
 * components:
 *   schemas:
 *     NCRForm:
 *       type: object
 *       description: >
 *         Non-Conformance Report (NCR) form. Primary key is `ncrFormID`.
 *         Each NCRForm belongs to a product, has a status, and may be linked to
 *         Quality, Engineer, and Purchasing forms. Also associated with employees
 *         through the `NCREmployee` join table.
 *       properties:
 *         ncrFormID:
 *           type: integer
 *           example: 1001
 *         ncrFormNo:
 *           type: string
 *           example: NCR-2025-0001
 *         ncrIssueDate:
 *           type: string
 *           format: date
 *           example: "2025-09-01"
 *         ncrStage:
 *           type: string
 *           description: Current workflow stage (QUA, ENG, PUR, ARC, etc.)
 *           example: "ENG"
 *         ncrStatusID:
 *           type: integer
 *           description: Foreign key to NCRStatus
 *           example: 1
 *         prodID:
 *           type: integer
 *           description: Foreign key to Product
 *           example: 42
 *         qualFormID:
 *           type: integer
 *           nullable: true
 *           description: Optional QualityForm link
 *         engFormID:
 *           type: integer
 *           nullable: true
 *           description: Optional EngineerForm link
 *         purFormID:
 *           type: integer
 *           nullable: true
 *           description: Optional PurchasingForm link
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       additionalProperties: true
 *     PagedNCRForms:
 *       type: object
 *       description: Paginated list envelope for NCRForms
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NCRForm'
 *         page: { type: integer, example: 1 }
 *         limit: { type: integer, example: 10 }
 *         total: { type: integer, example: 134 }
 *         pages: { type: integer, example: 14 }
 */

/**
 * @openapi
 * /api/ncrForms:
 *   get:
 *     summary: List NCR forms (paged)
 *     description: Returns a paginated list of NCR forms.
 *     tags: [NCRForms]
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
 *         description: Paged NCR forms
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedNCRForms'
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/ncrForms/{id}:
 *   get:
 *     summary: Get NCR form by ID
 *     tags: [NCRForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ncrFormID of the NCR form
 *     responses:
 *       200:
 *         description: NCR form found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NCRForm'
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
 * /api/ncrForms:
 *   post:
 *     summary: Create a new NCR form
 *     tags: [NCRForms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NCRForm'
 *     responses:
 *       201:
 *         description: Created NCR form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NCRForm'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/ncrForms/{id}:
 *   put:
 *     summary: Update an NCR form
 *     tags: [NCRForms]
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
 *             $ref: '#/components/schemas/NCRForm'
 *     responses:
 *       200:
 *         description: Updated NCR form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NCRForm'
 *       404:
 *         description: Not found
 */
r.put("/:id", c.update);

/**
 * @openapi
 * /api/ncrForms/{id}:
 *   delete:
 *     summary: Delete an NCR form
 *     tags: [NCRForms]
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
