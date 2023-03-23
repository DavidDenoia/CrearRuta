export async function buscador_gasolineras(radio, coords) {
    
    let setGasolineras = new Set()
    var fetches=[];
    for (let i=0; i<coords.length;i++){
        fetches.push(
        fetch("https://api.geoapify.com/v2/places?categories=service.vehicle.fuel&filter=circle:"+String(coords[i][1])+","+String(coords[i][0])+","+String(radio)+"&bias=proximity:"+String(coords[i][1])+","+String(coords[i][0])+"&limit=20&apiKey=5defe68cc4dc4bffb53b9cc477f721f5")
        .then(result => result.json())
        .then(featureCollection =>{
            //console.log(featureCollection)
            featureCollection.features.forEach(element => {
                setGasolineras.add(element.geometry.coordinates.toString())
            });
        })
        .catch(error => console.log('error', error))
        );
    }
    return Promise.all(fetches).then(function () {
        return setGasolineras
        
    })
}
