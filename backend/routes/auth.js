const express = require('express');
const authController = require('../controllers/storeController');
const router = express.Router();
const authentication = require('../models/userModel')


router.get('/', authController.landingPage)
router.get('/profile', authentication.authenticateUser, authController.profile);
router.get('/profileData', authentication.authenticateUser, authController.profileData);
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/data', authentication.authenticateUser,authController.fetchData);
router.post('/refreshToken', authController.refreshToken);
router.post('/revokedData', authController.fetchRevokedData);
router.post('/usageData', authController.fetchUsageData);
router.post('/logs', authController.fetchLogsData);
router.get('/dashboard',authentication.authenticateUser,authController.dashboard);
router.post('/logout',authController.logout);
router.get('/userDetails', authentication.authenticateUser, authController.userDetails);
router.get('/userSessionInfo', authentication.authenticateUser, authController.userSessionInfo);
router.post('/cert', authController.certDetails);
router.post('/updatePassword', authentication.authenticateUser, authController.updatePasswordController);
router.post('/authorities', authentication.authenticateUser, authController.authorities)
router.post('/cards', authController.cards);



module.exports = router;