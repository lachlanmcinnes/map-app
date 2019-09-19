import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker'
import './App.css';

const fetch=require("node-fetch");
const places=require('places.js');

class App extends React.Component{
	
	state = {
		status : "ALL",
		classification: "ALL",
		events: [],
		lat: "0",
		lng: "0",
		distance: "500",
		background: 'green'
	}
	
	cChange() {
		var background =  "";
		return {background: background};
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
			url+=`status=${this.state.status}&`
		}
		if(this.state.lat!=='0'){
			url+=`$where=within_circle(the_geom,${this.state.lat},${this.state.lng},${this.state.distance})`;
			console.log(url);
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
		
		var placesAutoComplete = places({
			appId: 'plY0BYIMLL9G',
			apiKey: 'f14232e9f94d077e60d8007c1b05c5bb',
			container: document.querySelector('#address'),
			type: 'address'
		});
		
		placesAutoComplete.on('change', e => {
			this.setState({lat: e.suggestion.latlng.lat ,lng: e.suggestion.latlng.lng}, this.fetchInfo);
			console.log(JSON.stringify(e.suggestion.latlng.lat))
		});
	}
	
	sliderChange(e){
		let obj = {};
		obj[e.target.payload] = e.target.value;
		console.log(JSON.stringify(obj));
	}
	
	handleMarkerClick=({ event, payload, anchor }) => {
		console.log(`Marker #${JSON.stringify(payload)} clicked at: `, anchor);
		this.setState({selectedIcon: payload})
	}
	
	handleMarkerColor=({ event, payload }) => {
		var t = this.cChange()
		
		if (payload.status === 'WARNING'){
			t.background='red';
			return t;
		}else{
			t.background='green';
			return t;
		}
	}
	
	render() {
		const status = ['ALL', 'PROVISIONAL', 'CONFIRMED', 'WARNING', ]
		const classification = ['ALL', 'Public Event', 'Structures', 'Event', ]
		
		var RedMarker = ({ left, top, style, children, status }) => (
		  <div style={{
			position: 'absolute',
			left: left,
			top: top,
			width: "20px",
			height: "20px",
			borderRadius: "50% 50% 50% 0",
			borderColor: "black",
			borderWidth: "thin",
			borderStyle: "solid",
			background: status==='WARNING' ? 'red' : 'green',
			transform: "rotate(-45deg)",
			margin: "-20px 0 0 -20px",
			...(style || {})
		  }}>{children}</div>
		)
		
		return (
			<div className="App">
				<input type="search" id="address" className="form-control" placeholder="Where are we going?" />
				<div className="slidecontainer">
					<input type="range" min="1" max="1000" name='distance' value={this.state.distance} className="slider" id="myRange" onChange={(e) => {this.sliderChange(e)}}/>
				</div>
				
				<header className="App-header">
					<Map center={[-37.8470585,145.1145445]} zoom={12} width={600} height={400} >
						<Marker anchor={[-37.8470585,145.1145445]} payload={1} />
						{this.state.events.map(i=> (<RedMarker anchor={[i.the_geom.coordinates[0][0][0][1],i.the_geom.coordinates[0][0][0][0]]} payload={i} status={i.status} onClick={this.handleMarkerClick}/>))}
					</Map>
					
					
					
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
