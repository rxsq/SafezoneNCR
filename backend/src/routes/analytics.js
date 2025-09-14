const r = require("express").Router();
const c = require("../controllers/AnalyticsController");
const auth = require("../middleware/auth");

/**
 * @openapi
 * components:
 *   schemas:
 *     AnalyticsTotals:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 128
 *         open:
 *           type: integer
 *           example: 37
 *         closed:
 *           type: integer
 *           example: 91
 *     AnalyticsStages:
 *       type: object
 *       description: Counts by processing stage
 *       properties:
 *         QUA:
 *           type: integer
 *           example: 14
 *         ENG:
 *           type: integer
 *           example: 9
 *         PUR:
 *           type: integer
 *           example: 6
 *         ARC:
 *           type: integer
 *           example: 3
 *         UNK:
 *           type: integer
 *           description: Present if some records have a missing/unknown stage
 *           example: 5
 *     AnalyticsMonths:
 *       type: object
 *       description: Last 12 months of NCR counts
 *       properties:
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *             pattern: "^[0-9]{4}-[0-9]{2}$"
 *           example: ["2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09"]
 *         counts:
 *           type: array
 *           items:
 *             type: integer
 *           example: [3,6,5,9,8,4,7,10,6,5,8,7]
 *     SupplierCount:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           description: Supplier name (or "Unknown")
 *           example: "Acme Parts Ltd."
 *         value:
 *           type: integer
 *           description: Number of NCRs associated with this supplier
 *           example: 12
 *     NCRFormSummary:
 *       type: object
 *       description: Minimal NCR info used in recentOpen
 *       properties:
 *         ncrFormID:
 *           type: integer
 *           example: 42
 *         ncrFormNo:
 *           type: string
 *           example: "NCR-2025-0042"
 *         ncrIssueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-08-20T00:00:00.000Z"
 *         ncrStage:
 *           type: string
 *           description: One of QUA, ENG, PUR, ARC, or null (treated as UNK)
 *           example: "QUA"
 *         ncrStatusID:
 *           type: integer
 *           description: 1 = open, 2 = closed
 *           example: 1
 *         prodID:
 *           type: integer
 *           nullable: true
 *           example: 7
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-21T15:12:10.000Z"
 *     AnalyticsOverviewResponse:
 *       type: object
 *       properties:
 *         totals:
 *           $ref: '#/components/schemas/AnalyticsTotals'
 *         stages:
 *           $ref: '#/components/schemas/AnalyticsStages'
 *         months:
 *           $ref: '#/components/schemas/AnalyticsMonths'
 *         suppliers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SupplierCount'
 *         recentOpen:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NCRFormSummary'
 *
 * /api/analytics/overview:
 *   get:
 *     summary: Get analytics overview
 *     description: >
 *       Aggregated analytics across NCR forms:
 *       - `totals` (total, open, closed)
 *       - `stages` (counts per stage, e.g., QUA/ENG/PUR/ARC; may include UNK)
 *       - `months` (last 12 months: labels `YYYY-MM` and counts)
 *       - `suppliers` (top 15 suppliers by NCR count)
 *       - `recentOpen` (most recent 5 open NCRs)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsOverviewResponse'
 *             examples:
 *               sample:
 *                 value:
 *                   totals: { total: 128, open: 37, closed: 91 }
 *                   stages: { QUA: 14, ENG: 9, PUR: 6, ARC: 3, UNK: 5 }
 *                   months:
 *                     labels: ["2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09"]
 *                     counts: [3,6,5,9,8,4,7,10,6,5,8,7]
 *                   suppliers:
 *                     - { label: "Acme Parts Ltd.", value: 12 }
 *                     - { label: "Globex", value: 9 }
 *                   recentOpen:
 *                     - { ncrFormID: 42, ncrFormNo: "NCR-2025-0042", ncrIssueDate: "2025-08-20T00:00:00.000Z", ncrStage: "QUA", ncrStatusID: 1, prodID: 7, createdAt: "2025-08-21T15:12:10.000Z" }
 *                     - { ncrFormID: 41, ncrFormNo: "NCR-2025-0041", ncrIssueDate: "2025-08-18T00:00:00.000Z", ncrStage: "ENG", ncrStatusID: 1, prodID: 3, createdAt: "2025-08-19T11:00:00.000Z" }
 *       401:
 *         description: Unauthorized – authentication required
 *       500:
 *         description: Failed to compute analytics
 */
r.get("/overview", auth, c.overview);

module.exports = r;
