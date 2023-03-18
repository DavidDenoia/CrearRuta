//Inicializar el mapa
var map = L.map('map').setView([28.09973, -15.41343], 10);

//Agregar el mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
maxZoom: 18
}).addTo(map);

//Crear capa de gasolineras vacia para agregar gasolineras encontradas
var gasLayer = L.layerGroup().addTo(map);

//Lista de marcadores
var markers=[];

//Gracias señor de https://stackoverflow.com/questions/23567203/leaflet-changing-marker-color por enseñarme como cambiar el color de un marker.
//Un crack
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], // tamaño del icono
    iconAnchor: [12, 41], // posición de anclaje
    popupAnchor: [1, -34], // posición de la ventana emergente
    shadowSize: [41, 41] // tamaño de la sombra
});

//Lista de marcadores filtrados
var markersFiltrados=[]; 

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

    for(let j=0; j<markersFiltrados.length;j++){
        map.removeLayer(markersFiltrados[j]);
    }

   


//Obtener los valores de los campos del formulario
var gasType=document.getElementById('gas-type').value;
//var origin=document.getElementById('origin').value;
//var destination=document.getElementById('destination').value;


//Esto es la implementacion de la formula de Haversine.
//Gracias chatGPT and señor@ de https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript

function calcularDistancia(lat1,lon1,lat2,lon2){
    const R = 6371e3; // Radio medio de la Tierra en metros
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const deltaLat = (lat2 - lat1) * (Math.PI / 180);
    const deltaLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function filtrarPuntosCercanos(coords){
    const distanciaSeparacionMinima=100;
    
    const resultado=[coords[0]];

    for (let i = 1; i < coords.length - 1; i++) {
        const lat1 = coords[i - 1][0];
        const lon1 = coords[i - 1][1];
        const lat2 = coords[i][0];
        const lon2 = coords[i][1];
    
        const distancia = calcularDistancia(lat1, lon1, lat2, lon2);
    
        if (distancia >= distanciaSeparacionMinima) {
          resultado.push(coords[i]);
        }
    }

    resultado.push(coords[coords.length - 1]);
    return resultado;
}


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

                        const coordsFiltradas=filtrarPuntosCercanos(coords);

                        for (let i=0; i<coordsFiltradas.length; i++){
                            markersFiltrados.push(L.marker([coordsFiltradas[i][0],coordsFiltradas[i][1]],{icon: greenIcon}).addTo(map));
                            
                        }
                        

                        for (let i=0; i<coords.length; i++){
                            //var marker=L.marker([coords[i][0],coords[i][1]]).addTo(map);
                            if(i == 0 || i==coords.length-1){
                                markers.push(L.marker([coords[i][0],coords[i][1]]).addTo(map));
                            }else{
                                markers.push(L.circleMarker([coords[i][0],coords[i][1]],{ radius: 5}).addTo(map));
                            }
                            
                        }                     
                        
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
