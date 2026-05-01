import express from "express";

const app = express();
app.use(express.json());

const VERSION = process.env.APP_VERSION || "dev";

let nextId = 1;
const items = [];

app.get("/health", (req, res) => {
  res.json({ status: "ok", version: VERSION });
});

app.get("/items", (req, res) => {
  const status = String(req.query.status || "pending").toLowerCase();

  let result = items;
  if (status === "pending") result = items.filter((i) => !i.bought);
  else if (status === "bought") result = items.filter((i) => i.bought);
  else if (status === "all") result = items;

  res.json(result);
});

app.post("/items", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const quantity = Number(req.body?.quantity);

  if (!name) return res.status(400).json({ error: "name is required" });
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "quantity must be a number > 0" });
  }

  const item = {
    id: nextId++,
    name,
    quantity,
    bought: false,
    createdAt: new Date().toISOString(),
    boughtAt: null
  };

  items.push(item);
  res.status(201).json(item);
});

app.patch("/items/:id/toggle", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((i) => i.id === id);
  if (!item) return res.status(404).json({ error: "item not found" });

  item.bought = !item.bought;
  item.boughtAt = item.bought ? new Date().toISOString() : null;

  res.json(item);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on ${port} (version=${VERSION})`));