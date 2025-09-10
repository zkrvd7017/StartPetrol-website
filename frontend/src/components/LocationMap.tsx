import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Station {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: string;
  prices: Array<{ id: number; product: number; product_name: string; product_type: string; price: number; available: boolean }>;
}

const LocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<Record<number, L.Marker>>({});
  const { t } = useLanguage();

  const [stations, setStations] = useState<Station[]>([]);
  const [active, setActive] = useState<Station | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    const center: L.LatLngExpression = [41.2995, 69.2401]; // Toshkent
    const map = L.map(mapContainer.current).setView(center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
    mapRef.current = map;
  }, []);

  const addMarkers = (items: Station[]) => {
    if (!mapRef.current) return;
    Object.values(markers.current).forEach((m) => m.remove());
    markers.current = {};
    items.forEach((s) => {
      const marker = L.marker([s.latitude, s.longitude], {
        title: s.name,
      })
        .addTo(mapRef.current!)
        .bindPopup(`<strong>${s.name}</strong><br/>${s.address || ''}`)
        .on('click', () => setActive(s));
      markers.current[s.id] = marker;
    });
    if (items.length) {
      mapRef.current.setView([items[0].latitude, items[0].longitude], 13);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/stations/');
        if (!res.ok) return;
        const data = (await res.json()) as Station[];
        setStations(data);
        addMarkers(data);
      } catch {}
    };
    run();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(markers.current).forEach((m) => m.remove());
      mapRef.current?.remove();
    };
  }, []);

  const handleNavigate = (s: Station) => {
    const dest = `${s.latitude},${s.longitude}`;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
          window.open(url, '_blank');
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
          window.open(url, '_blank');
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 sm:mb-4">
            {t('location')}
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            StartPetrol — Toshkent shahri filiallari
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="overflow-hidden h-[300px] sm:h-[400px] lg:h-[500px] relative z-10">
              <CardContent className="p-0 h-full">
                <div ref={mapContainer} className="w-full h-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <Card className="product-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Filiallar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[300px] lg:max-h-[360px] overflow-y-auto">
                {stations.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(s);
                      if (mapRef.current) mapRef.current.setView([s.latitude, s.longitude], 15);
                      markers.current[s.id]?.openPopup();
                    }}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-colors ${active?.id === s.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}
                  >
                    <div className="font-medium text-sm sm:text-base">{s.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{s.address}</div>
                  </button>
                ))}
                {stations.length === 0 && <div className="text-xs sm:text-sm text-muted-foreground">Filiallar topilmadi.</div>}
              </CardContent>
            </Card>

            <Card className="product-card">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Tanlangan filial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {active ? (
                  <>
                    <div className="font-semibold text-sm sm:text-base">{active.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{active.address}</div>
                    <div className="text-xs sm:text-sm flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        <a href="tel:+998991980747" className="hover:underline">+998991980747</a>
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        <a href="tel:881007017" className="hover:underline">881007017</a>
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 sm:mt-3 text-xs sm:text-sm h-8 sm:h-9" 
                      onClick={() => handleNavigate(active)}
                    >
                      <Navigation className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 
                      Yo'l ko'rsatish
                    </Button>
                  </>
                ) : (
                  <div className="text-xs sm:text-sm text-muted-foreground">Filial tanlang.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;