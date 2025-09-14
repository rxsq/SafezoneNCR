const r = require('express').Router();
const c = require('../controllers/AnalyticsController');
const auth = require('../middleware/auth');

r.get('/overview', auth, c.overview);

module.exports = r;