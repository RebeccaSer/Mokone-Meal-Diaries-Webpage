const db = require('../config/db');

const getRecipes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT r.id, r.title, r.description, r.image_url, r.servings_min, r.servings_max, r.created_at, r.popularity_score
            FROM recipes AS r
            WHERE r.is_published = true
        `;
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (r.title ILIKE $${params.length}`;
        }

        query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const recipeResult = await db.query(`
            SELECT r.id, r.title, r.description, r.image_url, r.servings_min, r.servings_max, r.created_at, r.popularity_score
            FROM recipes AS r
            WHERE r.id = $1 AND r.is_published = true
        `, [id]);


        if (recipeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const recipe = recipeResult.rows[0];

        const ingredientsResult = await db.query(`
            SELECT i.name, ri.quantity, ri.unit
            FROM recipe_ingredients AS ri
            JOIN ingredients AS i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = $1
        `, [id]);
        
        recipe.ingredients = ingredientsResult.rows;

        res.json(recipe);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createRecipe = async (req, res) => {
    const { title, description, instructions, servings_min, servings_max, image_url,ingredients } = req.body;

    if (!title || !instructions || !servings_min || !servings_max || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await db.query('BEGIN');

    try {
        const recipeResult = await db.query(`
            INSERT INTO recipes (title, description, instructions, servings_min, servings_max, image_url, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
        `, [title, description, instructions, servings_min, servings_max, image_url, req.user.id]);

        const recipe_id = recipeResult.rows[0].id;

        for (const ingredient of ingredients) {
            const { name, quantity, unit } = ingredient;

            let ingredient_id;
            const existing = await db.query(`SELECT id FROM ingredients WHERE name = $1`, [name]);
            if (existing.rows.length > 0) {
                ingredient_id = existing.rows[0].id;
            } else {
                const newIngredient = await db.query(`INSERT INTO ingredients (name) VALUES ($1) RETURNING id`, [name]);
                ingredient_id = newIngredient.rows[0].id;
            }

            const unitResult = await db.query(`SELECT id FROM measurement_units WHERE name = $1`, [unit]);
            if (unitResult.rows.length === 0) {
                throw new Error(`Measurement unit '${unit}' not found`);
            }
            const unit_id = unitResult.rows[0].id;

            await db.query(`
                INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id)
                VALUES ($1, $2, $3, $4)
            `, [recipe_id, ingredient_id, quantity, unit_id]);
        }

        await db.query('COMMIT');
        res.status(201).json({ message: 'Recipe created successfully', id: recipe_id });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { title, description, instructions, servings_min, servings_max, image_url, ingredients } = req.body;

    res.json({ message: 'Update recipe endpoint - to be implemented' });
};

const deleteRecipe = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`DELETE FROM recipes WHERE id = $1 AND created_by = $2`, [id]);
        res.json({ message: 'Recipe deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
};