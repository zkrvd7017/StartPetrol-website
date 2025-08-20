import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Globe, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'Mahsulotlar',
      links: [
        'Premium Benzin AI-95',
        'Premium Benzin AI-92',
        'Dizel Yoqilg\'isi',
        'Sanoat Neft Mahsulotlari'
      ]
    },
    {
      title: 'Xizmatlar',
      links: [
        'Yetkazib berish',
        'Ulgurji sotish',
        'Texnik yordam',
        'Maslahat xizmati'
      ]
    },
    {
      title: 'Kompaniya',
      links: [
        'Biz haqimizda',
        'Jamoamiz',
        'Yangiliklar',
        'Kareya'
      ]
    },
    {
      title: 'Yordam',
      links: [
        'Savol-javoblar',
        'Mijozlarga yordam',
        'Qo\'llab-quvvatlash',
        'Bog\'lanish'
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Globe, href: '#', label: 'Website' }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="font-bold text-2xl">StartPetrol</span>
            </div>
            
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Zamonaviy neft mahsulotlari va yoqilg'i bozorida ishonchli hamkoringiz. 
              Sifat, xavfsizlik va professional xizmat kafolati bilan.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">+998 90 123 45 67</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">info@startpetrol.uz</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">Toshkent, O'zbekiston</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Navigation */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-foreground">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200 text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-primary-foreground/20" />

      {/* Bottom Footer */}
      <div className="container px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-primary-foreground/60 text-sm">
            © 2024 StartPetrol. Barcha huquqlar himoyalangan.
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Maxfiylik siyosati
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Foydalanish shartlari
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Cookie-lar
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;