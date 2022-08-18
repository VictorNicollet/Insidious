import { Fragment, h, JSX } from "preact"
import * as B from "./Box"
import { integer, population } from './numbers'
import { InnerAgentList } from './AgentList'
import { useMemo } from 'preact/hooks'
import { useSelectors, useWorld } from './Context'
import { notUndefined } from '../notundefined'
import type { LocationView } from "../view/locations"
import type { WorldView } from "../view/world"
import type { LocationPages } from "./Screen"
import { never } from "../never"
import * as Help from "../text/help"
import { TipInfoLine, Tooltip } from "./Tooltip"
import { Explain } from "./Explain"

// Size of the top-of-box info region
const INFOHEIGHT = 48 /* table */ + 17 /* h4 */;

export const infolevel = [
    /* 0 */ "None",     
    /* 1 */ "Basic",
    /* 2 */ "Poor",
    /* 3 */ "Moderate",
    /* 4 */ "Good", 
    /* 5 */ "Excellent", 
    /* 6 */ "Perfect"
]

function LocationAgentsPage(props: {
    world: WorldView,
    location: LocationView,
    height: number,
}) : JSX.Element {

    const agents = useMemo(
        () => notUndefined(props.location.agents.map(i => props.world.agents.idx(i))),
        [props.location, props.world]);

    return <Fragment>
        <table class="gui-info-table">
            <tr><th>Location Type</th><td>{props.location.cellKind.name}</td></tr>
            <tr><th>Adult Population</th><td>{population(props.location.population, props.location.information)}</td></tr>
            <tr><th>Information</th><td>{infolevel[props.location.information]}</td></tr>
        </table>
        <hr/>
        <InnerAgentList agents={agents} 
                        noLocation={true}
                        empty="You have no agents in this location."
                        height={props.height - INFOHEIGHT}/>
    </Fragment>;
}

function LocationCultPage(props: {
    location: LocationView,
    height: number 
}) : JSX.Element {

    const recruit = props.location.cultrecruit;
    if (!recruit)
        return <div style={{height: props.height, paddingTop: 20, textAlign: "center"}}>
            You have not yet founded a cult in your name. 
        </div>

    return <Fragment>
        <table class="gui-info-table">            
            <TipInfoLine label="Cult Members" value={integer(props.location.cultpop)}/>
        </table>
        <hr/>
        <table class="gui-info-table">
            <TipInfoLine label="Recruitment Difficulty" 
                value={integer(recruit.difficulty.value)} 
                tooltip={<Tooltip tip={Help.recruitmentDifficultyTip} ctx={{}}
                    inserts={[<Fragment>
                        {integer(recruit.difficulty.value)}
                        <Explain value={recruit.difficulty}/>
                    </Fragment>]}/>}/>
            <TipInfoLine label="Recruitment Power" 
                value={recruit.needPriest ? "0" : integer(recruit.totalPower)}
                tooltip={<Tooltip 
                    tip={Help.recruitmentPowerTip(recruit.needPriest)} 
                    ctx={{location:props.location.name.short}} 
                    inserts={[]}/>}/>
            <TipInfoLine label="\u2003\u2003from priests"
                value={integer(recruit.priestPower.value)}
                tooltip={<Tooltip
                    tip={Help.priestRecruitmentPowerTip + "\n\n***\n\n%0"}
                    ctx={{}}
                    inserts={[<Fragment>
                        {integer(recruit.priestPower.value)}
                        <Explain value={recruit.priestPower}/>
                    </Fragment>]}/>}/>
            <TipInfoLine label="\u2003\u2003from members"
                value={integer(recruit.memberPower.value)}
                tooltip={<Tooltip
                    tip={Help.memberRecruitmentPowerTip + "\n\n***\n\n%0"}
                    ctx={{}}
                    inserts={[<Fragment>
                        {integer(recruit.memberPower.value)}
                        <Explain value={recruit.memberPower}/>
                    </Fragment>]}/>}/>
            <TipInfoLine label="\u2003\u2003from exposure"
                value={integer(recruit.exposurePower.value)}
                tooltip={<Tooltip
                    tip={Help.exposureRecruitmentPowerTip + "\n\n***\n\n%0"}
                    ctx={{}}
                    inserts={[<Fragment>
                        {integer(recruit.exposurePower.value)}
                        <Explain value={recruit.exposurePower}/>
                    </Fragment>]}/>}/>
        </table>
    </Fragment>
}

const locationPages : LocationPages[] = ["Agents","Cult"]

export function LocationDetails(props: {
    // The location to display
    location: number
    // The location page to display
    page: LocationPages
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const sel = useSelectors();
    const world = useWorld();
    const location = world.locations[props.location]; 
    const innerHeight = B.innerHeight(props.height);

    return <B.Box<LocationPages> title={location.name.short} 
            close={props.close}
            tabs={locationPages}
            tab={props.page}
            onTab={page => sel.location(location, page)}>
        {props.page == "Agents" 
            ? <LocationAgentsPage height={innerHeight} world={world} location={location} /> :
         props.page == "Cult"
            ? <LocationCultPage height={innerHeight} location={location}/> :
         never(props.page)}
    </B.Box>
}