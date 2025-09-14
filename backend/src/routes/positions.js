const r = require("express").Router();
const c = require("../controllers/PositionsController");

/**
 * @openapi
 * components:
 *   schemas:
 *     Position:
 *       type: object
 *       description: Position/role record. Primary key is typically `posID`.
 *       properties:
 *         posID:
 *           type: integer
 *           example: 3
 *         name:
 *           type: string
 *           example: "Quality Engineer"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       additionalProperties: true
 *     PositionCreate:
 *       type: object
 *       description: Request body to create a position
 *       properties:
 *         name:
 *           type: string
 *           example: "Production Manager"
 *       required: [name]
 *     PositionUpdate:
 *       type: object
 *       description: Request body to update a position
 *       properties:
 *         name:
 *           type: string
 */

/**
 * @openapi
 * /api/positions:
 *   get:
 *     summary: List all positions
 *     tags: [Positions]
 *     responses:
 *       200:
 *         description: Array of positions (not paged)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Position'
 */
r.get("/", c.list);

/**
 * @openapi
 * /api/positions/{id}:
 *   get:
 *     summary: Get a position by ID
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Position ID (posID)
 *     responses:
 *       200:
 *         description: Position found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
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
 * /api/positions:
 *   post:
 *     summary: Create a new position
 *     tags: [Positions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionCreate'
 *     responses:
 *       201:
 *         description: Created position
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
 */
r.post("/", c.create);

/**
 * @openapi
 * /api/positions/{id}:
 *   put:
 *     summary: Update a position
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Position ID (posID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PositionUpdate'
 *     responses:
 *       200:
 *         description: Updated position
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Position'
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
 * /api/positions/{id}:
 *   delete:
 *     summary: Delete a position
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Position ID (posID)
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
