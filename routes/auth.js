const express = require("express");
const authController = require("../controllers/auth.js");
const adminController = require("../controllers/authAdmin.js");

const router = express.Router();

router.post('/register', authController.register)
router.post('/login',  authController.login);
router.post('/verify-email',  authController.emailverification);
router.post('/verify-code',  authController.verifycode);
router.get('/logout', authController.logout);
router.post('/view', authController.isLoggedIn,  authController.viewcandidate);
router.post('/verify-signature', authController.isLoggedIn,  authController.verifysignature);
router.post('/cast-vote', authController.isLoggedIn, authController.castvote);


//ADMIN ROUTE
router.post('/admin-login',  adminController.adminLogin);
router.get('/admin-logout', adminController.adminLogout);
router.post('/admin-view-vote',  authController.isLoggedIn, adminController.viewvote);
router.post('/admin-create-election',  authController.isLoggedIn, adminController.createelection);
router.post('/admin-election-edit',  authController.isLoggedIn, adminController.editelection);
router.post('/admin-election-delete',  authController.isLoggedIn, adminController.deleteelection);
router.post('/admin-edit',  authController.isLoggedIn, adminController.edit);
router.post('/admin-delete',  authController.isLoggedIn, adminController.delete);
router.post('/admin-search-candidate',  authController.isLoggedIn, adminController.searchcandidate);
router.post('/admin-add-candidate',  authController.isLoggedIn, adminController.addcandidate);
router.post('/admin-validation-ecdsa',  authController.isLoggedIn, adminController.validationECDSA);
router.post('/admin-validation-rsa',  authController.isLoggedIn, adminController.validationRSA);
router.post('/admin-validate-result-ecdsa',  authController.isLoggedIn, adminController.validateResultsECDSA);
router.post('/admin-validate-result-rsa',  authController.isLoggedIn, adminController.validateResultsRSA);
router.post('/admin-view-result-ecdsa',  authController.isLoggedIn, adminController.generateResultECDSA);
router.post('/admin-view-result-rsa',  authController.isLoggedIn, adminController.generateResultRSA);
router.post('/admin-declare-winner-ecdsa',  authController.isLoggedIn, adminController.declarewinnerECDSA);
router.post('/admin-declare-winner-rsa',  authController.isLoggedIn, adminController.declarewinnerRSA);

module.exports = router;