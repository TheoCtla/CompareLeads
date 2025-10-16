# CompareLeads

Une webapp Next.js pour comparer les leads entre fichiers Sheet (suivi interne) et HubSpot (export), avec classification automatique selon des règles métier définies.

## 🚀 Fonctionnalités

- **Upload de fichiers CSV** : Interface drag-and-drop pour Sheet et HubSpot
- **Jointure intelligente** : Correspondance automatique sur email (ou autre clé configurable)
- **Filtrage automatique** : Analyse uniquement les leads avec statut vide dans Sheet
- **Classification automatique** : Règles métier pour qualifier/non qualifier les leads
- **Tableau interactif** : Tri, filtrage, pagination des résultats
- **Export CSV** : Téléchargement des résultats
- **Interface moderne** : Design responsive avec TailwindCSS et shadcn/ui

## 📋 Prérequis

- Node.js 18+ 
- pnpm (recommandé) ou npm

## 🛠️ Installation

```bash
# Cloner le projet
git clone <repository-url>
cd CompareLeads

# Installer les dépendances
pnpm install

# Lancer en développement
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Format des fichiers requis

### Fichier Sheet (Suivi interne)
- **Format** : CSV avec en-têtes
- **Colonne obligatoire** : Une colonne "statut" (ou équivalent) qui ne doit être ni "Qualifié" ni "Pas qualifié" pour les leads à analyser
- **Clé de jointure** : Email (par défaut) ou autre colonne configurable

### Fichier HubSpot (Export)
- **Format** : CSV exporté depuis HubSpot
- **Colonnes obligatoires** (casse exacte) :
  - `Phase de cycle de vie ACQUEREURS B2C`
  - `Statut du lead ACQUEREURS`
- **Clé de jointure** : Email (par défaut) ou autre colonne configurable

## 🎯 Règles de classification

### Leads Qualifiés
1. **Phase** = "Lead + (RO fait- echange email)" **ET** **Statut** = "Lead Actif - en cours"

2. **Phase** dans {"R1", "R2", "R3"} (peu importe le statut)

### Leads Exclus (ne s'affichent pas)
- **Phase** = "Lead"
- **Phase** = "Lead Marketing" 
- **Phase** = "Lead Actif - en cours"

### Leads Non qualifiés
- Tous les autres cas

## 🔧 Utilisation

1. **Upload des fichiers** : Glissez-déposez vos fichiers CSV Sheet et HubSpot
2. **Configuration** : 
   - Sélectionnez les clés de jointure (email par défaut)
   - Choisissez la colonne de statut pour Sheet
3. **Comparaison** : Cliquez sur "Comparer les données"
4. **Résultats** : Consultez le tableau avec tri/filtrage/pagination
5. **Export** : Téléchargez les résultats en CSV

## 🏗️ Architecture

```
app/
├── page.tsx              # Page principale
├── layout.tsx            # Layout global
└── globals.css           # Styles globaux

components/
├── ui/                   # Composants shadcn/ui
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── alert.tsx
├── FileDrop.tsx          # Zone de drop pour fichiers
├── CsvPreview.tsx        # Aperçu des données CSV
├── MappingForm.tsx       # Configuration de la jointure
└── ResultsTable.tsx      # Tableau des résultats

lib/
├── types.ts              # Types TypeScript
├── parseCsv.ts           # Parsing CSV avec PapaParse
├── normalize.ts          # Normalisation des données
├── classify.ts           # Règles de classification
├── join.ts               # Logique de jointure
├── exportCsv.ts          # Export des résultats
└── utils.ts              # Utilitaires généraux
```

## 🎨 Stack technique

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : TailwindCSS + shadcn/ui
- **Parsing CSV** : PapaParse
- **Tableau** : TanStack Table
- **Icons** : Lucide React
- **Client-side uniquement** : Aucun backend requis

## 🔍 Fonctionnalités avancées

- **Détection automatique** des colonnes communes
- **Normalisation** des données (trim, lowercase, accents)
- **Gestion des doublons** avec compteurs
- **Validation** des colonnes requises
- **Performance** : Optimisé pour 50k+ lignes
- **Accessibilité** : Labels, ARIA, focus states

## 🐛 Dépannage

### Erreurs courantes

1. **"Colonnes HubSpot manquantes"** : Vérifiez que votre export HubSpot contient les colonnes exactes
2. **"Aucun résultat trouvé"** : Vérifiez que la colonne de statut Sheet est bien vide pour certains leads
3. **"Erreur de parsing CSV"** : Vérifiez le format de vos fichiers CSV

### Performance

- **Fichiers volumineux** : L'application gère jusqu'à 50k lignes en mémoire
- **Optimisations** : Pagination, memoization, lazy loading
- **Navigateur** : Chrome/Firefox/Safari récents recommandés

## 📝 Notes de développement

- **Client-side uniquement** : Toutes les données restent dans le navigateur
- **Sécurité** : Aucune donnée n'est envoyée vers des serveurs externes
- **Extensibilité** : Code modulaire pour ajouter de nouvelles règles de classification
- **Tests** : Structure prête pour l'ajout de tests unitaires

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.
