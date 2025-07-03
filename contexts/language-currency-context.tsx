"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "en" | "es" | "fr" | "de" | "it" | "pt"
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "INR" | "BRL"

export const languageData = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italiano", flag: "🇮🇹" },
  pt: { name: "Português", flag: "🇵🇹" },
}

export const currencyData = {
  USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸", region: "North America" },
  EUR: { name: "Euro", symbol: "€", flag: "🇪🇺", region: "Europe" },
  GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧", region: "Europe" },
  JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", region: "Asia" },
  CAD: { name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", region: "North America" },
  AUD: { name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", region: "Oceania" },
  CHF: { name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", region: "Europe" },
  CNY: { name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", region: "Asia" },
  INR: { name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", region: "Asia" },
  BRL: { name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", region: "South America" },
}

interface LanguageCurrencyContextType {
  language: Language
  currency: Currency
  setLanguage: (lang: Language) => void
  setCurrency: (curr: Currency) => void
  t: (key: string) => string
  formatCurrency: (amount: number) => string
  isLoaded: boolean
}

const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Invoices",
    "nav.expenses": "Expenses",
    "nav.clients": "Clients",
    "nav.reports": "Reports",
    "nav.ai_assistant": "AI Assistant",
    "nav.search_analytics": "Search Analytics",
    "nav.search_insights": "Search Insights",
    "nav.team_search": "Team Search",
    "nav.ambient_music": "Ambient Music",
    "nav.scanner": "Scanner",
    "nav.reminders": "Reminders",
    "nav.virtual_office": "Virtual Office",
    "nav.ai_predictions": "AI Predictions",
    "nav.blockchain_invoices": "Blockchain Invoices",
    "nav.system_health": "System Health",
    "nav.temporal_analysis": "Temporal Analysis",
    "nav.circuit_breakers": "Circuit Breakers",
    "nav.ml_cascade_prediction": "ML Cascade Prediction",
    "nav.settings": "Settings",
    "nav.sign_out": "Sign Out",
    "nav.cms": "CMS",

    // Dashboard
    "dashboard.welcome": "Welcome to INVOXA",
    "dashboard.subtitle": "Here's what's happening with your business today.",
    "dashboard.total_revenue": "Total Revenue",
    "dashboard.invoices": "Invoices",
    "dashboard.clients": "Clients",
    "dashboard.expenses": "Expenses",
    "dashboard.recent_invoices": "Recent Invoices",
    "dashboard.recent_expenses": "Recent Expenses",
    "dashboard.latest_invoice_activity": "Latest invoice activity",
    "dashboard.latest_expense_activity": "Latest expense activity",
    "dashboard.view_all": "View All",
    "dashboard.create_new": "Create New",
    "dashboard.last_month": "from last month",

    // Invoice Status
    "status.paid": "Paid",
    "status.pending": "Pending",
    "status.overdue": "Overdue",

    // Categories
    "category.office": "Office",
    "category.software": "Software",
    "category.travel": "Travel",

    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.currency": "Currency",
    "settings.theme": "Theme",
    "settings.notifications": "Notifications",
    "settings.account": "Account",
    "settings.security": "Security",
    "settings.billing": "Billing",
    "settings.integrations": "Integrations",
    "settings.language_description": "Select your preferred language",
    "settings.currency_description": "Choose your default currency",
    "settings.theme_description": "Choose your preferred theme",
    "settings.notifications_description": "Manage your notification preferences",
    "settings.account_description": "Manage your account information",
    "settings.security_description": "Security and privacy settings",
    "settings.billing_description": "Billing and subscription settings",
    "settings.integrations_description": "Connect with third-party services",

    // Languages
    "language.english": "English",
    "language.spanish": "Spanish",
    "language.french": "French",
    "language.german": "German",
    "language.italian": "Italian",
    "language.portuguese": "Portuguese",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.import": "Import",
  },
  es: {
    // Navigation
    "nav.dashboard": "Panel",
    "nav.invoices": "Facturas",
    "nav.expenses": "Gastos",
    "nav.clients": "Clientes",
    "nav.reports": "Reportes",
    "nav.ai_assistant": "Asistente IA",
    "nav.search_analytics": "Análisis de Búsqueda",
    "nav.search_insights": "Perspectivas de Búsqueda",
    "nav.team_search": "Búsqueda en Equipo",
    "nav.ambient_music": "Música Ambiental",
    "nav.scanner": "Escáner",
    "nav.reminders": "Recordatorios",
    "nav.virtual_office": "Oficina Virtual",
    "nav.ai_predictions": "Predicciones IA",
    "nav.blockchain_invoices": "Facturas Blockchain",
    "nav.system_health": "Salud del Sistema",
    "nav.temporal_analysis": "Análisis Temporal",
    "nav.circuit_breakers": "Disyuntores",
    "nav.ml_cascade_prediction": "Predicción ML Cascada",
    "nav.settings": "Configuración",
    "nav.sign_out": "Cerrar Sesión",
    "nav.cms": "CMS",

    // Dashboard
    "dashboard.welcome": "Bienvenido a INVOXA",
    "dashboard.subtitle": "Esto es lo que está pasando con tu negocio hoy.",
    "dashboard.total_revenue": "Ingresos Totales",
    "dashboard.invoices": "Facturas",
    "dashboard.clients": "Clientes",
    "dashboard.expenses": "Gastos",
    "dashboard.recent_invoices": "Facturas Recientes",
    "dashboard.recent_expenses": "Gastos Recientes",
    "dashboard.latest_invoice_activity": "Última actividad de facturas",
    "dashboard.latest_expense_activity": "Última actividad de gastos",
    "dashboard.view_all": "Ver Todo",
    "dashboard.create_new": "Crear Nuevo",
    "dashboard.last_month": "del mes pasado",

    // Invoice Status
    "status.paid": "Pagado",
    "status.pending": "Pendiente",
    "status.overdue": "Vencido",

    // Categories
    "category.office": "Oficina",
    "category.software": "Software",
    "category.travel": "Viajes",

    // Settings
    "settings.title": "Configuración",
    "settings.language": "Idioma",
    "settings.currency": "Moneda",
    "settings.theme": "Tema",
    "settings.notifications": "Notificaciones",
    "settings.account": "Cuenta",
    "settings.security": "Seguridad",
    "settings.billing": "Facturación",
    "settings.integrations": "Integraciones",
    "settings.language_description": "Selecciona tu idioma preferido",
    "settings.currency_description": "Elige tu moneda predeterminada",
    "settings.theme_description": "Elige tu tema preferido",
    "settings.notifications_description": "Gestiona tus preferencias de notificación",
    "settings.account_description": "Gestiona la información de tu cuenta",
    "settings.security_description": "Configuración de seguridad y privacidad",
    "settings.billing_description": "Configuración de facturación y suscripción",
    "settings.integrations_description": "Conecta con servicios de terceros",

    // Languages
    "language.english": "Inglés",
    "language.spanish": "Español",
    "language.french": "Francés",
    "language.german": "Alemán",
    "language.italian": "Italiano",
    "language.portuguese": "Portugués",

    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.add": "Agregar",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.export": "Exportar",
    "common.import": "Importar",
  },
  fr: {
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.invoices": "Factures",
    "nav.expenses": "Dépenses",
    "nav.clients": "Clients",
    "nav.reports": "Rapports",
    "nav.ai_assistant": "Assistant IA",
    "nav.search_analytics": "Analyses de recherche",
    "nav.search_insights": "Insights de recherche",
    "nav.team_search": "Recherche d'équipe",
    "nav.ambient_music": "Musique d'ambiance",
    "nav.scanner": "Scanner",
    "nav.reminders": "Rappels",
    "nav.virtual_office": "Bureau virtuel",
    "nav.ai_predictions": "Prédictions IA",
    "nav.blockchain_invoices": "Factures Blockchain",
    "nav.system_health": "Santé du système",
    "nav.temporal_analysis": "Analyse temporelle",
    "nav.circuit_breakers": "Disjoncteurs",
    "nav.ml_cascade_prediction": "Prédiction ML en cascade",
    "nav.settings": "Paramètres",
    "nav.sign_out": "Se déconnecter",
    "nav.cms": "CMS",

    // Dashboard
    "dashboard.welcome": "Bienvenue sur INVOXA",
    "dashboard.subtitle": "Voici ce qui se passe avec votre entreprise aujourd'hui.",
    "dashboard.total_revenue": "Revenus totaux",
    "dashboard.invoices": "Factures",
    "dashboard.clients": "Clients",
    "dashboard.expenses": "Dépenses",
    "dashboard.recent_invoices": "Factures récentes",
    "dashboard.recent_expenses": "Dépenses récentes",
    "dashboard.latest_invoice_activity": "Dernière activité de facturation",
    "dashboard.latest_expense_activity": "Dernière activité de dépenses",
    "dashboard.view_all": "Voir tout",
    "dashboard.create_new": "Créer nouveau",
    "dashboard.last_month": "du mois dernier",

    // Invoice Status
    "status.paid": "Payé",
    "status.pending": "En attente",
    "status.overdue": "En retard",

    // Categories
    "category.office": "Bureau",
    "category.software": "Logiciel",
    "category.travel": "Voyage",

    // Settings
    "settings.title": "Paramètres",
    "settings.language": "Langue",
    "settings.currency": "Devise",
    "settings.theme": "Thème",
    "settings.notifications": "Notifications",
    "settings.account": "Compte",
    "settings.security": "Sécurité",
    "settings.billing": "Facturation",
    "settings.integrations": "Intégrations",
    "settings.language_description": "Sélectionnez votre langue préférée",
    "settings.currency_description": "Choisissez votre devise par défaut",
    "settings.theme_description": "Choisissez votre thème préféré",
    "settings.notifications_description": "Gérez vos préférences de notification",
    "settings.account_description": "Gérez les informations de votre compte",
    "settings.security_description": "Paramètres de sécurité et de confidentialité",
    "settings.billing_description": "Paramètres de facturation et d'abonnement",
    "settings.integrations_description": "Connectez-vous avec des services tiers",

    // Languages
    "language.english": "Anglais",
    "language.spanish": "Espagnol",
    "language.french": "Français",
    "language.german": "Allemand",
    "language.italian": "Italien",
    "language.portuguese": "Portugais",

    // Common
    "common.loading": "Chargement...",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.add": "Ajouter",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.export": "Exporter",
    "common.import": "Importer",
  },
  de: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Rechnungen",
    "nav.expenses": "Ausgaben",
    "nav.clients": "Kunden",
    "nav.reports": "Berichte",
    "nav.ai_assistant": "KI-Assistent",
    "nav.search_analytics": "Suchanalyse",
    "nav.search_insights": "Such-Insights",
    "nav.team_search": "Team-Suche",
    "nav.ambient_music": "Ambient-Musik",
    "nav.scanner": "Scanner",
    "nav.reminders": "Erinnerungen",
    "nav.virtual_office": "Virtuelles Büro",
    "nav.ai_predictions": "KI-Vorhersagen",
    "nav.blockchain_invoices": "Blockchain-Rechnungen",
    "nav.system_health": "Systemgesundheit",
    "nav.temporal_analysis": "Zeitanalyse",
    "nav.circuit_breakers": "Schutzschalter",
    "nav.ml_cascade_prediction": "ML-Kaskaden-Vorhersage",
    "nav.settings": "Einstellungen",
    "nav.sign_out": "Abmelden",
    "nav.cms": "CMS",

    // Dashboard
    "dashboard.welcome": "Willkommen bei INVOXA",
    "dashboard.subtitle": "Hier ist, was heute mit Ihrem Unternehmen passiert.",
    "dashboard.total_revenue": "Gesamtumsatz",
    "dashboard.invoices": "Rechnungen",
    "dashboard.clients": "Kunden",
    "dashboard.expenses": "Ausgaben",
    "dashboard.recent_invoices": "Aktuelle Rechnungen",
    "dashboard.recent_expenses": "Aktuelle Ausgaben",
    "dashboard.latest_invoice_activity": "Neueste Rechnungsaktivität",
    "dashboard.latest_expense_activity": "Neueste Ausgabenaktivität",
    "dashboard.view_all": "Alle anzeigen",
    "dashboard.create_new": "Neu erstellen",
    "dashboard.last_month": "vom letzten Monat",

    // Invoice Status
    "status.paid": "Bezahlt",
    "status.pending": "Ausstehend",
    "status.overdue": "Überfällig",

    // Categories
    "category.office": "Büro",
    "category.software": "Software",
    "category.travel": "Reisen",

    // Settings
    "settings.title": "Einstellungen",
    "settings.language": "Sprache",
    "settings.currency": "Währung",
    "settings.theme": "Design",
    "settings.notifications": "Benachrichtigungen",
    "settings.account": "Konto",
    "settings.security": "Sicherheit",
    "settings.billing": "Abrechnung",
    "settings.integrations": "Integrationen",
    "settings.language_description": "Wählen Sie Ihre bevorzugte Sprache",
    "settings.currency_description": "Wählen Sie Ihre Standardwährung",
    "settings.theme_description": "Wählen Sie Ihr bevorzugtes Design",
    "settings.notifications_description": "Verwalten Sie Ihre Benachrichtigungseinstellungen",
    "settings.account_description": "Verwalten Sie Ihre Kontoinformationen",
    "settings.security_description": "Sicherheits- und Datenschutzeinstellungen",
    "settings.billing_description": "Abrechnungs- und Abonnementeinstellungen",
    "settings.integrations_description": "Mit Drittanbieterdiensten verbinden",

    // Languages
    "language.english": "Englisch",
    "language.spanish": "Spanisch",
    "language.french": "Französisch",
    "language.german": "Deutsch",
    "language.italian": "Italienisch",
    "language.portuguese": "Portugiesisch",

    // Common
    "common.loading": "Laden...",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.add": "Hinzufügen",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.export": "Exportieren",
    "common.import": "Importieren",
  },
  it: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Fatture",
    "nav.expenses": "Spese",
    "nav.clients": "Clienti",
    "nav.reports": "Report",
    "nav.ai_assistant": "Assistente IA",
    "nav.search_analytics": "Analisi di ricerca",
    "nav.search_insights": "Insights di ricerca",
    "nav.team_search": "Ricerca di squadra",
    "nav.ambient_music": "Musica ambientale",
    "nav.scanner": "Scanner",
    "nav.reminders": "Promemoria",
    "nav.virtual_office": "Ufficio virtuale",
    "nav.ai_predictions": "Previsioni IA",
    "nav.blockchain_invoices": "Fatture Blockchain",
    "nav.system_health": "Salute del sistema",
    "nav.temporal_analysis": "Analisi temporale",
    "nav.circuit_breakers": "Interruttori",
    "nav.ml_cascade_prediction": "Previsione ML a cascata",
    "nav.settings": "Impostazioni",
    "nav.sign_out": "Disconnetti",
    "nav.cms": "CMS",

    // Dashboard
    "dashboard.welcome": "Benvenuto in INVOXA",
    "dashboard.subtitle": "Ecco cosa sta succedendo con la tua attività oggi.",
    "dashboard.total_revenue": "Ricavi totali",
    "dashboard.invoices": "Fatture",
    "dashboard.clients": "Clienti",
    "dashboard.expenses": "Spese",
    "dashboard.recent_invoices": "Fatture recenti",
    "dashboard.recent_expenses": "Spese recenti",
    "dashboard.latest_invoice_activity": "Ultima attività di fatturazione",
    "dashboard.latest_expense_activity": "Ultima attività di spesa",
    "dashboard.view_all": "Visualizza tutto",
    "dashboard.create_new": "Crea nuovo",
    "dashboard.last_month": "dal mese scorso",

    // Invoice Status
    "status.paid": "Pagato",
    "status.pending": "In sospeso",
    "status.overdue": "Scaduto",

    // Categories
    "category.office": "Ufficio",
    "category.software": "Software",
    "category.travel": "Viaggi",

    // Settings
    "settings.title": "Impostazioni",
    "settings.language": "Lingua",
    "settings.currency": "Valuta",
    "settings.theme": "Tema",
    "settings.notifications": "Notifiche",
    "settings.account": "Account",
    "settings.security": "Sicurezza",
    "settings.billing": "Fatturazione",
    "settings.integrations": "Integrazioni",
    "settings.language_description": "Seleziona la tua lingua preferita",
    "settings.currency_description": "Scegli la tua valuta predefinita",
    "settings.theme_description": "Scegli il tuo tema preferito",
    "settings.notifications_description": "Gestisci le tue preferenze di notifica",
    "settings.account_description": "Gestisci le informazioni del tuo account",
    "settings.security_description": "Impostazioni di sicurezza e privacy",
    "settings.billing_description": "Impostazioni di fatturazione e abbonamento",
    "settings.integrations_description": "Connetti con servizi di terze parti",

    // Languages
    "language.english": "Inglese",
    "language.spanish": "Spagnolo",
    "language.french": "Francese",
    "language.german": "Tedesco",
    "language.italian": "Italiano",
    "language.portuguese": "Portoghese",

    // Common
    "common.loading": "Caricamento...",
    "common.save": "Salva",
    "common.cancel": "Annulla",
    "common.delete": "Elimina",
    "common.edit": "Modifica",
    "common.add": "Aggiungi",
    "common.search": "Cerca",
    "common.filter": "Filtra",
    "common.export": "Esporta",
    "common.import": "Importa",
  },
  pt: {
    // Navigation
    "nav.dashboard": "Painel",
    "nav.invoices": "Faturas",
    "nav.expenses": "Despesas",
    "nav.clients": "Clientes",
    "nav.reports": "Relatórios",
    "nav.ai_assistant": "Assistente IA",
    "nav.search_analytics": "Análise de pesquisa",
    "nav.search_insights": "Insights de pesquisa",
    "nav.team_search": "Pesquisa em equipe",
    "nav.ambient_music": "Música ambiente",
    "nav.scanner": "Scanner",
    "nav.reminders": "Lembretes",
    "nav.virtual_office": "Escritório virtual",
    "nav.ai_predictions": "Previsões IA",
    "nav.blockchain_invoices": "Faturas Blockchain",
    "nav.system_health": "Saúde do sistema",
    "nav.temporal_analysis": "Análise temporal",
    "nav.circuit_breakers": "Disjuntores",
    "nav.ml_cascade_prediction": "Previsão ML em cascata",
    "nav.settings": "Configurações",
    "nav.sign_out": "Sair",
    "nav.cms": "CMS",

    // Dashboard
    "dashboard.welcome": "Bem-vindo ao INVOXA",
    "dashboard.subtitle": "Aqui está o que está acontecendo com seu negócio hoje.",
    "dashboard.total_revenue": "Receita total",
    "dashboard.invoices": "Faturas",
    "dashboard.clients": "Clientes",
    "dashboard.expenses": "Despesas",
    "dashboard.recent_invoices": "Faturas recentes",
    "dashboard.recent_expenses": "Despesas recentes",
    "dashboard.latest_invoice_activity": "Última atividade de faturamento",
    "dashboard.latest_expense_activity": "Última atividade de despesas",
    "dashboard.view_all": "Ver tudo",
    "dashboard.create_new": "Criar novo",
    "dashboard.last_month": "do mês passado",

    // Invoice Status
    "status.paid": "Pago",
    "status.pending": "Pendente",
    "status.overdue": "Vencido",

    // Categories
    "category.office": "Escritório",
    "category.software": "Software",
    "category.travel": "Viagem",

    // Settings
    "settings.title": "Configurações",
    "settings.language": "Idioma",
    "settings.currency": "Moeda",
    "settings.theme": "Tema",
    "settings.notifications": "Notificações",
    "settings.account": "Conta",
    "settings.security": "Segurança",
    "settings.billing": "Faturamento",
    "settings.integrations": "Integrações",
    "settings.language_description": "Selecione seu idioma preferido",
    "settings.currency_description": "Escolha sua moeda padrão",
    "settings.theme_description": "Escolha seu tema preferido",
    "settings.notifications_description": "Gerencie suas preferências de notificação",
    "settings.account_description": "Gerencie as informações da sua conta",
    "settings.security_description": "Configurações de segurança e privacidade",
    "settings.billing_description": "Configurações de faturamento e assinatura",
    "settings.integrations_description": "Conecte-se com serviços de terceiros",

    // Languages
    "language.english": "Inglês",
    "language.spanish": "Espanhol",
    "language.french": "Francês",
    "language.german": "Alemão",
    "language.italian": "Italiano",
    "language.portuguese": "Português",

    // Common
    "common.loading": "Carregando...",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.delete": "Excluir",
    "common.edit": "Editar",
    "common.add": "Adicionar",
    "common.search": "Pesquisar",
    "common.filter": "Filtrar",
    "common.export": "Exportar",
    "common.import": "Importar",
  },
}

const LanguageCurrencyContext = createContext<LanguageCurrencyContextType | undefined>(undefined)

export function LanguageCurrencyProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [currency, setCurrency] = useState<Currency>("USD")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedLanguage = localStorage.getItem("invoxa-language") as Language
    const savedCurrency = localStorage.getItem("invoxa-currency") as Currency

    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
    if (savedCurrency && currencyData[savedCurrency]) {
      setCurrency(savedCurrency)
    }

    setIsLoaded(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("invoxa-language", lang)
    }
  }

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr)
    if (typeof window !== "undefined") {
      localStorage.setItem("invoxa-currency", curr)
    }
  }

  const t = (key: string): string => {
    if (!isLoaded) return key // Return key during loading
    return translations[language]?.[key as keyof typeof translations.en] || key
  }

  const formatCurrency = (amount: number): string => {
    const symbol = currencyData[currency].symbol
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <LanguageCurrencyContext.Provider
      value={{
        language,
        currency,
        setLanguage: handleSetLanguage,
        setCurrency: handleSetCurrency,
        t,
        formatCurrency,
        isLoaded,
      }}
    >
      {children}
    </LanguageCurrencyContext.Provider>
  )
}

export function useLanguageCurrency() {
  const context = useContext(LanguageCurrencyContext)
  if (context === undefined) {
    throw new Error("useLanguageCurrency must be used within a LanguageCurrencyProvider")
  }
  return context
}
