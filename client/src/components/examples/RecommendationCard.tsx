import RecommendationCard from '../RecommendationCard';
import coffeeImage from '@assets/generated_images/Coffee_shop_recommendation_03e026e5.png';

export default function RecommendationCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <RecommendationCard
        id="1"
        image={coffeeImage}
        title="The Morning Brew"
        subtitle="Best cortado in the city with amazing vibes"
        isProTip={true}
        onClick={() => console.log('Card clicked')}
      />
      <RecommendationCard
        id="2"
        image={coffeeImage}
        title="Sunset Trail Hike"
        subtitle="3-mile loop with stunning valley views"
        externalUrl="https://example.com"
      />
    </div>
  );
}
