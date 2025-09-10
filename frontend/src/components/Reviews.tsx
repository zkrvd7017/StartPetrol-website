import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, User, MessageCircle, Send, ArrowLeft, ChevronUp, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  product: string;
}

const Reviews = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: '',
    productId: '' as string,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReviews = async (signal?: AbortSignal) => {
    const res = await fetch('/api/reviews/', { signal });
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data)) return;
    const mapped: Review[] = data.map((r: any) => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      date: typeof r.date === 'string' ? r.date : new Date().toISOString().split('T')[0],
      product: r.product_label || (typeof r.product === 'object' && r.product?.name ? r.product.name : String(r.product ?? '')),
    }));
    setReviews(mapped);
  };

  const fetchProducts = async (signal?: AbortSignal) => {
    const res = await fetch('/api/products/', { signal });
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data)) return;
    setProducts(data.map((p: any) => ({ id: p.id, name: p.name })));
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(controller.signal).catch(() => {});
    fetchProducts(controller.signal).catch(() => {});
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newReview.name || !newReview.comment || !newReview.productId) {
      setErrorMsg('Barcha maydonlarni to‘ldiring.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = { name: newReview.name, rating: newReview.rating, comment: newReview.comment, product: Number(newReview.productId) };
      const res = await fetch('/api/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchReviews();
        setNewReview({ name: '', rating: 5, comment: '', productId: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.product || 'Yuborishda xatolik.');
      }
    } catch (_) {
      setErrorMsg('Ulanishda xatolik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
      />
    ));
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('reviewsTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('reviewsSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Reviews List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Sharh va Fikrlar
              </h3>
              {!showAllReviews && reviews.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllReviews(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Barcha sharhlar ({reviews.length})
                </Button>
              )}
            </div>
            
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <Card key={review.id} className="product-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{review.name}</h4>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-muted-foreground">
                          ({review.rating}/5)
                        </span>
                      </div>
                      
                      <p className="text-sm text-primary font-medium mb-2">
                        {review.product}
                      </p>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {showAllReviews && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(false)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Orqaga qaytish
                </Button>
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="sticky top-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Sharh Qoldiring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ismingiz
                    </label>
                    <Input
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      placeholder="To'liq ismingizni kiriting"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mahsulot tanlang
                    </label>
                    <Select value={newReview.productId} onValueChange={(v) => setNewReview({ ...newReview, productId: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Mahsulot..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Baholang
                    </label>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              i < newReview.rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({newReview.rating}/5)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sharhingiz
                    </label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Mahsulot va xizmat haqida batafsil yozing..."
                      rows={4}
                      required
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-sm text-red-500">{errorMsg}</div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full btn-glow"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Yuborilmoqda...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Sharh Yuborish
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 btn-glow"
          >
            <ChevronUp className="h-5 w-5" />
            Yuqoriga qaytish
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Reviews;