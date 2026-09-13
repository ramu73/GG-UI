import React from 'react';
import { ChefHat, Clock, Flame, Sparkles } from 'lucide-react';
import '../styles/HealthRecipes.css';

export default function HealthRecipes() {
  const recipes = [
    {
      variety: "Milky Mushroom",
      tag: "Godavari Basin Classic",
      title: "Spicy Godavari Mushroom Masala",
      desc: "Thick, succulent milky mushrooms braised in caramelized onions, green chilies, roasted coriander, and fresh coconut paste.",
      time: "20 Mins",
      difficulty: "Easy",
      calories: "140 kcal"
    },
    {
      variety: "Pearl Oyster",
      tag: "Crispy Sauté",
      title: "Garlic Pepper Oyster Stir-Fry",
      desc: "Velvety oyster mushroom clusters quick-tossed in cold-pressed sesame oil, crushed black pepper, and curry leaves. Crisp & savory.",
      time: "8 Mins",
      difficulty: "Beginner",
      calories: "95 kcal"
    },
    {
      variety: "White Button",
      tag: "Aromatic Comfort",
      title: "Dhabha Style Mushroom Matar",
      desc: "Tender button mushroom caps simmered with sweet green peas in a rich spiced tomato cashew gravy with fenugreek.",
      time: "25 Mins",
      difficulty: "Medium",
      calories: "180 kcal"
    },
    {
      variety: "Lion's Mane",
      tag: "Superfood Morning",
      title: "Golden Focus Latte",
      desc: "1/2 tsp of pure Godavari Grown Lion's Mane extract whisked with warm oat or almond milk, cinnamon, and organic raw honey.",
      time: "3 Mins",
      difficulty: "Quick",
      calories: "60 kcal"
    }
  ];

  return (
    <section className="health-recipes-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Culinary Inspiration</span>
          <h2>From Farm to Your Dining Table</h2>
          <p>
            Mushroom varieties from Godavari Grown hold supreme culinary versatility, tender chew, and deep natural umami.
          </p>
        </div>

        <div className="recipes-grid">
          {recipes.map((r, i) => (
            <div key={i} className="recipe-card">
              <span className="recipe-tag">{r.tag}</span>
              <h3 className="recipe-title">{r.title}</h3>
              <p className="recipe-desc">{r.desc}</p>

              <div className="recipe-meta-row">
                <span>⏱ {r.time}</span>
                <span>🔥 {r.calories}</span>
                <span>👨‍🍳 {r.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
