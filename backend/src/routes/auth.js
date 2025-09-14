const r = require('express').Router();
const c = require('../controllers/AuthController');
const auth = require('../middleware/auth');

r.post('/login', c.login);
r.get('/me', auth, c.me);
r.post('/logout', auth, c.logout);

module.exports = r;
