'use strict';
const config=require('./files/gpx_config.json')
const fs=require('fs');
const moment=require('moment');
const coordinates=config.coordinates;
const names=config.names;

var divider=5, multiplier=10, gpx, newCoord, coord, coordLat, coordLon, nextCoordLat, nextCoordTime, jumpCoord;

function createGPX(coordinates, multiplier, divider){
	var coordTime=moment('2018-06-01T00:00:00').format('YYYY-MM-DD[T]HH:mm:ss'), jump=0;
	for(let x=0;x<coordinates.length;x++){
		nextCoordLat=''; coord=coordinates[x].split(',');
		coordLat=coord[0]; coordLon=coord[1]; jump++
		if(coord[0].length<8){for(let c=coord[0].length; c<8; c++){coord[0]=coord[0]+'0';}}
		nextCoordLat=((coordLat*multiplier)-divider)/multiplier;
		jumpCoord=moment(coordTime).format('YYYY-MM-DD[T]HH:mm:ss');
		nextCoordTime=moment(coordTime).add(config.JUMP_DELAY, 'seconds').format('YYYY-MM-DD[T]HH:mm:ss');
		newCoord='<!-- '+names[x]+' -->\n<wpt lat=\"'+coordLat+'\" lon=\"'+coordLon+'\">\n<time>'+jumpCoord+'Z</time>\n</wpt>\n<wpt lat=\"'+nextCoordLat+'\" lon=\"'+coordLon+'\">\n<time>'+nextCoordTime+'Z</time>\n</wpt>\n';
		if(gpx==undefined){gpx='<?xml version=\"1.0\"?>\n<gpx version=\"1.1\" creator=\"russellg89\">\n';}else{gpx+=newCoord;}
		coordTime=nextCoordTime;
	}
	if(config.ALTERNATE_DELAYS==true){
		for(let x=0;x<coordinates.length;x++){
			nextCoordLat=''; coord=coordinates[x].split(',');
			coordLat=coord[0]; coordLon=coord[1]; jump++
			if(!names[x]){names[x]='Jump '+x;}
			nextCoordLat=((coordLat*multiplier)-divider)/multiplier;
			jumpCoord=moment(coordTime).format('YYYY-MM-DD[T]HH:mm:ss');
			nextCoordTime=moment(coordTime).add(config.ALT_DELAY, 'seconds').format('YYYY-MM-DD[T]HH:mm:ss');
			newCoord='<!-- '+names[x]+' -->\n<wpt lat=\"'+coordLat+'\" lon=\"'+coordLon+'\">\n<time>'+jumpCoord+'Z</time>\n</wpt>\n<wpt lat=\"'+nextCoordLat+'\" lon=\"'+coordLon+'\">\n<time>'+nextCoordTime+'Z</time>\n</wpt>\n';
			gpx+=newCoord; coordTime=nextCoordTime;
		}
	}
	gpx=gpx+'</gpx>';
	return gpx;
}

async function postGPX(coordinates, coordTime){
	for(let l=4; l<coordinates[0].length; l++){multiplier=multiplier*10;}
	for(let l=8; l<coordinates[0].length; l++){divider=divider*10;}
	var result = await createGPX(coordinates, multiplier, divider);
	console.log(result);
}

postGPX(coordinates);
