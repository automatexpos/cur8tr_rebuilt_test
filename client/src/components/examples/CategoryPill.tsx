import CategoryPill from '../CategoryPill';
import { Book, Coffee, Mountain, UtensilsCrossed, Home, Package } from 'lucide-react';
import { useState } from 'react';

export default function CategoryPillExample() {
  const [active, setActive] = useState('Books');

  return (
    <div className="flex flex-wrap gap-3 p-6">
      <CategoryPill 
        icon={Book} 
        label="Books" 
        count={24} 
        active={active === 'Books'}
        onClick={() => setActive('Books')}
      />
      <CategoryPill 
        icon={Coffee} 
        label="Coffee" 
        count={18} 
        active={active === 'Coffee'}
        onClick={() => setActive('Coffee')}
      />
      <CategoryPill 
        icon={Mountain} 
        label="Hikes" 
        count={12} 
        active={active === 'Hikes'}
        onClick={() => setActive('Hikes')}
      />
      <CategoryPill 
        icon={UtensilsCrossed} 
        label="Restaurants" 
        count={31} 
        active={active === 'Restaurants'}
        onClick={() => setActive('Restaurants')}
      />
      <CategoryPill 
        icon={Home} 
        label="Where To Stay" 
        count={8} 
        active={active === 'Where To Stay'}
        onClick={() => setActive('Where To Stay')}
      />
      <CategoryPill 
        icon={Package} 
        label="Products" 
        count={45} 
        active={active === 'Products'}
        onClick={() => setActive('Products')}
      />
    </div>
  );
}
