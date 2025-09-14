const r = require("express").Router();
const c = require("../controllers/AuthController");
const auth = require("../middleware/auth");

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required: [usernameOrEmail, password]
 *       properties:
 *         usernameOrEmail:
 *           type: string
 *           description: Username or email (alias for username, empUsername, email, empEmail)
 *           example: alice@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: The employee's password
 *           example: mySecret123
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Alice Doe
 *         email:
 *           type: string
 *           example: alice@example.com
 *         username:
 *           type: string
 *           example: alice
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *     AuthError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Invalid credentials
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: >
 *       Attempts login with a username/email and password.
 *       Accepts multiple aliases in the body (username, usernameOrEmail, empUsername, email, empEmail).
 *       On success:
 *       - Sets an HTTP-only cookie with a JWT (8h expiry).
 *       - Returns the authenticated user object.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: jwt=eyJhbGci...; HttpOnly; Path=/; Max-Age=28800
 *             description: JWT cookie for session authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 *       500:
 *         description: Server error
 */
r.post("/login", c.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     description: >
 *       Returns the authenticated user info based on the JWT cookie.
 *       Requires `bearerAuth` or valid cookie from `/login`.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthError'
 */
r.get("/me", auth, c.me);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user
 *     description: >
 *       Clears the JWT cookie and ends the session.
 *       Always returns `{ ok: true }` on success.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
r.post("/logout", auth, c.logout);

module.exports = r;
