import express from "express";
import cors from "cors";

const app = express();

// --- 1. AJUSTE DO CORS (Exigência do Professor) ---
// O professor pede para restringir as origens em vez de usar cors() vazio
const corsOptions = {
    origin: [
        "https://front2-nine.vercel.app", // O seu front-end na Vercel
        // Quando rodar o front no codespaces, você adiciona a URL dele aqui embaixo:
        // "https://SEU-CODESPACE-NAME-8080.app.github.dev" 
    ],
    methods: "GET,POST,PUT,DELETE,PATCH", // Adicionei PATCH pois sua API de itens utiliza
    allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
// -------------------------------------------------

app.use(express.json());

const VERSION = process.env.APP_VERSION || "dev";

let nextId = 1;
const items = [];

// --- 2. ROTA BASE '/' ---
// Mantive o seu padrão JSON, apenas adicionei o '/v1' na lista de endpoints
app.get("/", (req, res) => {
    res.json({ status: "ok", version: VERSION, endpoints: ["/health", "/items", "/v1"] });
});

// --- 3. NOVA ROTA '/v1' (Exigência do Professor) ---
app.get("/v1", (req, res) => {
    // Pega a data e hora atual no formato brasileiro
    const dataAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    
    res.json({
        message: "Api v1 respondendo no container docker...",
        chamada_em: dataAtual
    });
});
// --------------------------------------------------

// Suas rotas originais mantidas intactas
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

// --- 4. AJUSTE DA PORTA (Exigência do Professor) ---
// O professor pede a porta 5000 no Docker e no server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on ${port} (version=${VERSION})`));