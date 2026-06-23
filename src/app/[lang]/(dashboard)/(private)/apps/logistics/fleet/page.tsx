// Component Imports
import Fleet from '@views/apps/logistics/fleet'

const FleetPage = () => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || ''

  return <Fleet mapboxAccessToken={token} />
}

export default FleetPage
