//import { buscador_gasolineras } from "../gasolineras.js";

//Inicializar el mapa
var map = L.map('map',{zoomControl: false}).setView([28.09973, -15.41343], 10);

//Agregar el mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
maxZoom: 18
}).addTo(map);

L.control.zoom({position: "bottomright"}).addTo(map);

//Crear capa de gasolineras vacia para agregar gasolineras encontradas
var gasLayer = L.layerGroup().addTo(map);

//Lista de marcadores
var markers=[];
//Envio del formulario de busqueda de gasolineras
document.getElementById('route-form').addEventListener('submit', function(e){
    e.preventDefault();//Prevenir el envio del formulario

    var origin=document.getElementById('origin').value;
    var destination=document.getElementById('destination').value;

    //console.log(origin);
    //console.log(destination);

    for(let j=0; j<markers.length;j++){
        map.removeLayer(markers[j]);
    }


//Obtener los valores de los campos del formulario
var gasType=document.getElementById('gas-type').value;
//var origin=document.getElementById('origin').value;
//var destination=document.getElementById('destination').value;





//Obtener las coordenadas de origen y destino utilizando la API de OpenStreetMap
//var url = 'https://nominatim.openstreetmap.org/search?q=' + origin + ',' + destination + '&format=json';
var origen_url = 'https://nominatim.openstreetmap.org/search.php?q=' + origin +'&format=jsonv2';
fetch(origen_url)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        console.log(data);
        var originCoords=[parseFloat(data[0].lat), parseFloat(data[0].lon)];//Coordenadas origen
        
        console.log(originCoords);

        var destino_url = 'https://nominatim.openstreetmap.org/search.php?q=' + destination +'&format=jsonv2';
        fetch(destino_url)
            .then(function(response){
                return response.json();
            })
            .then(function(data2){
                var destinationCoords=[parseFloat(data2[0].lat), parseFloat(data2[0].lon)];//Coordenadas destino
                console.log(destinationCoords);
                //Obtener la ruta utilizando la API de OpenRouteService
                //var routeURL = 'https://api.openrouteservice.org/v2/directions/driving-car?start=' + originCoords[1] + ',' + originCoords[0] + '&end=' + destinationCoords[1] + ',' + destinationCoords[0] + '&api_key=<5b3ce3597851110001cf6248ec6cc375881a440db695f6f2fb789576>'; 
                var routeURL = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248ec6cc375881a440db695f6f2fb789576&start=' + originCoords[1] + ',' + originCoords[0] + '&end=' + destinationCoords[1] + ',' + destinationCoords[0]; 
                fetch(routeURL)
                    .then(function(response){
                        return response.json();
                    })
                    .then(function(data3){
                        //Obtener las coordenadas de los puntos de la ruta
                        var coords=data3.features[0].geometry.coordinates.map(function(coord){
                            console.log(coord[1], coord[0]);
                            return [coord[1], coord[0]];
                        });


                        for (let i=0; i<coords.length; i++){
                            //var marker=L.marker([coords[i][0],coords[i][1]]).addTo(map);
                            if(i == 0 || i==coords.length-1){
                                markers.push(L.marker([coords[i][0],coords[i][1]]).addTo(map));
                            }else{
                                markers.push(L.circleMarker([coords[i][0],coords[i][1]],{ radius: 5}).addTo(map));
                            }
                            
                        }
                        
                        buscador_gasolineras(1000,coords).then(function (result) {
                            result.forEach(element => {
                                let coordGasolinera = element.split(",");
                                console.log(coordGasolinera);
                                markers.push(L.marker([parseFloat(coordGasolinera[1]),parseFloat(coordGasolinera[0])]).addTo(map));
                            });
                        })
                        
                              

                    })
                    .catch(function(error){
                        console.log(error);
                    });

            })
            .catch(function(error){
                console.log(error);
            });
    

    })
    .catch(function(error){
        console.log(error);
    });

});
