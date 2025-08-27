import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'uz' | 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  uz: {
    home: "Bosh sahifa",
    catalog: "Katalog", 
    services: "Xizmatlar",
    contacts: "Kontaktlar",
    search: "Qidirish...",
    login: "Kirish",
    socialLogin: "Ijtimoiy tarmoqlar orqali kirish:",
    location: "Joylashuvimiz",
    heroTitleLine1: "Premium",
    heroTitleLine2: "Yoqilg'i Shaxobchasi",
    heroDescription: "StartPetrol - zamonaviy neft mahsulotlari va yoqilg'i bozorida ishonchli hamkoringiz. Sifat, xavfsizlik va professional xizmat.",
    ctaCatalog: "Katalogni Ko'rish",
    ctaAbout: "Biz Haqimizda",
    featurePremiumTitle: "Premium Yoqilg'i",
    featurePremiumDesc: "Yuqori sifatli benzin va dizel",
    featureFastTitle: "Tez Yetkazish",
    featureFastDesc: "24/7 yetkazib berish xizmati",
    featureGuaranteeTitle: "Kafolat",
    featureGuaranteeDesc: "Sifat va xavfsizlik kafolati",
    featureVolumeTitle: "Katta Hajm",
    featureVolumeDesc: "Ulgurji va chakana sotish",
    statsCustomers: "Mijozlar",
    statsService: "Xizmat",
    statsGuarantee: "Kafolat",
    servicesTitle: "Bizning Xizmatlar",
    servicesSubtitle: "Sizga eng yaxshi xizmat ko'rsatish uchun keng qamrovli echimlar taklif qilamiz. Professional yondashuv va sifat kafolati bilan.",
    servicesStatsTitle: "Raqamlar bilan natijalarimiz",
    servicesStatsSubtitle: "Bizning professional xizmatimiz va sifatli mahsulotlarimiz natijasida erishgan yutuqlar.",
    productsTitle: "Mahsulot Katalogi",
    productsSubtitle: "Yuqori sifatli yoqilg'i va neft mahsulotlarini kashf eting. Har bir mahsulot sifat va ishonchlilik kafolati bilan taqdim etiladi.",
    allTab: "Barchasi",
    gasolineTab: "Benzin",
    dieselTab: "Dizel",
    oilTab: "Neft",
    reviewsTitle: "Mijozlar Sharhlari",
    reviewsSubtitle: "Bizning yoqilg'i va xizmatlarimiz haqida mijozlarimiz nima deydi",
  },
  ru: {
    home: "Главная",
    catalog: "Каталог",
    services: "Услуги", 
    contacts: "Контакты",
    search: "Поиск...",
    login: "Войти",
    socialLogin: "Войти через соцсети:",
    location: "Наше местоположение",
    heroTitleLine1: "Премиальные",
    heroTitleLine2: "Топливные Решения",
    heroDescription: "StartPetrol — ваш надёжный партнёр на рынке нефтепродуктов и топлива. Качество, безопасность и профессиональный сервис.",
    ctaCatalog: "Смотреть каталог",
    ctaAbout: "О нас",
    featurePremiumTitle: "Премиальное топливо",
    featurePremiumDesc: "Высококачественный бензин и дизель",
    featureFastTitle: "Быстрая доставка",
    featureFastDesc: "Доставка 24/7",
    featureGuaranteeTitle: "Гарантия",
    featureGuaranteeDesc: "Гарантия качества и безопасности",
    featureVolumeTitle: "Большие объёмы",
    featureVolumeDesc: "Опт и розница",
    statsCustomers: "Клиентов",
    statsService: "Сервис",
    statsGuarantee: "Гарантия",
    servicesTitle: "Наши услуги",
    servicesSubtitle: "Мы предлагаем комплексные решения с высоким уровнем сервиса и гарантией качества.",
    servicesStatsTitle: "Наши результаты в цифрах",
    servicesStatsSubtitle: "Достижения благодаря профессиональному сервису и качественным продуктам.",
    productsTitle: "Каталог продукции",
    productsSubtitle: "Откройте для себя качественные нефтепродукты и топливо. Гарантия качества и надёжности для каждого продукта.",
    allTab: "Все",
    gasolineTab: "Бензин",
    dieselTab: "Дизель",
    oilTab: "Нефть",
    reviewsTitle: "Отзывы клиентов",
    reviewsSubtitle: "Что говорят наши клиенты о наших продуктах и услугах",
  },
  en: {
    home: "Home",
    catalog: "Catalog",
    services: "Services",
    contacts: "Contacts", 
    search: "Search...",
    login: "Login",
    socialLogin: "Login with social networks:",
    location: "Our Location",
    heroTitleLine1: "Premium",
    heroTitleLine2: "Fuel Solutions",
    heroDescription: "StartPetrol is your trusted partner in petroleum products and fuel. Quality, safety, and professional service.",
    ctaCatalog: "View Catalog",
    ctaAbout: "About Us",
    featurePremiumTitle: "Premium Fuel",
    featurePremiumDesc: "High-quality gasoline and diesel",
    featureFastTitle: "Fast Delivery",
    featureFastDesc: "24/7 delivery service",
    featureGuaranteeTitle: "Guarantee",
    featureGuaranteeDesc: "Quality and safety guarantee",
    featureVolumeTitle: "High Volume",
    featureVolumeDesc: "Wholesale and retail",
    statsCustomers: "Customers",
    statsService: "Service",
    statsGuarantee: "Guarantee",
    servicesTitle: "Our Services",
    servicesSubtitle: "We offer comprehensive solutions with professional approach and quality assurance.",
    servicesStatsTitle: "Our results in numbers",
    servicesStatsSubtitle: "Achievements thanks to professional service and quality products.",
    productsTitle: "Product Catalog",
    productsSubtitle: "Discover high-quality fuel and petroleum products. Each product comes with quality and reliability assurance.",
    allTab: "All",
    gasolineTab: "Gasoline",
    dieselTab: "Diesel",
    oilTab: "Oil",
    reviewsTitle: "Customer Reviews",
    reviewsSubtitle: "What our customers say about our fuel and services",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('uz');

  const t = (key: string): string => {
    // @ts-ignore - safe access at runtime; fall back to key
    return (translations[language] && translations[language][key]) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};