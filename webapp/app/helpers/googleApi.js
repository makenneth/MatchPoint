import request from 'request-promise';
import { client } from "../helpers/appModules";

export async function getPredictions(query) {
  const apiKey = 'AIzaSyD6ANrl7aamAgPdRf9d0OsDsnlbMXos7xg';
  const googleApiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  const response = await request(`${googleApiUrl}?types=address&key=${apiKey}&input=${query}`);
  const data = JSON.parse(response);
  console.log(data);
  if (data.status === 'OK') {
    const predictions = data.predictions.map(p => ({
      terms: p.terms,
      description: p.description,
    }))
    return predictions;
  }
  return [];
}

export async function getGeoCode(address) {
  const apiKey = 'AIzaSyDgjXJPSkK2rnYCMuVpxUpVc9WmrVixbaM';
  const googleApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  const response = await request(`${googleApiUrl}?key=${apiKey}&address=${address}`);
  const data = JSON.parse(response);

  if (data.status === 'OK') {
    return data.results[0].geometry.location;
  }
  throw { address: 'Address not found.' };
}
