import Navigation from '../Navigation';

export default function NavigationExample() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2 px-6">Logged out state:</p>
        <Navigation
          isLoggedIn={false}
          onLogin={() => console.log('Login clicked')}
          onSearch={() => console.log('Search clicked')}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2 px-6">Logged in state:</p>
        <Navigation
          isLoggedIn={true}
          username="johndoe"
          onCreateRec={() => console.log('Create rec clicked')}
          onSearch={() => console.log('Search clicked')}
          onProfile={() => console.log('Profile clicked')}
        />
      </div>
    </div>
  );
}
