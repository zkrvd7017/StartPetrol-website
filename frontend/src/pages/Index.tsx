import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductCatalog from '@/components/ProductCatalog';
import Services from '@/components/Services';
import Reviews from '@/components/Reviews';
import LocationMap from '@/components/LocationMap';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ChatWidget from '@/components/ChatWidget';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header />
        <Hero />
        <ProductCatalog />
        <Services />
        <Reviews />
        <LocationMap />
        <Footer />
        <ChatWidget />
      </div>
    </LanguageProvider>
  );
};

export default Index;
