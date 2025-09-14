const r = require("express").Router();
const c = require("../controllers/EngineerFormsController");

/**
 * @openapi
 * components:
 *   schemas:
 *     EngineerForm:
 *       type: object
 *       description: >
 *         Engineer form entity. Primary key is `engFormID`. Other columns depend
 *         on your model; only keys known from the association layer are documented here.
 *       properties:
 *         engFormID:
 *           type: integer
 *           description: Primary key of the engineer form
 *           example: 101
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-01T10:15:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-05T14:45:00.000Z"
 *       additionalProperties: true
 *     EngineerFormCreate:
 *       type: object
 *       description: JSON body to create an engineer form. The exact fields depend on your model.
 *       additionalProperties: true
 *       example:
 *         # add your actual fields here; example keys are placeholders
 *         title: "Root Cause Analysis"
 *         description: "Initial engineering report"
 *         status: "open"
 *     EngineerFormUpdate:
 *       type: object
 *       description: JSON body to update an engineer form (partial update allowed by controller).
 *       additionalProperties: true
 *       example:
 *         status: "closed"
 *     PagedEngineerForms:
 *       type: object
 *       description: Standard paginated envelope returned by list()
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EngineerForm'
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 42
 *         pages:
 *           type: integer
 *           example: 5
 *
 *   # Relationship note:
 *   # Each EngineerForm is associated to at most one NCRForm:
 *   # NCRForm.engFormID → EngineerForm.engFormID (1:1)
 */

/**
 * @openapi
 * /api/engineerForms:
 *   get:
 *     summary: List engineer forms (paged)
 *     description: >
 *       Returns a paginated list of engineer forms.
 *       Query params: `page` (default 1), `limit` (default 10).
 *     tags: [EngineerForms]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, default: 10 }
 *         description: Page size
 *     responses:
 *       200:
 *         description: Paged engineer forms
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedEngineerForms'
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/engineerForms/{id}:
 *   get:
 *     summary: Get engineer form by ID (engFormID)
 *     description: Returns a single engineer form by its primary key `engFormID`.
 *     tags: [EngineerForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: engFormID of the engineer form
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Engineer form found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EngineerForm'
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
 * /api/engineerForms:
 *   post:
 *     summary: Create a new engineer form
 *     tags: [EngineerForms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EngineerFormCreate'
 *     responses:
 *       201:
 *         description: Created engineer form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EngineerForm'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/engineerForms/{id}:
 *   put:
 *     summary: Update an engineer form
 *     description: Updates the engineer form identified by `engFormID`.
 *     tags: [EngineerForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: engFormID of the engineer form
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EngineerFormUpdate'
 *     responses:
 *       200:
 *         description: Updated engineer form
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EngineerForm'
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
 * /api/engineerForms/{id}:
 *   delete:
 *     summary: Delete an engineer form
 *     description: Deletes the engineer form by `engFormID`. Returns `{ ok: true }` on success.
 *     tags: [EngineerForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: engFormID of the engineer form
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deletion result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
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
