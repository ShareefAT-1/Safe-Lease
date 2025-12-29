const express = require("express");
const router = express.Router();

const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertiesByOwner,
  getPropertiesByLandlordPublic,
  updateProperty,
  deleteProperty,
  searchProperties,
} = require("../Controllers/property-Controller");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// =======================
// SEARCH (PUBLIC)
// =======================
router.get("/search", searchProperties);

// =======================
// GET ALL PROPERTIES (PUBLIC)
// =======================
router.get("/", getAllProperties);

// =======================
// GET PROPERTY BY ID (PUBLIC)
// =======================
router.get("/:id", getPropertyById);

// =======================
// LANDLORD ROUTES
// =======================
router.get(
  "/owner/:userId",
  authMiddleware,
  roleMiddleware("landlord"),
  getPropertiesByOwner
);

router.get("/landlord/:landlordId", getPropertiesByLandlordPublic);

// =======================
// CREATE / UPDATE / DELETE
// =======================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("landlord"),
  createProperty
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("landlord"),
  updateProperty
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("landlord"),
  deleteProperty
);

module.exports = router;
