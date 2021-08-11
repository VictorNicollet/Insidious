import { h, JSX } from "preact"
import { useState } from "preact/hooks"
import * as B from "./Box"
import { LocationView } from 'view/locations'
import { WorldView } from 'view/world'
import { AgentCount } from './AgentCount'

export function LocationDetails(props: {
    world: WorldView,
    // The location to display
    location: LocationView
    // The pixel height available for the component to display in
    height: number
}): JSX.Element {
    
    const {location, height} = props;

    return <B.Box title={location.name.short}>
        <p>Pop {location.population}</p>
    </B.Box>
}