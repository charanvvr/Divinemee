import Hero from '@/components/sections/Hero';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import Benefits from '@/components/sections/Benefits';
import IngredientStory from '@/components/sections/IngredientStory';
import RitualSteps from '@/components/sections/RitualSteps';
import Reviews from '@/components/sections/Reviews';
import ShopSection from '@/components/sections/ShopSection';
import Footer from '@/components/experience/Footer';
import CinematicRitual from '@/components/sections/CinematicRitual';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <Benefits />
      <CinematicRitual />
      <IngredientStory />
      <RitualSteps />
      <Reviews />
      <ShopSection />
      <Footer />
    </main>
  );
}
