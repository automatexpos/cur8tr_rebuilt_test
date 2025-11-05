import Hero from '../Hero';

export default function HeroExample() {
  return (
    <Hero
      onSignUp={() => console.log('Sign up clicked')}
      onExplore={() => console.log('Explore clicked')}
    />
  );
}
