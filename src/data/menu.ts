import salmon from "@/assets/dish-salmon.jpg";
import risotto from "@/assets/dish-risotto.jpg";
import burger from "@/assets/dish-burger.jpg";
import salad from "@/assets/dish-salad.jpg";
import dessert from "@/assets/dish-dessert.jpg";
import brunch from "@/assets/dish-brunch.jpg";

export type Tag = "Veg" | "Spicy" | "Bestseller";
export type Category =
  | "Starters"
  | "Breakfast"
  | "Main Course"
  | "Lunch"
  | "Brunch"
  | "Desserts";

export type Dish = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  tags: Tag[];
  description: string;
};

export const dishes: Dish[] = [
  // Starters
  { id: "s1", name: "Crispy Calamari", price: 14, image: salad, category: "Starters", tags: ["Bestseller"], description: "Lightly battered, lemon aioli, fresh herbs" },
  { id: "s2", name: "Burrata & Heirloom", price: 16, image: salad, category: "Starters", tags: ["Veg", "Bestseller"], description: "Creamy burrata, tomato confit, basil oil" },
  { id: "s3", name: "Spiced Lamb Skewers", price: 18, image: burger, category: "Starters", tags: ["Spicy"], description: "Harissa-marinated, mint yogurt" },

  // Breakfast
  { id: "b1", name: "Truffle Scrambled Eggs", price: 17, image: brunch, category: "Breakfast", tags: ["Veg", "Bestseller"], description: "Soft farm eggs, black truffle, sourdough" },
  { id: "b2", name: "Berry Pancake Stack", price: 13, image: dessert, category: "Breakfast", tags: ["Veg"], description: "Buttermilk pancakes, maple, fresh berries" },
  { id: "b3", name: "Smoked Salmon Bagel", price: 15, image: salmon, category: "Breakfast", tags: [], description: "Cream cheese, capers, red onion" },

  // Main Course
  { id: "m1", name: "Truffle Wild Risotto", price: 24, image: risotto, category: "Main Course", tags: ["Veg", "Bestseller"], description: "Arborio rice, black truffle, parmesan" },
  { id: "m2", name: "Cedar-Grilled Salmon", price: 28, image: salmon, category: "Main Course", tags: ["Bestseller"], description: "Atlantic salmon, citrus glaze, fresh dill" },
  { id: "m3", name: "Braised Short Rib", price: 32, image: burger, category: "Main Course", tags: ["Spicy"], description: "Slow-braised, red wine jus, root vegetables" },

  // Lunch
  { id: "l1", name: "Wagyu Signature Burger", price: 22, image: burger, category: "Lunch", tags: ["Spicy", "Bestseller"], description: "A5 wagyu, brioche, sweet potato fries" },
  { id: "l2", name: "Garden Harvest Bowl", price: 16, image: salad, category: "Lunch", tags: ["Veg"], description: "Avocado, heirloom tomatoes, microgreens" },
  { id: "l3", name: "Mediterranean Wrap", price: 14, image: salad, category: "Lunch", tags: ["Veg"], description: "Grilled veggies, hummus, feta, olives" },

  // Brunch
  { id: "br1", name: "Avocado Sunrise Toast", price: 14, image: brunch, category: "Brunch", tags: ["Veg", "Bestseller"], description: "Sourdough, smashed avocado, poached egg" },
  { id: "br2", name: "Eggs Benedict Royale", price: 18, image: brunch, category: "Brunch", tags: [], description: "Smoked salmon, hollandaise, English muffin" },
  { id: "br3", name: "French Toast Brûlée", price: 15, image: dessert, category: "Brunch", tags: ["Veg"], description: "Caramelized brioche, vanilla cream" },

  // Desserts
  { id: "d1", name: "Molten Dark Chocolate", price: 12, image: dessert, category: "Desserts", tags: ["Veg", "Bestseller"], description: "Valrhona ganache, vanilla bean ice cream" },
  { id: "d2", name: "Crème Brûlée Classic", price: 11, image: dessert, category: "Desserts", tags: ["Veg"], description: "Vanilla custard, caramelized sugar crust" },
  { id: "d3", name: "Tiramisu Maison", price: 13, image: dessert, category: "Desserts", tags: ["Veg", "Bestseller"], description: "Mascarpone, espresso ladyfingers, cocoa" },
];

export const categories: Category[] = [
  "Starters",
  "Breakfast",
  "Main Course",
  "Lunch",
  "Brunch",
  "Desserts",
];
