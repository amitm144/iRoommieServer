const express = require("express");
const router = express.Router();
const {
  getMatches,
  getSuggestions,
  updateUser,
  getActivity,
  setPreferences,
  setAction,
  checkUserType
} = require("../controllers/userController");

// Applying the checkUserType middleware to all routes
router.use(checkUserType);

// GET routes
router.get("/suggestions", getSuggestions);
router.get("/matches", getMatches);
router.get("/activity", getActivity);

// PUT routes
router.put("/update", updateUser);
router.put("/preferences", setPreferences);
router.put("/action/:targetId", setAction);

module.exports = router;



