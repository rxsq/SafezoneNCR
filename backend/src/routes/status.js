const r = require("express").Router();
const c = require("../controllers/StatusController");

/**
 * @openapi
 * components:
 *   schemas:
 *     NCRStatus:
 *       type: object
 *       description: NCR status (e.g., Open, Closed)
 *       properties:
 *         ncrStatusID:
 *           type: integer
 *           example: 1
 *         ncrStatusName:
 *           type: string
 *           example: "Open"
 *     NCRStatusCreate:
 *       type: object
 *       required: [ncrStatusName]
 *       properties:
 *         ncrStatusName:
 *           type: string
 *           example: "Closed"
 *     NCRStatusUpdate:
 *       type: object
 *       properties:
 *         ncrStatusName:
 *           type: string
 */

/**
 * @openapi
 * /api/statuses:
 *   get:
 *     summary: List all NCR statuses
 *     tags: [Statuses]
 *     responses:
 *       200:
 *         description: Array of NCR statuses (not paged)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NCRStatus'
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/statuses/{id}:
 *   get:
 *     summary: Get an NCR status by ID
 *     tags: [Statuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Status ID (ncrStatusID)
 *     responses:
 *       200:
 *         description: NCR status found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NCRStatus'
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
 * /api/statuses:
 *   post:
 *     summary: Create a new NCR status
 *     tags: [Statuses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NCRStatusCreate'
 *     responses:
 *       201:
 *         description: Created NCR status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NCRStatus'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/statuses/{id}:
 *   put:
 *     summary: Update an NCR status
 *     tags: [Statuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Status ID (ncrStatusID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NCRStatusUpdate'
 *     responses:
 *       200:
 *         description: Updated NCR status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NCRStatus'
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
 * /api/statuses/{id}:
 *   delete:
 *     summary: Delete an NCR status
 *     tags: [Statuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Status ID (ncrStatusID)
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
