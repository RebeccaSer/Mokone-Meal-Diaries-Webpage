CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Uers and Authentication
Create TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expiry TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- family tokens
CREATE TABLE IF NOT EXISTS family_tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    main_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_code VARCHAR(64) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by_user_id UUID REFERENCES users(id) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- recipes
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,,
    servings_min INT DEFAULT 2,
    servings_max INT DEFAULT 4,
    image_url VARCHAR(500),
    cuisine VARCHAR(50),
    created_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT FALSE,
    popularity_score FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- measurements units
CREATE TABLE IF NOT EXISTS measurement_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    base_unit VARCHAR(20),
    conversion_factor FLOAT
);

-- ingredients
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(50)
);

-- recipe ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_id INT REFERENCES measurement_units(id)
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- STORES
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- sTORE PACK SIZES
CREATE TABLE IF NOT EXISTS store_pack_sizes (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id),
    ingredient_id INT REFERENCES ingredients(id),
    pack_quantity DECIMAL(10,2) NOT NULL,
    unit_id INT REFERENCES measurement_units(id),
    is_primary BOOLEAN DEFAULT FALSE
);

-- meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE (family_owner_id, week_start_date)
);

-- meal plan entries
CREATE TABLE IF NOT EXISTS meal_plan_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    custom_meal_name VARCHAR(255),
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    meal_type VARCHAR(20) NOT NULL,
    servings INT NOT NULL DEFAULT 2 CHECK (servings BETWEEN 1 AND 10),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Grocery lists
CREATE TABLE grocery_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    store_id INT REFERENCES stores(id),
    generated_at TIMESTAMP DEFAULT NOW(),
    is_final BOOLEAN DEFAULT FALSE
);

-- Grocery items
CREATE TABLE grocery_items (
    grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id),
    rounded_quantity DECIMAL(10,2) NOT NULL,
    unit_id INT REFERENCES measurement_units(id),
    is_checked BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (grocery_list_id, ingredient_id)
);

-- Q&A
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    question TEXT NOT NULL,
    answer TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    answered_at TIMESTAMP
);

-- User flags
CREATE TABLE user_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    reason TEXT,
    strike_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Admin notifications
CREATE TABLE admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    reference_id UUID,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Missing recipe requests
CREATE TABLE missing_recipe_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    recipe_name VARCHAR(200) NOT NULL,
    ingredients TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    notified_admin BOOLEAN DEFAULT FALSE
);