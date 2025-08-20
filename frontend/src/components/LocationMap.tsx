import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LocationMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const { t } = useLanguage();

  // Tashkent coordinates for StartPetrol station
  const coordinates: [number, number] = [69.2401, 41.2995];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 15,
      bearing: 0,
      pitch: 45
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add location marker
    new mapboxgl.Marker({
      color: '#1E3A8A',
      scale: 1.2
    })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<h3 class="font-bold text-lg">StartPetrol</h3><p class="text-sm">Premium Yoqilg\'i Stansiyasi</p>')
      )
      .addTo(map.current);

    // Add hover effects
    map.current.on('load', () => {
      if (!map.current) return;
      
      map.current.addSource('station-area', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'station-glow',
        type: 'circle',
        source: 'station-area',
        paint: {
          'circle-radius': 50,
          'circle-color': '#1E3A8A',
          'circle-opacity': 0.1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#1E3A8A',
          'circle-stroke-opacity': 0.3
        }
      });
    });
  };

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput);
      initializeMap(tokenInput);
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('location')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bizni topish oson - Toshkentdagi eng qulay joylashuvda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden h-[500px]">
              <CardContent className="p-0 h-full">
                {!mapboxToken ? (
                  <div className="h-full flex flex-col items-center justify-center bg-muted/50 p-8">
                    <MapPin className="h-16 w-16 text-primary mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Xaritani ko'rish uchun</h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      Mapbox API tokenini kiriting. <br/>
                      <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        mapbox.com
                      </a> saytidan ro'yxatdan o'ting
                    </p>
                    <div className="flex gap-2 w-full max-w-md">
                      <Input
                        placeholder="Mapbox token kiriting..."
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleTokenSubmit} className="btn-glow">
                        Ko'rish
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div ref={mapContainer} className="w-full h-full" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location Details */}
          <div className="space-y-6">
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Manzil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">StartPetrol Yoqilg'i Stansiyasi</p>
                  <p className="text-muted-foreground">Amir Temur ko'chasi, 108</p>
                  <p className="text-muted-foreground">Toshkent, O'zbekiston</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Navigation className="mr-2 h-4 w-4" />
                  Yo'l ko'rsatish
                </Button>
              </CardContent>
            </Card>

            <Card className="product-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Aloqa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+998 (71) 123-45-67</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>24/7 ochiq</span>
                </div>
              </CardContent>
            </Card>

            <Card className="product-card bg-gradient-primary">
              <CardContent className="p-6 text-center text-primary-foreground">
                <h3 className="font-bold mb-2">Premium Xizmat</h3>
                <p className="text-sm opacity-90">
                  Eng yaxshi yoqilg'i va mukammal xizmat uchun bizga tashrif buyuring
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;