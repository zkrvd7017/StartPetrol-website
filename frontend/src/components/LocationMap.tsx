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
    <section id="contact" className="py-20 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('location')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            StartPetrol — Toshkent shahri filiallari
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden h-[500px]">
              <CardContent className="p-0 h-full">
                <div ref={mapContainer} className="w-full h-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Filiallar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[360px] overflow-y-auto">
                {stations.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(s);
                      if (mapRef.current) mapRef.current.setView([s.latitude, s.longitude], 15);
                      markers.current[s.id]?.openPopup();
                    }}
                    className={`w-full text-left p-3 rounded-lg border ${active?.id === s.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-muted-foreground">{s.address}</div>
                  </button>
                ))}
                {stations.length === 0 && <div className="text-sm text-muted-foreground">Filiallar topilmadi.</div>}
              </CardContent>
            </Card>

            <Card className="product-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Tanlangan filial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {active ? (
                  <>
                    <div className="font-semibold">{active.name}</div>
                    <div className="text-sm text-muted-foreground">{active.address}</div>
                    <div className="text-sm flex flex-col gap-1">
                      <span className="flex items-center gap-2"><Phone className="h-4 w-4" /><a href="tel:+998991980747" className="hover:underline">+998991980747</a></span>
                      <span className="flex items-center gap-2"><Phone className="h-4 w-4" /><a href="tel:881007017" className="hover:underline">881007017</a></span>
                    </div>
                    <Button variant="outline" className="w-full mt-3" onClick={() => handleNavigate(active)}>
                      <Navigation className="mr-2 h-4 w-4" /> Yo'l ko'rsatish
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Filial tanlang.</div>
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