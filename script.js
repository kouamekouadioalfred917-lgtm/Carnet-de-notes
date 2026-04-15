// On stocke les notes dans un tableau
let notes = [];

function ajouterNote() {
  // On récupère les valeurs des champs
  let matiere = document.getElementById("matiere").value;
  let note = parseFloat(document.getElementById("note").value);
  let coefficient = parseFloat(document.getElementById("coefficient").value);

  // On vérifie que les champs ne sont pas vides
  if (matiere === "" || isNaN(note) || isNaN(coefficient)) {
    alert("Remplis tous les champs !");
    return;
  }

  // On ajoute la note au tableau
  notes.push({ matiere, note, coefficient });

  // On vide les champs
  document.getElementById("matiere").value = "";
  document.getElementById("note").value = "";
  document.getElementById("coefficient").value = "";

  // On met à jour l'affichage
  afficherNotes();
  calculerMoyenne();
}

function afficherNotes() {
  let tbody = document.getElementById("tableau-notes");
  tbody.innerHTML = "";

  notes.forEach(function(n, index) {
    tbody.innerHTML += `
      <tr>
        <td>${n.matiere}</td>
        <td>${n.note}</td>
        <td>${n.coefficient}</td>
        <td><button onclick="supprimerNote(${index})">🗑️</button></td>
      </tr>
    `;
  });
}

function supprimerNote(index) {
  notes.splice(index, 1);
  afficherNotes();
  calculerMoyenne();
}

function calculerMoyenne() {
  if (notes.length === 0) {
    document.getElementById("moyenne").textContent = "--";
    return;
  }

  let totalPoints = 0;
  let totalCoefficients = 0;

  notes.forEach(function(n) {
    totalPoints += n.note * n.coefficient;
    totalCoefficients += n.coefficient;
  });

  let moyenne = (totalPoints / totalCoefficients).toFixed(2);
  document.getElementById("moyenne").textContent = moyenne + " / 20";
}