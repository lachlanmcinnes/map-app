import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker'
import RedMarker from './RedMarker.js'
import WeatherInfoComponent from'./WeatherInfoComponent';
import './App.css';

const fetch=require("node-fetch");
const places=require('places.js');

const WEATHER_API_KEY = 'b3a1fe31fb871a134c029733070442ae';

class App extends React.Component{
	
	state = {
		status : "ALL",
		classification: "ALL",
		events: [],
		lat: "0",
		lng: "0",
		distance: "500",
		background: 'green',
		hover: false,
		markerName: "",
		temperature: undefined,
		humidity: undefined,
		pressure: undefined,
		wind: undefined,
		cloudiness: undefined
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
			this.fetchWeather();
		}
		
		fetch(url)
			.then(response => response.json())
			.then(data => {
				this.setState({events:data})
			})
			.then(console.log(this.state.events))
			.catch(error=> {
				
			});
			
	}
	
	fetchWeather = () => {
		fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${this.state.lat}&lon=${this.state.lng}&units=metric&appid=${WEATHER_API_KEY}`)
			.then(response => response.json())
			.then(data => {
				this.setState({
					temperature: data.main.temp,
					humidity:data.main.humidity,
					pressure:data.main.pressure,
					wind:data.wind,
					cloudiness:data.weather[0].description,
				})
			}
		)
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
		obj[e.target.name] = e.target.value;
		console.log(JSON.stringify(obj));
		this.setState(obj);
	}
	
	handleClick = ({event, payload, name, anchor}) => {
		console.log(`Marker #${JSON.stringify(payload)} clicked at: `, anchor);
		this.setState({selectedIcon: payload})
	}
	
	handleMouseOver = ({ event, name }) => {
		this.setState({ hover: true , markerName: name})
	}
	
	handleMouseOut = ({ event, name }) => {
		this.setState({ hover: false })
	}
	render() {
		const status = ['ALL', 'PROVISIONAL', 'CONFIRMED', 'WARNING', ]
		const classification = ['ALL', 'Public Event', 'Structures', 'Event', ]
		
		const tooltipStyle = {
			display: this.state.hover ? 'block' : 'none',
			borderColor: "white",
			borderWidth: "thick",
			borderStyle: "solid",
			background: "black"
		}
		
		return (
			<div className="App">
				<input type="search" id="address" className="form-control" placeholder="Where are we going?" />
				<div className="slidecontainer">
					<input type="range" min="1" max="1000" name='distance' value={this.state.distance} className="slider" id="myRange" onChange={(e) => {this.sliderChange(e)}}/>
				</div>
				
				<WeatherInfoComponent 
						temperature={this.state.temperature}
						humidity={this.state.humidity}
						pressure={this.state.pressure}
						wind={this.state.wind}
						cloudiness={this.state.cloudiness}/>
				
				<header className="App-header">
					<Map center={[-37.8470585,145.1145445]} zoom={12} width={600} height={400} >
						<Marker anchor={[-37.8470585,145.1145445]} payload={1} onClick={this.handleClick} />
						{this.state.events.map(i=> (<RedMarker anchor={[i.the_geom.coordinates[0][0][0][1],i.the_geom.coordinates[0][0][0][0]]} status={i.status} key={i.activity_id} name={i.activity_id} payload={i} onClick={this.handleClick} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}/>))}
						<div>
							<div style={tooltipStyle} className="tooltip" >{this.state.markerName}</div>
						</div>
					</Map>
					
					<label>Status</label>
					<select onChange={this.statusChanged} value={this.state.status}>
						{status.map(i=>(<option key={i} value={i}>{i}</option>))}
					</select>
					<label>Classification</label>
					<select onChange={this.classificationChanged} value={this.state.classification}>
						{classification.map(i=>(<option key={i} value={i}>{i}</option>))}
					</select>
				</header>
			</div>
		)
	}
}

export default App;
