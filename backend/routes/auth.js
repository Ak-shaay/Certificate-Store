const express = require('express');
const authController = require('../controllers/storeController');
const blockchainController = require('../controllers/blockchainController');
const router = express.Router();
const authentication = require('../models/userModel');

router.get('/', authController.landingPage)
router.get('/profile', authentication.authenticateUser, authController.profile);
router.get('/profileData', authentication.authenticateUser, authController.profileData);
router.post('/login', authController.login);
router.post('/signup', authentication.authenticateUser, authController.signupController);
router.post('/signupUser', authentication.authenticateUser, authController.signupUserController);
router.post('/data', authentication.authenticateUser,authController.fetchData);
router.post('/refreshToken', authController.refreshToken);
router.post('/revokedData',authentication.authenticateUser, authController.fetchRevokedData);
router.post('/usageData',authentication.authenticateUser, authController.fetchUsageData);
router.post('/logs', authentication.authenticateUser,authController.fetchLogsData);
router.get('/dashboard',authentication.authenticateUser,authController.dashboard);
router.post('/logout',authController.logout);
router.get('/userDetails', authentication.authenticateUser, authController.userDetails);
router.get('/userSessionInfo', authentication.authenticateUser, authController.userSessionInfo);
router.post('/certificateUpload',authentication.authenticateUser,authController.certificateUpload);
router.post('/extractCert',authentication.authenticateUser,authController.extractCert);
router.post('/updatePassword', authentication.authenticateUser, authController.updatePasswordController);
router.post('/authorities', authentication.authenticateUser, authController.authorities)
router.post('/cards', authController.cards);
router.post('/compactCard', authController.compactCard);
router.post('/getAllAuths',authentication.authenticateUser, authController.getAllAuths)
router.post('/getAllUsers',authentication.authenticateUser, authController.getAllUsers)
router.post('/updateAuths',authentication.authenticateUser, authController.updateAuths)
router.post('/getSubType',authentication.authenticateUser, authController.getSubType);
router.get('/getAllRevocationReasons', authController.getAllRevocationReasons)// reasons  from database
router.get('/generateAuthCode', authController.generateAuthCode)// generate authcode
router.get('/generatePassword', authController.generatePass)// generate authcode

// json routes
router.post('/region',authentication.authenticateUser, authController.region);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
router.post('/getStatesByRegion',authentication.authenticateUser, authController.getStatesByRegion);

router.post('/changeStatus',authentication.authenticateAdmin, authController.enableAccount);
router.post('/addRegion',authentication.authenticateAdmin, authController.addRegion);
router.post('/updateStatesOfRegion',authentication.authenticateAdmin, authController.updateStatesOfRegion);
router.post('/moveStatesOfRegion',authentication.authenticateAdmin, authController.moveStatesOfRegion);
router.post('/removeRegion',authentication.authenticateAdmin, authController.removeRegion);

router.post('/certInfo',authController.certInfo);
router.post('/forgotPassword',authController.forgotPassword);
router.post('/report',authentication.authenticateUser,authController.reportGenerator);
router.post('/statusCheck',authentication.authenticateUser,authController.statusCheck);
router.post('/profileImage',authController.profileImage);



// blockchain routes
router.post('/blockchain/verify',authentication.authenticateUser,blockchainController.verifyCertificiate)
router.post('/blockchain/issuedCertiifcates',authentication.authenticateUser,blockchainController.getBlockchainData)
module.exports = router;