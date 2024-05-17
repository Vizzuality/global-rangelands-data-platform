'use client';
import MapComponent from '@/components/map'
import MapController from '@/components/map/controls';
import { MAPBOX_STYLE } from '@/components/map/constants'
import { useEffect, useState } from 'react';
import { useMap } from 'react-map-gl';
import { MapStyles } from '@/components/map/types';

const Map = () => {
    const map = useMap()
    const [mapStyle, setMapStyle] = useState(MAPBOX_STYLE.light)
    
    const handleChangeMapStyle = (style: MapStyles) => {
        setMapStyle(MAPBOX_STYLE[style])
    }
    useEffect(() => {
        console.log(map)
    }
    , [map])
    
    return (
        <div className='w-full h-full'>
          <MapComponent
            mapStyle={mapStyle}
            projection={{
                name: "mercator"
            }}
          >

            <div className="absolute top-6 left-1/2 bg-white/40 backdrop-blur-lg p-6 rounded-[40px]">
              <MapController onChangeMapStyle={handleChangeMapStyle} />
            </div>
          </MapComponent>
        </div>
    )
}

export default Map;