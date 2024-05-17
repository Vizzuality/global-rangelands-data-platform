import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"
import { MapStyles } from "../types"
import { ChevronDown } from "lucide-react"
import GlobeSvg from '@/svgs/globe.svg'
import { Switch } from "@/components/ui/switch"

const mapStyleOptions = [
    {
        label: 'Light',
        value: 'light',
        icon: '/images/map-style/light.png'
    },
    {
        label: 'Dark',
        value: 'dark',
        icon: '/images/map-style/dark.png'
    },
    {
        label: 'Satellite',
        value: 'satellite',
        icon: '/images/map-style/satellite.png'
    }

]

const otherOptions = [
    {
        label: 'Labels',
        value: 'labels',
    },
    {
        label: 'Roads',
        value: 'roads',
    },
    {
        label: 'Boundaries',
        value: 'boundaries',
    }

]

export type MapControllerProps = {
    onChangeMapStyle: (style: MapStyles) => void
}

const MapControls = ({ onChangeMapStyle }: MapControllerProps) => {
    return (
    <Collapsible className="text-sm space-y-4">
      <CollapsibleTrigger className="group flex gap-2 items-center">
        <GlobeSvg className="fill-globe" />
        Map style 
        <ChevronDown className="group-data-[state=open]:rotate-180 w-5" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <RadioGroup onValueChange={onChangeMapStyle} defaultValue={mapStyleOptions[0].value} className="space-y-2">
        {
          mapStyleOptions.map((option) => (
            <div className="flex gap-2 items-center">
                <RadioGroupItem value={option.value} key={option.value} className="flex items-center justify-center border-none">
                    <Image src={option.icon} alt={option.label} width={20} height={20} />
                    <RadioGroupIndicator asChild>
                        <div className="w-6 h-6 absolute rounded-full border border-global" />
                    </RadioGroupIndicator>
                </RadioGroupItem>
                <label htmlFor={option.value}>{option.label}</label>
            </div>
          ))
        }
        </RadioGroup>
        <div>
            {
                otherOptions.map((option) => (
                    <div className="flex items-center">
                        <Switch key={option.value} value={option.value} />
                        <label htmlFor={option.value}>{option.label}</label>
                    </div>
                ))
            }
        </div>
        
      </CollapsibleContent>
    </Collapsible>
    )
}

export default MapControls;