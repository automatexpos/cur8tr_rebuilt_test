import LocationMap from '../LocationMap';

export default function LocationMapExample() {
  return (
    <div className="p-6">
      <LocationMap 
        onLocationSelect={(location) => console.log('Location selected:', location)}
      />
    </div>
  );
}
