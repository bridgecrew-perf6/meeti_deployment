import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

const lat = document.querySelector('#lat').value || -12.04318;
const lng = document.querySelector('#lng').value || -77.02824;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map("mapa").setView([lat, lng], 15);

let markers = new L.FeatureGroup().addTo(map);
let marker;
//Utilizar el provider y GeoCoder
const geocodeService = L.esri.Geocoding.geocodeService();

//Colocar el Pin en Edición
if (lat && lng) {
     // agregar el pin
     marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true,
    })
    .addTo(map)
    .bindPopup(direccion)
    .openPopup();

    //asignar al contenedor markers
    markers.addLayer(marker);

     //detectar movimiento del marker
     marker.on('moveend', function(e) {
        marker = e.target;
        // console.log(marker.getLatLng());
        const posicion = marker.getLatLng();
        map.panTo(new L.LatLng(posicion.lat, posicion.lng));

        //reverse geocoding, cuando el usuario reubica el pin
        geocodeService.reverse().latlng(posicion, 15).run(function(error, result){
            // console.log(result);
            llenarInputs(result);
            //asigna los valores al popup del marker
            marker.bindPopup(result.address.LongLabel);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    //buscar la dirección
    const buscador =document.querySelector('#formbuscador');	
    buscador.addEventListener('input', buscarDireccion );
});

function buscarDireccion(e) {

    if (e.target.value.length > 8) {    // console.log('buscando...');

        //si existe un pin anterior limpiarlo
        // markers.clearLayers();
        if (marker) {
            map.removeLayer(marker);
        }
        //Utilizar el provider y GeoCoder
      
        const provider = new OpenStreetMapProvider();
        // console.log(provider);
        provider.search({ query: e.target.value }).then((resultado) => {
            geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result) {
                // console.log(result);
                llenarInputs(result);

                // console.log(resultado);
                //mostrar el mapa
                map.setView(resultado[0].bounds[0], 15);

                // agregar el pin
                marker = new L.marker(resultado[0].bounds[0], {
                    draggable: true,
                    autoPan: true,
                })
                .addTo(map)
                .bindPopup(resultado[0].label)
                .openPopup();

                //asignar al contenedor markers
                markers.addLayer(marker);

                //detectar movimiento del marker
                marker.on('moveend', function(e) {
                    marker = e.target;
                    // console.log(marker.getLatLng());
                    const posicion = marker.getLatLng();
                    map.panTo(new L.LatLng(posicion.lat, posicion.lng));

                    //reverse geocoding, cuando el usuario reubica el pin
                    geocodeService.reverse().latlng(posicion, 15).run(function(error, result){
                        // console.log(result);
                        llenarInputs(result);
                        //asigna los valores al popup del marker
                        marker.bindPopup(result.address.LongLabel);
                    });
                });
            });    
        });

    }       
}

function llenarInputs(resultado) {
    // console.log(resultado);
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}

