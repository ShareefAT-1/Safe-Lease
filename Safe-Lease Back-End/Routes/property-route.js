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
const upload = require("../middleware/uploadMiddleware");

router.get("/search", searchProperties);

router.get("/", getAllProperties);

router.get("/:id", getPropertyById);

router.get(
  "/owner/:userId",
  authMiddleware,
  roleMiddleware("landlord"),
  getPropertiesByOwner
);

router.get("/landlord/:landlordId", getPropertiesByLandlordPublic);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("landlord"),
  upload.array("images", 5),
  createProperty
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("landlord"),
  upload.array("images", 5),
  updateProperty
);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("landlord"),
  deleteProperty
);

module.exports = router;
