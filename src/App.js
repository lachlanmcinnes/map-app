import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker'
import './App.css';

const fetch=require("node-fetch");

class App extends React.Component{
	state = {
		status : "ALL",
		classification : "ALL",
		events: []
	}
	
	statusChanged = (e) => {
		this.setState({status:e.target.value},this.fetchInfo);
	}
		
	classificationChanged = (e) => {
		this.setState({classification:e.target.value}, this.fetchInfo);
	}
	
	fetchInfo = () => {
		
		let url = 'https://data.melbourne.vic.gov.au/resource/txcy-uafv.json?';
		if(this.state.classification!== 'ALL'){
			url+=`classification=${this.state.classification}&`
		}
		if(this.state.status!=='ALL'){
			url+=`status=${this.state.status}`
		}
		
		fetch(url)
			.then(response => response.json())
			.then(data => {
				this.setState({events:data})
			})
			.catch(error=> {
				
			});
	}
	
	componentDidMount(){
		this.fetchInfo();
	}
	
	handleMarkerClick=({ event, payload, anchor }) => {
		console.log(`Marker #${JSON.stringify(payload)} clicked at: `, anchor);
		this.setState({selectedIcon: payload})
	}
	
	render() {
		const status = ['ALL', 'PROVISIONAL', 'CONFIRMED', 'WARNING', ]
		const classification = ['ALL', 'Public Event', 'Structures', 'Event', ]
		return (
			<div className="App">
				<header className="App-header">
					<Map center={[-37.8470585,145.1145445]} zoom={12} width={600} height={400}>
						<Marker anchor={[-37.8470585,145.1145445]} payload={1}/>
						{this.state.events.map(i=> (<Marker anchor={[i.the_geom.coordinates[0][0][0][1],i.the_geom.coordinates[0][0][0][0]]} payload={i} onClick={this.handleMarkerClick}/>))}
					</Map>
					
					{this.setState.selectedIcon && JSON.stringify(this.state.selectedIcon)}
					
					<label>Status</label>
					<select onChange={this.statusChanged} value={this.state.status}>
						{status.map(i=>(<option value={i}>{i}</option>))}
					</select>
					<label>Classification</label>
					<select onChange={this.classificationChanged} value={this.state.classification}>
						{classification.map(i=>(<option value={i}>{i}</option>))}
					</select>
				</header>
			</div>
		)
	}
}

export default App;
