const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const authenticateJWT = require('../middleWares/authMiddleware');

router.post('/initiatePremiumPayment', authenticateJWT, premiumController.initiatePremiumPayment);
router.post('/confirmPremium', authenticateJWT, premiumController.confirmPremium);
router.get('/checkPremium', authenticateJWT, premiumController.checkPremium);
module.exports = router;
