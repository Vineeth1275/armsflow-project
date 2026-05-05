const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Deal = require('./models/Deal');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// test route
app.get('/', (req, res) => {
  res.send('ArmsFlow Backend + DB Connected 🚀');
});

// ------------------ BULK DATA INSERT ------------------
app.get('/add', async (req, res) => {
  try {
    await Deal.deleteMany(); // clear old data

    const sampleDeals = [
      { from: "Russia", to: "India", weapon: "Missiles", year: 2022, value: 3000 },
      { from: "USA", to: "India", weapon: "Drones", year: 2023, value: 1500 },
      { from: "France", to: "India", weapon: "Fighter Jets", year: 2021, value: 4000 },
      { from: "Israel", to: "India", weapon: "Radar Systems", year: 2020, value: 1200 },

      { from: "China", to: "Pakistan", weapon: "Missiles", year: 2022, value: 2500 },
      { from: "USA", to: "Pakistan", weapon: "Fighter Jets", year: 2019, value: 2000 },

      { from: "USA", to: "Ukraine", weapon: "Missiles", year: 2023, value: 5000 },
      { from: "Germany", to: "Ukraine", weapon: "Tanks", year: 2023, value: 3000 },

      { from: "USA", to: "Saudi Arabia", weapon: "Fighter Jets", year: 2022, value: 6000 },
      { from: "UK", to: "Saudi Arabia", weapon: "Missiles", year: 2021, value: 3500 },

      { from: "France", to: "UAE", weapon: "Jets", year: 2022, value: 4500 },

      { from: "Russia", to: "China", weapon: "Missiles", year: 2021, value: 4000 },

      { from: "USA", to: "Germany", weapon: "Missiles", year: 2022, value: 2000 },
      { from: "USA", to: "UK", weapon: "Defense Systems", year: 2023, value: 2500 },

      { from: "China", to: "Nigeria", weapon: "Weapons", year: 2021, value: 1200 },

      { from: "USA", to: "Brazil", weapon: "Aircraft", year: 2020, value: 1800 },

      { from: "Russia", to: "Iran", weapon: "Missiles", year: 2022, value: 3000 },
      { from: "Russia", to: "Syria", weapon: "Weapons", year: 2021, value: 1500 },

      { from: "Israel", to: "Azerbaijan", weapon: "Drones", year: 2022, value: 2000 }
    ];

    await Deal.insertMany(sampleDeals);

    res.send("🌍 Global dataset inserted successfully!");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ------------------ GET ALL DEALS ------------------
app.get('/deals', async (req, res) => {
  const deals = await Deal.find();
  res.json(deals);
});

// ------------------ DEPENDENCY ------------------
app.get('/dependency/:country', async (req, res) => {
  const country = req.params.country;

  const deals = await Deal.find({ to: country });

  let total = 0;
  let supplierMap = {};

  deals.forEach(deal => {
    total += deal.value;

    if (!supplierMap[deal.from]) {
      supplierMap[deal.from] = 0;
    }
    supplierMap[deal.from] += deal.value;
  });

  let result = [];

  for (let supplier in supplierMap) {
    result.push({
      supplier,
      percentage: ((supplierMap[supplier] / total) * 100).toFixed(2)
    });
  }

  res.json(result);
});

// ------------------ RISK ------------------
app.get('/risk/:country', async (req, res) => {
  const country = req.params.country;

  const deals = await Deal.find({ to: country });

  let total = 0;
  let highRiskWeapons = ["Missiles", "Nuclear", "Fighter Jets"];

  deals.forEach(deal => {
    total += deal.value;

    if (highRiskWeapons.includes(deal.weapon)) {
      total += 1000;
    }
  });

  let riskLevel = "Low";

  if (total > 5000) {
    riskLevel = "High";
  } else if (total > 2000) {
    riskLevel = "Medium";
  }

  res.json({
    country,
    riskLevel
  });
});

// ------------------ INFLUENCE ------------------
app.get('/influence/:country', async (req, res) => {
  const country = req.params.country;

  const deals = await Deal.find({ from: country });

  let countriesSet = new Set();
  let totalValue = 0;

  deals.forEach(deal => {
    countriesSet.add(deal.to);
    totalValue += deal.value;
  });

  let influenceScore = countriesSet.size * 10 + totalValue / 1000;

  res.json({
    country,
    influenceScore: influenceScore.toFixed(2),
    countriesSupplied: countriesSet.size
  });
});

// ------------------ START SERVER ------------------
app.listen(5000, () => {
  console.log('Server running on port 5000 🚀');
});