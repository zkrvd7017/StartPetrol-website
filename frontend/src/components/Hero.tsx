import { Button } from '@/components/ui/button';
import { ArrowRight, Fuel, Zap, Shield, Truck } from 'lucide-react';
import heroImage from '@/assets/hero-image.png';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  const features = [
    {
      icon: Fuel,
      title: t('featurePremiumTitle'),
      description: t('featurePremiumDesc'),
    },
    {
      icon: Zap,
      title: t('featureFastTitle'),
      description: t('featureFastDesc'),
    },
    {
      icon: Shield,
      title: t('featureGuaranteeTitle'),
      description: t('featureGuaranteeDesc'),
    },
    {
      icon: Truck,
      title: t('featureVolumeTitle'),
      description: t('featureVolumeDesc'),
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Main Headlines */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              {t('heroTitleLine1')}
              <span className="block text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {t('heroTitleLine2')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t('heroDescription')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-xl"
            >
              {t('ctaCatalog')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/40 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm shadow-lg"
            >
              {t('ctaAbout')}
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-black/40 transition-all duration-300 animate-scale-in product-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className="h-8 w-8 text-white mb-4 mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
                <h3 className="text-white font-semibold text-lg mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{feature.title}</h3>
                <p className="text-white/90 text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">500+</div>
              <div className="text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{t('statsCustomers')}</div>
            </div>
            <div className="text-center animate-slide-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">24/7</div>
              <div className="text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{t('statsService')}</div>
            </div>
            <div className="text-center animate-slide-in" style={{ animationDelay: '0.7s' }}>
              <div className="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">100%</div>
              <div className="text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{t('statsGuarantee')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;