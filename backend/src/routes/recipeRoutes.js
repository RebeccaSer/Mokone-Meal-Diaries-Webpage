const express = require('express');
const { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.route('/')
.get(protect, getRecipes)
.post(protect, admin, createRecipe);

router.route('/:id')
.get( getRecipeById)
.put(protect, admin, updateRecipe)
.delete(protect, admin, deleteRecipe);

module.exports = router;