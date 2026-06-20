import React from 'react';
import '../../CSS/spot_toolbar.css';
import {PlayerDlg, ComputerDlg, debugMode} from "../../code/globals";
import SpotsImages from "../../assets/images/Spot/spots.png";

const SpotToolbar = ({state, handleSpotDialogTrigger}) => {
	if (debugMode) {
		console.log("Redrawing SpotToolbar");
	}

	return (
		<div className="Spot_toolbar" style={{display: (state.selectedTab === 1) ? "block" : "none"}}>

			<div className="ramka left">
				<p>Player</p>
				<div className="Spot_color left"
					 style={{background: `url(${SpotsImages}) -80px ${-40*(PlayerDlg.color)}px no-repeat black`}}
				></div>
			</div>

			<button id="Spot_toolbar_button"
					onClick={handleSpotDialogTrigger}
			><span className="mytooltiptext">Spot's options</span>
			</button>

			<div className="ramka right">
				<p>Computer</p>
				<div className="Spot_color right"
					 style={{background: `url(${SpotsImages}) -80px ${-40*(ComputerDlg.color)}px no-repeat black`}}
				></div>
			</div>

		</div>
	);
}

export default SpotToolbar;