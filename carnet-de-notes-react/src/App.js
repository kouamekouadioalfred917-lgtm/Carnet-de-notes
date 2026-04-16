import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState([]);
  const [matiere, setMatiere] = useState("");
  const [note, setNote] = useState("");
  const [coefficient, setCoefficient] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (token) {
      fetch(`${API}/notes`, {
        headers: { authorization: token }
      })
        .then(res => res.json())
        .then(data => setNotes(data));
    }
  }, [token]);

  async function inscrire() {
    const res = await fetch(`${API}/inscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setErreur("Compte créé ! Connecte-toi.");
      setPage("connexion");
    } else {
      setErreur(data.message);
    }
  }

  async function connecter() {
    const res = await fetch(`${API}/connexion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      setErreur(data.message);
    }
  }

  function deconnecter() {
    localStorage.removeItem("token");
    setToken(null);
    setNotes([]);
  }

  async function ajouterNote() {
    if (matiere === "" || note === "" || coefficient === "") {
      alert("Remplis tous les champs !");
      return;
    }
    const res = await fetch(`${API}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token
      },
      body: JSON.stringify({
        matiere,
        note: parseFloat(note),
        coefficient: parseFloat(coefficient)
      })
    });
    const nouvelleNote = await res.json();
    setNotes([...notes, nouvelleNote]);
    setMatiere("");
    setNote("");
    setCoefficient("");
  }

  async function supprimerNote(id) {
    await fetch(`${API}/notes/${id}`, {
      method: "DELETE",
      headers: { authorization: token }
    });
    setNotes(notes.filter(n => n.id !== id));
  }

  function calculerMoyenne() {
    if (notes.length === 0) return "--";
    let totalPoints = 0;
    let totalCoeff = 0;
    notes.forEach(n => {
      totalPoints += parseFloat(n.note) * parseFloat(n.coefficient);
      totalCoeff += parseFloat(n.coefficient);
    });
    return (totalPoints / totalCoeff).toFixed(2);
  }

  // Page de connexion / inscription
  if (!token) {
    return (
      <div className="App">
        <header>
          <h1>📚 Mon Carnet de Notes</h1>
        </header>
        <main>
          <section style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button onClick={() => setPage("connexion")}
                style={{ backgroundColor: page === "connexion" ? "#2c3e50" : "#3498db" }}>
                Connexion
              </button>
              <button onClick={() => setPage("inscription")}
                style={{ backgroundColor: page === "inscription" ? "#2c3e50" : "#3498db" }}>
                Inscription
              </button>
            </div>
            {erreur && <p style={{ color: "red", marginBottom: "10px" }}>{erreur}</p>}
            <div className="formulaire" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <label>Email :</label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com" style={{ width: "100%" }} />
              <label>Mot de passe :</label>
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********" style={{ width: "100%" }} />
              <button onClick={page === "connexion" ? connecter : inscrire}>
                {page === "connexion" ? "Se connecter" : "S'inscrire"}
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Page principale
  return (
    <div className="App">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>📚 Mon Carnet de Notes</h1>
        <button onClick={deconnecter} style={{ backgroundColor: "#e74c3c" }}>
          Déconnexion
        </button>
      </header>

      <main>
        <section>
          <h2>Ajouter une note</h2>
          <div className="formulaire">
            <label>Matière :</label>
            <input type="text" value={matiere}
              onChange={e => setMatiere(e.target.value)}
              placeholder="Ex: Mathématiques" />
            <label>Note :</label>
            <input type="number" value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex: 15" />
            <label>Coefficient :</label>
            <input type="number" value={coefficient}
              onChange={e => setCoefficient(e.target.value)}
              placeholder="Ex: 3" />
            <button onClick={ajouterNote}>Ajouter</button>
          </div>
        </section>

        <section>
          <h2>Mes notes</h2>
          <table>
            <thead>
              <tr>
                <th>Matière</th>
                <th>Note</th>
                <th>Coefficient</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n.id}>
                  <td>{n.matiere}</td>
                  <td>{n.note}</td>
                  <td>{n.coefficient}</td>
                  <td>
                    <button onClick={() => supprimerNote(n.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Moyenne générale</h2>
          <p>Ta moyenne : <span className="moyenne">{calculerMoyenne()}</span></p>
        </section>
      </main>

      <footer>
        <p>Mon carnet de notes — 2026</p>
      </footer>
    </div>
  );
}

export default App;