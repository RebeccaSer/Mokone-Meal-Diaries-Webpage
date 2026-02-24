import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MealPlanner from './pages/MealPlanner';
import GroceryList from './pages/GroceryList';

function App() {
  return (
     <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/meal-planner" element={<MealPlanner />} />
        <Route path="/grocery-list" element={<GroceryList />} />
      </Routes>
    </div>
  );
}

export default App
