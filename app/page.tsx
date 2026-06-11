import Hero from '@/components/sections/Hero';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import Benefits from '@/components/sections/Benefits';
import IngredientStory from '@/components/sections/IngredientStory';
import RitualSteps from '@/components/sections/RitualSteps';
import Reviews from '@/components/sections/Reviews';
import ShopSection from '@/components/sections/ShopSection';
import Footer from '@/components/experience/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <Benefits />
      <IngredientStory />
      <RitualSteps />
      <Reviews />
      <ShopSection />
      <Footer />
    </main>
  );
}
