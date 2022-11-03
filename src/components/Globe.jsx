import {React, Component} from 'react';
import Globe from 'react-globe.gl';
import earth from './images/globe.jpg';
import worldcities from './data/cities.csv'
import * as d3 from 'd3';

export default class CustomGlobe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      didResize: false,
      width: 0,
      height: 0,
      countries: [],
      population: []
    };
  }

  componentDidMount() {
    fetch('https://pkgstore.datahub.io/core/geo-countries/countries/archive/23f420f929e0e09c39d916b8aaa166fb/countries.geojson')
      .then(res => res.json())
      .then(countries => this.setState({countries: countries.features}))


    fetch(worldcities).then(res => res.text())
    .then(csv => {
      let parsedData = d3.csvParse(csv, ({lat, lng, population}) => ({lat: +lat, lng: +lng, pop: +population}))
      this.setState({population: parsedData})
    })

    window.addEventListener('resize', this.pageResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.pageResize);
  }

  pageResize = (event) => {
    this.setState({
      didResize: true,
      width: event.target.innerWidth,
      height: event.target.innerHeight
    });
  }

  render() {
    const weightColor = d3.scaleSequentialSqrt(d3.interpolateYlOrRd)
      .domain([0, 1e7]);

    const didResize = this.state.didResize;
    const width = this.state.width;
    const height = this.state.height;
    const countries = this.state.countries;
    return (<div>
      {didResize ?
        <Globe 
          width={width}
          height={height}
          globeImageUrl={earth}
          hexBinPointsData={this.state.population}
          hexBinPointWeight="pop"
          hexAltitude={d => d.sumWeight * 6e-8}
          hexBinResolution={4}
          hexTopColor={d => weightColor(d.sumWeight)}
          hexSideColor={d => weightColor(d.sumWeight)}
          hexBinMerge={true}
          enablePointerInteraction={false}
          polygonsData={countries}
          polygonCapColor={() => 'rgba(255, 255, 255, 0)'}
          polygonSideColor={() => 'rgba(255, 255, 255, 0)'}
          polygonStrokeColor={() => 'rgb(0, 0, 0)'} /> : 
        <Globe 
          globeImageUrl={earth}
          hexBinPointsData={this.state.population}
          hexBinPointWeight="pop"
          hexAltitude={d => d.sumWeight * 6e-8}
          hexBinResolution={4}
          hexTopColor={d => weightColor(d.sumWeight)}
          hexSideColor={d => weightColor(d.sumWeight)}
          hexBinMerge={true}
          enablePointerInteraction={false}
          polygonsData={countries}
          polygonCapColor={() => 'rgba(255, 255, 255, 0)'}
          polygonSideColor={() => 'rgba(255, 255, 255, 0)'}
          polygonStrokeColor={() => 'rgb(0, 0, 0)'}/>
      }
    </div>)
  }
}