require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Debug
console.log("MONGO_URI:", MONGO_URI ? "✅ Presente" : "❌ Ausente");
console.log("JWT_SECRET:", JWT_SECRET ? "✅ Presente" : "❌ Ausente");

// Conexão MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado ao MongoDB Atlas"))
.catch(err => {
  console.error("❌ Erro na conexão MongoDB:", err.message);
  process.exit(1);
});

// Modelo Usuario (se não quiser arquivo separado)
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha_hash: { type: String, required: true }
}, { timestamps: true }));

// Rotas
app.get("/", (req, res) => {
  res.send("Servidor rodando e banco conectado!");
});

app.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    console.log("Cadastro recebido:", { nome, email });

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ erro: "Email já cadastrado" });

    const senha_hash = await bcrypt.hash(senha, 12);
    const novoUsuario = new Usuario({ nome, email, senha_hash });
    await novoUsuario.save();

    res.status(201).json({ msg: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    if (err.code === 11000) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log("Login attempt:", email);

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const valido = await bcrypt.compare(senha, usuario.senha_hash);
    if (!valido) return res.status(401).json({ erro: "Senha incorreta" });

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ 
      msg: "Login realizado com sucesso", 
      token,
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email }
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});