const router = require('express').Router();
const authMiddleware = require('../middleware/auth');

router.use('/auth', require('./auth'));

router.use('/positions', require('./positions'));
router.use('/employees', authMiddleware, require('./employees'));
router.use('/suppliers', authMiddleware, require('./suppliers'));
router.use('/products', authMiddleware, require('./products'));
router.use('/status', authMiddleware, require('./status'));
router.use('/ncrForms', authMiddleware, require('./ncrForms'));
router.use('/qualityForms', authMiddleware, require('./qualityForms'));
router.use('/engineerForms', authMiddleware, require('./engineerForms'));
router.use('/purchasingForms', authMiddleware, require('./purchasingForms'));
router.use('/analytics', authMiddleware, require('./analytics'));

module.exports = router;
