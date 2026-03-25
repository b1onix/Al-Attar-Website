import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory database setup
let products = [
  { id: 1, name: 'Crni Oud', description: 'Dubok, misteriozan miris sa notama dimljenog drveta i začina. Savršen za večernje prilike.', notes: 'Oud, Crni Biber, Tamjan', price: 120.00, imageUrl: 'https://picsum.photos/seed/oud/800/1000?grayscale', profile: 'Oud', intensity: 'Jako', occasion: 'Večer' },
  { id: 2, name: 'Bijeli Mošus', description: 'Čist, svjež i puderast miris koji ostavlja suptilan trag.', notes: 'Mošus, Bijela Ruža, Sandalovina', price: 95.00, imageUrl: 'https://picsum.photos/seed/musk/800/1000?grayscale', profile: 'Mošus', intensity: 'Srednje', occasion: 'Svaki dan' },
  { id: 3, name: 'Ponoćna Ruža', description: 'Zavodljiva cvjetna kompozicija sa mračnim, baršunastim podtonom.', notes: 'Damask Ruža, Pačuli, Vanilija', price: 110.00, imageUrl: 'https://picsum.photos/seed/rose/800/1000?grayscale', profile: 'Cvjetni', intensity: 'Jako', occasion: 'Večer' },
  { id: 4, name: 'Pustinjski Vjetar', description: 'Suhi, drvenasti miris inspirisan beskrajnim pješčanim dinama.', notes: 'Kedar, Vetiver, Amber', price: 105.00, imageUrl: 'https://picsum.photos/seed/desert/800/1000?grayscale', profile: 'Drveni', intensity: 'Srednje', occasion: 'Svaki dan' }
];

let orders: any[] = [];
let nextOrderId = 1;
let nextProductId = 5;

// API Routes
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Proizvod nije pronađen" });
  }
});

app.post("/api/products", (req, res) => {
  const newProduct = { id: nextProductId++, ...req.body };
  products.push(newProduct);
  res.json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index !== -1) {
    products[index] = { id: parseInt(req.params.id), ...req.body };
    res.json(products[index]);
  } else {
    res.status(404).json({ error: "Proizvod nije pronađen" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ success: true });
});

app.post("/api/orders", (req, res) => {
  const { customerName, address, phone, total, items } = req.body;
  const newOrder = {
    id: nextOrderId++,
    customerName,
    address,
    phone,
    total,
    status: 'Na čekanju',
    createdAt: new Date().toISOString(),
    items: items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        name: product ? product.name : 'Nepoznat proizvod'
      };
    })
  };
  orders.push(newOrder);
  res.json({ id: newOrder.id, success: true });
});

app.get("/api/orders", (req, res) => {
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sortedOrders);
});

app.put("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (order) {
    order.status = status;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Narudžba nije pronađena" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
