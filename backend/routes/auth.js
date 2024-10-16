const express = require('express');
const authController = require('../controllers/storeController');
const router = express.Router();
const authentication = require('../models/userModel');

router.get('/', authController.landingPage)
router.get('/profile', authentication.authenticateUser, authController.profile);
router.get('/profileData', authentication.authenticateUser, authController.profileData);
router.post('/login', authController.login);
router.post('/signup', authentication.authenticateUser, authController.signupController);
router.post('/data', authentication.authenticateUser,authController.fetchData);
router.post('/refreshToken', authController.refreshToken);
router.post('/revokedData', authController.fetchRevokedData);
router.post('/usageData', authController.fetchUsageData);
router.post('/logs', authentication.authenticateUser,authController.fetchLogsData);
router.get('/dashboard',authentication.authenticateUser,authController.dashboard);
router.post('/logout',authController.logout);
router.get('/userDetails', authentication.authenticateUser, authController.userDetails);
router.get('/userSessionInfo', authentication.authenticateUser, authController.userSessionInfo);
router.post('/cert',authController.certDetails);
router.post('/updatePassword', authentication.authenticateUser, authController.updatePasswordController);
router.post('/authorities', authentication.authenticateUser, authController.authorities)
router.post('/cards', authController.cards);
router.post('/compactCard', authController.compactCard);
router.post('/getAllAuths',authentication.authenticateUser, authController.getAllAuths)
router.post('/updateAuths',authentication.authenticateUser, authController.updateAuths)
router.get('/getSubType', authController.getSubType);
router.get('/getAllRevocationReasons', authController.getAllRevocationReasons)// reasons  from database
router.get('/generateAuthCode', authController.generateAuthCode)// generate authcode

// json routes
router.get('/region', authController.region);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
router.post('/getStatesByRegion', authController.getStatesByRegion);

router.post('/addRegion', authController.addRegion);
router.post('/updateRegion', authController.updateRegion);
router.post('/updateStatesOfRegion', authController.updateStatesOfRegion);
router.post('/moveStatesOfRegion', authController.moveStatesOfRegion);
router.post('/removeRegion', authController.removeRegion);

router.post('/certInfo',authController.certInfo);
router.post('/email',authController.emailService);
router.post('/report',authentication.authenticateUser,authController.reportGenerator);
router.post('/statusCheck',authentication.authenticateUser,authController.statusCheck);
router.post('/profileImage',authController.profileImage);

module.exports = router;