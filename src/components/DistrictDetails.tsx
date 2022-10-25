import { Fragment, h, JSX } from "preact"
import * as B from "./Box"
import { integer } from './numbers'
import { useSelectors, useWorld } from './Context'
import * as Help from "../text/help"
import { TipInfoLine, Tooltip } from "./Tooltip"
import { Explain } from "./Explain"
import type { DistrictView } from "../view/districts"

function DistrictCultPage(props: {
    district: DistrictView,
    height: number 
}) : JSX.Element {

    const recruit = props.district.cultrecruit;
    if (!recruit)
        return <div style={{height: props.height, paddingTop: 20, textAlign: "center"}}>
            You have not yet founded a cult in your name. 
        </div>

    return <Fragment>
        <table class="gui-info-table">            
            <TipInfoLine label="Cult Members" value={integer(props.district.cultpop)}/>
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
                    ctx={{location:props.district.name.short}} 
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


export function DistrictDetails(props: {
    // The district to display
    district: number
    // The pixel height available for the component to display in
    height: number
    // Close this panel
    close: () => void
}): JSX.Element {
    
    const sel = useSelectors();
    const world = useWorld();
    const district = world.districts[props.district]; 
    const innerHeight = B.innerHeight(props.height);

    return <B.Box title={district.name.short} 
            close={props.close}>
        <DistrictCultPage district={district} height={innerHeight}/>
    </B.Box>
}