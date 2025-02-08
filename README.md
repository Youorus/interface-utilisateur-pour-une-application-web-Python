# 🎝️ JustStreamIt

JustStreamIt est une application web de vidéos à la demande permettant aux utilisateurs de découvrir des films populaires, de filtrer par catégories, et d'accéder aux détails des films via une interface intuitive.

---

## 🚀 Fonctionnalités

- 🎜 **Affichage du meilleur film** avec les détails les plus populaires.
- 🔀 **Découverte de films par catégorie aléatoire**.
- 📂 **Filtrage des films par genre** grâce à un menu déroulant.
- 📊 **Pagination dynamique** avec des boutons "Voir plus" adaptés aux écrans mobiles et tablettes.
- 📱 **Interface responsive**, optimisée pour les smartphones, tablettes et ordinateurs.
- 🗂️ **Détails complets des films** dans un modal interactif (affiche, synopsis, réalisateurs, casting).

---

## 🛠️ Technologies utilisées

### 🌟 Frontend :

- HTML5
- CSS3 (avec [Bootstrap 5.3](https://getbootstrap.com/) pour le responsive design)
- JavaScript (ES6+)

### 🚀 Backend :

- API REST (consommation d'une API pour la récupération des films et des genres)

---

## ⚙️ Installation et Configuration

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/votre-utilisateur/juststreamit.git
   cd juststreamit
   ```

2. **Ouvrir le projet :**

   Ouvrez le dossier dans votre éditeur de code préféré (VS Code, WebStorm, etc.).

3. **Lancer l'application :**

   Ouvrez directement le fichier `index.html` dans votre navigateur, ou servez-le via un serveur local pour de meilleures performances :

   ```bash
   # Si vous avez Python installé
   python -m http.server
   ```

   Accédez ensuite à [http://localhost:8000](http://localhost:8000).

4. **Configurer l'API (optionnel) :**

   Si vous utilisez une API personnalisée, mettez à jour l'URL de l'API dans le fichier `api.js` :

   ```javascript
   const API_BASE_URL = "http://localhost:8000/api/v1";
   ```

---

## 📋 Structure du Projet

```
juststreamit/
├── index.html          # Page principale de l'application
├── styles.css          # Feuille de style principale
├── service/
│   └── api.js          # Fichier JavaScript pour les appels API
├── assets/             # Images, logos et autres fichiers statiques
└── README.md           # Ce fichier README
```

---

## 📱 Responsive Design

- Les **boutons "Voir plus"** sont visibles uniquement sur les écrans de type **tablette et mobile** grâce à des media queries CSS.
- Interface optimisée pour tous les appareils grâce à **Bootstrap 5**.

---

## 🐛 Fonctionnalités futures / Améliorations possibles

- 🔎 **Recherche de films** par titre.
- ⭐ **Système de notation des films** par les utilisateurs.
- 🗃️ **Ajout d'une section "Favoris"** pour sauvegarder les films préférés.
- 🌍 **Support multilingue** (français, anglais, etc.).

---

## 🙌 Contributeurs

- **Développeur principal :** Marc
- **Technologies :** Frontend (HTML, CSS, JS), Intégration d'API REST

---
