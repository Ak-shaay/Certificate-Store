const express = require('express');
const authController = require('../controllers/storeController');
const router = express.Router();
const authentication = require('../models/userModel')


router.get('/', authController.landingPage)
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/data', authController.fetchData);
router.post('/revokedData', authController.fetchRevokedData);
router.post('/usageData', authController.fetchUsageData);
router.get('/dashboard',authentication.authenticateUser ,authController.dashboard);
router.get('/logout',authController.logout)
router.get('/userDetails', authentication.authenticateUser, authController.userDetails);
router.get('/userSessionInfo', authentication.authenticateUser, authController.userSessionInfo)
router.post('/cert', authentication.authenticateUser, authController.certDetails)


module.exports = router;