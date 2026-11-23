import { createContext, useContext, useState } from 'react'

const translations = {
  fr: {
    // Connexion / Inscription
    app_desc: "Marre de Google Forms ? Reprends le contrôle. 🤘",
    app_sub: "Crée des formulaires stylés, partage-les, et analyse les résultats. C'est fun, c'est gratuit, et ça t'appartient. 🚀",
    why_login: "💡 Pourquoi se connecter ?",
    why_login_desc: "Ton compte te permet de garder tes formulaires privés et de voir qui a répondu. Les gens qui répondent à tes liens n'ont pas besoin de compte !",
    login: "Connexion",
    signup: "Inscription",
    email: "Email",
    password: "Mot de passe",
    btn_login: "Se connecter",
    btn_signup: "S'inscrire",
    logout: "Déconnexion",
    
    // Navigation
    my_forms: "Mes formulaires",
    create_form: "Créer un formulaire",
    
    // Formulaires
    no_forms: "Aucun formulaire pour l'instant. Crée le premier !",
    draft: "Brouillon",
    online: "En ligne",
    results: "Résultats",
    view: "Voir",
    link: "Lien",
    publish: "Publier",
    unpublish: "Dépublier",
    delete: "Supprimer",
    
    // Création
    create_title: "Créer un formulaire",
    form_title: "Titre du formulaire *",
    form_desc: "Description",
    image_upload: "Image d'illustration (optionnel)",
    choose_image: "📷 Choisir une image",
    remove_image: "Supprimer",
    choose_theme: "Choisir un thème visuel",
    questions: "Questions",
    question_num: "Question",
    question_label: "Intitulé de la question *",
    question_type: "Type de réponse",
    options_placeholder: "Options (séparées par des virgules)",
    required: "Réponse obligatoire",
    delete_q: "Supprimer",
    add_q: "Ajouter une nouvelle question",
    creating: "Création en cours…",
    create_btn: "Créer le formulaire 🚀",
    
    // Dashboard
    dashboard: "Tableau de bord",
    dashboard_sub: "Analyse des performances de ton formulaire.",
    export_csv: "Export CSV",
    export_json: "Export JSON",
    total_responses: "Total Réponses",
    global_avg: "Moyenne globale",
    median: "Médiane",
    mode: "Mode",
    std_dev: "Écart-type",
    timeline: "Volume de réponses dans le temps",
    show_word_cloud: "Afficher le nuage de mots ☁️",
    hide_word_cloud: "Masquer le nuage de mots",
    word_cloud: "Nuage de mots (Questions textuelles)",
    show_raw: "Afficher le détail des réponses brutes",
    hide_raw: "Masquer le détail des réponses",
    no_data: "Aucune donnée pour le moment.",
    
    // Settings
    settings: "Paramètres",
    theme: "Thème",
    light: "☀️ Clair",
    dark: "🌙 Sombre",
    text_size: "Taille du texte",
    small: "Petit",
    normal: "Normal",
    large: "Grand",
    accent_color: "Couleur d'accent",
    ambiance: "Ambiance",
    none: "Aucune",
    winter: "❄️ Hiver",
    spring: "🌸 Printemps",
    summer: "☀️ Été",
    autumn: "🍂 Automne",
    music: "Musique"
  },
  en: {
    // Login / Register
    app_desc: "Tired of Google Forms? Take back control. 🤘",
    app_sub: "Create stylish forms, share them, and analyze the results. It's fun, it's free, and it's yours. 🚀",
    why_login: "💡 Why log in?",
    why_login_desc: "Your account lets you keep your forms private and see who responded. People answering your links don't need an account!",
    login: "Login",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    btn_login: "Log in",
    btn_signup: "Sign up",
    logout: "Log out",
    
    // Navigation
    my_forms: "My Forms",
    create_form: "Create a Form",
    
    // Forms
    no_forms: "No forms yet. Create the first one!",
    draft: "Draft",
    online: "Online",
    results: "Results",
    view: "View",
    link: "Link",
    publish: "Publish",
    unpublish: "Unpublish",
    delete: "Delete",
    
    // Creation
    create_title: "Create a Form",
    form_title: "Form Title *",
    form_desc: "Description",
    image_upload: "Cover Image (optional)",
    choose_image: "📷 Choose an image",
    remove_image: "Remove",
    choose_theme: "Choose a visual theme",
    questions: "Questions",
    question_num: "Question",
    question_label: "Question Label *",
    question_type: "Answer Type",
    options_placeholder: "Options (comma separated)",
    required: "Required answer",
    delete_q: "Delete",
    add_q: "Add a new question",
    creating: "Creating…",
    create_btn: "Create Form 🚀",
    
    // Dashboard
    dashboard: "Dashboard",
    dashboard_sub: "Analyze your form's performance.",
    export_csv: "Export CSV",
    export_json: "Export JSON",
    total_responses: "Total Responses",
    global_avg: "Global Average",
    median: "Median",
    mode: "Mode",
    std_dev: "Std Dev",
    timeline: "Response Volume over Time",
    show_word_cloud: "Show Word Cloud ☁️",
    hide_word_cloud: "Hide Word Cloud",
    word_cloud: "Word Cloud (Textual Questions)",
    show_raw: "Show raw answers",
    hide_raw: "Hide raw answers",
    no_data: "No data yet.",
    
    // Settings
    settings: "Settings",
    theme: "Theme",
    light: "☀️ Light",
    dark: "🌙 Dark",
    text_size: "Text Size",
    small: "Small",
    normal: "Normal",
    large: "Large",
    accent_color: "Accent Color",
    ambiance: "Ambiance",
    none: "None",
    winter: "❄️ Winter",
    spring: "🌸 Spring",
    summer: "☀️ Summer",
    autumn: "🍂 Autumn",
    music: "Music"
  }
}

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('app-lang') || 'fr')

  function changeLang(newLang) {
    setLang(newLang)
    localStorage.setItem('app-lang', newLang)
  }

  // La fonction magique qui traduit
  const t = (key) => {
    return translations[lang][key] || key
  }

  return (
    <I18nContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}