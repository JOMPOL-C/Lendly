const express = require("express");
const router = express.Router();
const favoriteController = require("../Controllers/favoriteController");

router.post("/favorites/add", favoriteController.addFavorite);
router.get("/favorites", favoriteController.getFavorites);
router.delete("/favorites/:id", favoriteController.removeFavorite);

module.exports = router;
