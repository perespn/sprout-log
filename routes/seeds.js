const express = require("express");
const router = express.Router();
const CyclicDB = require("@cyclic.sh/dynamodb");
const passport = require("passport");
const db = CyclicDB(process.env.CYCLIC_DB);
const seeds = db.collection("seeds");
const Seed = require("../models/seed");
const { jwtAuth } = require("../services/helpers");

router.get("/", async function (req, res, next) {
  const seedArray = [];
  const data = await seeds.list();
  const keys = data.results.map((result) => result.key);
  await Promise.all(
    keys.map(async (key) => {
      let seed = new Seed(key);
      seed = await seed.get();
      seedArray.push(seed);
    })
  );
  console.log(seedArray);
  res.status(200).json(seedArray);
});

// Create new seed
router.post("/", jwtAuth, isAdmin, async function (req, res, next) {
  const { name, gelatinous, gramsPerJar, growTime, soakTime } = req.body;
  const seed = new Seed(name, gelatinous, gramsPerJar, growTime, soakTime);
  await seed.save();
  res.redirect("/admin");
});

// Delete seed
router.delete(
  "/seeds/:name",
  jwtAuth,
  isAdmin,
  async function (req, res, next) {
    const seed = new Seed(req.params.name);
    await seed.delete();
    console.info(`Deleted seed ${req.params.name}`);
    res.redirect("/admin");
  }
);

function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
