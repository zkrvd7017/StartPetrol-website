import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Globe, Heart, Instagram, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const languages = [
    { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇺🇸' }
  ];

  const navigation = [
    { name: t('home'), href: '#', active: true },
    { name: t('catalog'), href: '#catalog' },
    { name: t('services'), href: '#services' },
    { name: t('contacts'), href: '#contact' }
  ];

  const updateSearch = (q: string) => {
    const params = new URLSearchParams(window.location.search);
    if (q.length > 0) params.set('q', q); else params.delete('q');
    navigate(`/?${params.toString()}#catalog`);                                                     
    setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    updateSearch(searchText.trim());
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <a href="#" className="mr-6 flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              StartPetrol
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`transition-colors hover:text-primary relative ${
                item.active 
                  ? 'text-primary' 
                  : 'text-foreground'
              }`}
            >
              {item.name}
              {item.active && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-primary rounded-full" />
              )}
            </a>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Search */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {isSearchOpen ? (
              <form onSubmit={onSearchSubmit} className="flex gap-2">
                <Input
                  autoFocus
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setIsSearchOpen(false); }}
                  placeholder={t('search')}
                  className="md:w-80"
                />
                <Button type="submit" className="h-10">
                  <Search className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" className="h-10" onClick={() => { setSearchText(''); updateSearch(''); setIsSearchOpen(false); }}>
                  {t('home')}
                </Button>
              </form>
            ) : (
              <Button
                variant="outline"
                className="relative h-9 w-9 p-0 md:h-10 md:w-60 md:justify-start md:px-3 md:py-2"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline-flex">{t('search')}</span>
              </Button>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative group">
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {languages.find(lang => lang.code === language)?.flag}
              </span>
              <span className="text-sm font-medium">
                {languages.find(lang => lang.code === language)?.label}
              </span>
            </Button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 backdrop-blur-sm">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    language === lang.code ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                  onClick={() => setLanguage(lang.code as any)}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Actions (login removed) */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex text-pink-500 hover:text-pink-600 hover:bg-pink-50"
              onClick={() => window.open('#', '_blank')}
            >
              <Instagram className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => window.open('https://t.me/StartPetrol_bot', '_blank')}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <a href="#" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">S</span>
                  </div>
                  <span className="font-bold text-xl">StartPetrol</span>
                </a>
                <nav className="flex flex-col space-y-3 mt-8">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`px-2 py-1 text-lg transition-colors hover:text-primary ${
                        item.active ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>
                {/* Mobile Social */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-3">{t('socialLogin')}</p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-pink-500 border-pink-200 hover:bg-pink-50"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                    <a href="https://t.me/StartPetrol_bot" target="_blank" className='border border'>
                      <Send className="h-4 w-4 mr-2"  />
                      Telegram
                    </a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;