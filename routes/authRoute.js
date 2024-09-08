const express = require("express");
const router = express.Router();
const passport = require("passport");
const upload = require("../middleware/multer");
const authController = require("../controllers/authController");

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleAuthCallback
);
router.get('/testRoommate', authController.testRoommate);
router.get('/testApartment', authController.testApartment);
router.get('/current-user', authController.getCurrentUser);
router.post("/register/complete/roommate", upload.array('images', 1),authController.completeRoommateRegistration);
router.post("/register/complete/apartment", upload.array('images', 5), authController.completeApartmentRegistration);
router.post("/register/bulk", authController.bulkRegistration); 
router.get('/logout', authController.logout);

module.exports = router;


