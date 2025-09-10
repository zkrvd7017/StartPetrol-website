import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Fuel, Droplets, Zap, Truck, CheckCircle, Star } from 'lucide-react';
import fuelStationImage from '@/assets/fuel-station.jpg';
import dieselProductImage from '@/assets/diesel-product.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

const defaultProducts = [
  {
    id: 1,
    name: 'Premium Benzin AI-95',
    type: 'benzin',
    image: fuelStationImage,
    description: "Yuqori sifatli premium benzin",
    features: [],
    delivery: 'Bepul yetkazib berish',
    volume: '1000L gacha',
    quality: 'Premium',
    rating: 4.9,
  },
  {
    id: 2,
    name: "Dizel Yoqilg'isi",
    type: 'dizel',
    image: dieselProductImage,
    description: 'Professional dizel transport vositalari uchun',
    features: [],
    delivery: '24/7 yetkazib berish',
    volume: '5000L gacha',
    quality: 'Industrial',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Premium Benzin AI-92',
    type: 'benzin',
    image: fuelStationImage,
    description: 'Standart avtomobillar uchun sifatli benzin',
    features: [],
    delivery: 'Tez yetkazib berish',
    volume: '2000L gacha',
    quality: 'Standard',
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Sanoat Neft Mahsuloti',
    type: 'neft',
    image: dieselProductImage,
    description: 'Sanoat korxonalari uchun maxsus',
    features: [],
    delivery: 'Maxsus yetkazib berish',
    volume: '10000L gacha',
    quality: 'Industrial Pro',
    rating: 5.0,
  },
];

const ProductCatalog = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  const applySearch = (items: any[]) => {
    const params = new URLSearchParams(location.search);
    const q = (params.get('q') || '').toLowerCase().trim();
    if (!q) return items;
    const filtered = items.filter((p) => (
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.description || '').toLowerCase().includes(q)
    ));
    return filtered.length ? filtered : items;
  };

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadFailed(false);
        const res = await fetch('/api/products/', { signal: controller.signal });
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          image: p.image_url || (p.type === 'dizel' ? dieselProductImage : fuelStationImage),
          description: p.description || '',
          features: [],
          delivery: p.delivery || '',
          volume: p.volume || '',
          quality: p.quality || 'Standard',
          rating: typeof p.rating === 'number' ? p.rating : 0,
        }));
        setAllProducts(mapped);
        setProducts(applySearch(mapped));
      } catch (_) {
        setLoadFailed(true);
        setAllProducts(defaultProducts);
        setProducts(applySearch(defaultProducts));
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allProducts) setProducts(applySearch(allProducts));
  }, [location.search, allProducts]);

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const filteredProducts = (type: string) => {
    if (type === 'all') return products;
    return products.filter(product => product.type === type);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'benzin': return <Fuel className="h-5 w-5" />;
      case 'dizel': return <Droplets className="h-5 w-5" />;
      case 'neft': return <Zap className="h-5 w-5" />;
      default: return <Fuel className="h-5 w-5" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Premium': return 'bg-gradient-primary';
      case 'Industrial': return 'bg-gradient-secondary';
      case 'Standard': return 'bg-muted';
      case 'Industrial Pro': return 'bg-gradient-hero';
      default: return 'bg-muted';
    }
  };

  return (
    <section id="catalog" className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-2 sm:space-y-4 mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('productsTitle')}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t('productsSubtitle')}
          </p>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8 sm:mb-12 h-10 sm:h-12">
            <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Fuel className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('allTab')}</span>
              <span className="sm:hidden">Barcha</span>
            </TabsTrigger>
            <TabsTrigger value="benzin" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Fuel className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('gasolineTab')}</span>
              <span className="sm:hidden">Benzin</span>
            </TabsTrigger>
            <TabsTrigger value="dizel" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Droplets className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('dieselTab')}</span>
              <span className="sm:hidden">Dizel</span>
            </TabsTrigger>
            <TabsTrigger value="neft" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('oilTab')}</span>
              <span className="sm:hidden">Neft</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ProductGrid products={filteredProducts('all')} favorites={favorites} toggleFavorite={toggleFavorite} getTypeIcon={getTypeIcon} getQualityColor={getQualityColor} />
          </TabsContent>
          <TabsContent value="benzin">
            <ProductGrid products={filteredProducts('benzin')} favorites={favorites} toggleFavorite={toggleFavorite} getTypeIcon={getTypeIcon} getQualityColor={getQualityColor} />
          </TabsContent>
          <TabsContent value="dizel">
            <ProductGrid products={filteredProducts('dizel')} favorites={favorites} toggleFavorite={toggleFavorite} getTypeIcon={getTypeIcon} getQualityColor={getQualityColor} />
          </TabsContent>
          <TabsContent value="neft">
            <ProductGrid products={filteredProducts('neft')} favorites={favorites} toggleFavorite={toggleFavorite} getTypeIcon={getTypeIcon} getQualityColor={getQualityColor} />
          </TabsContent>
        </Tabs>

        {!products.length && (
          <div className="text-center text-muted-foreground mt-8">
            {loadFailed ? 'Server mavjud emas. Namuna ro\'yxat ko\'rsatildi.' : 'Hech narsa topilmadi.'}
          </div>
        )}
      </div>
    </section>
  );
};

const ProductGrid = ({ products, favorites, toggleFavorite, getTypeIcon, getQualityColor }: any) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {products.map((product: any, index: number) => (
        <Card 
          key={product.id} 
          className="product-card group overflow-hidden border-0 shadow-card bg-gradient-card animate-scale-in h-full"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="p-0">
            <div className="relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-32 sm:h-40 lg:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart 
                  className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-300 ${
                    favorites.has(product.id) 
                      ? 'fill-red-500 text-red-500 animate-pulse' 
                      : 'text-white hover:text-red-300'
                  }`} 
                />
              </Button>

              {/* Quality Badge */}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                <Badge className={`${getQualityColor(product.quality)} text-white border-0 text-xs sm:text-sm px-2 py-1`}>
                  {product.quality}
                </Badge>
              </div>

              {/* Rating */}
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3">
                <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-xs sm:text-sm font-medium">{product.rating}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-2 sm:space-y-4">
              {/* Product Header */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5">
                    {getTypeIcon(product.type)}
                  </div>
                  <CardTitle className="text-sm sm:text-base lg:text-xl font-semibold text-foreground leading-tight">
                    {product.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm leading-tight">
                  {product.description}
                </CardDescription>
              </div>

              {/* Features */}
              <div className="space-y-1 sm:space-y-2">
                {(product.features || []).slice(0, 2).map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-secondary" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground">Yetkazish</div>
                  <div className="text-xs sm:text-sm font-medium leading-tight">{product.delivery}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground">Hajm</div>
                  <div className="text-xs sm:text-sm font-medium leading-tight">{product.volume}</div>
                </div>
              </div>

              {/* Action Button */}
              
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductCatalog;