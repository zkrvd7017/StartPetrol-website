import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Clock, Shield, Users, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();
  const services = [
    {
      icon: Truck,
      title: 'Tez Yetkazib Berish',
      description: 'Shahar bo\'ylab 2 soat ichida, viloyat bo\'ylab 24 soat ichida yetkazib berish xizmati.',
      features: ['24/7 yetkazish', 'GPS kuzatuv', 'SMS xabarnomalar']
    },
    {
      icon: Clock,
      title: 'Doimiy Mavjudlik',
      description: 'Barcha mahsulotlar doimiy omborda mavjud. Buyurtma berganingizdan keyin darhol yetkazamiz.',
      features: ['Katta omborlar', 'Tez ta\'minot', 'Zaxira mavjud']
    },
    {
      icon: Shield,
      title: 'Sifat Kafolati',
      description: 'Barcha mahsulotlar xalqaro standartlarga javob beradi va to\'liq sifat kafolati bilan taqdim etiladi.',
      features: ['ISO sertifikatlar', '100% sifat', 'Laboratoriya testlari']
    },
    {
      icon: Users,
      title: 'Professional Jamoa',
      description: 'Tajribali mutaxassislar sizga eng yaxshi maslahat va xizmat ko\'rsatishga tayyor.',
      features: ['10+ yil tajriba', 'Mutaxassis maslahat', 'Texnik yordam']
    }
  ];

  const stats = [
    { number: '500+', label: 'Mamnun mijozlar', icon: Users },
    { number: '1000+', label: 'Amalga oshirilgan loyihalar', icon: Truck },
    { number: '24/7', label: 'Mijozlarga xizmat', icon: Clock },
    { number: '99%', label: 'Mijozlar mamnuniyati', icon: Shield }
  ];

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
            {t('servicesTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('servicesSubtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="group border-0 shadow-card bg-gradient-card hover:shadow-primary transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center animate-fade-in">
          <h3 className="text-3xl font-bold text-primary-foreground mb-4">
            {t('servicesStatsTitle')}
          </h3>
          <p className="text-primary-foreground/80 mb-12 max-w-2xl mx-auto">
            {t('servicesStatsSubtitle')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="animate-slide-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <stat.icon className="h-8 w-8 text-primary-foreground/80 mx-auto mb-4" />
                <div className="text-4xl font-bold text-primary-foreground mb-2 text-glow">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="bg-background rounded-2xl p-8 md:p-12 border border-border/50 shadow-card">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Bizning xizmatlar sizni qiziqtirdimi?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Mutaxassislarimiz bilan bog'laning va sizning ehtiyojlaringiz uchun 
              eng yaxshi echimlarni toping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-glow bg-primary hover:bg-primary/90">
                <Phone className="mr-2 h-5 w-5" />
                +998 90 123 45 67
              </Button>
              <Button variant="outline" size="lg">
                <MapPin className="mr-2 h-5 w-5" />
                Joylashuvimiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;