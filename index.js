let map, bounds;
const API_KEY = '7e03f1d649msh55219f57b2d3204p1ee8e1jsn68b9e82a05d8';

async function initMap() {
  const center = { lat: 35.567211, lng: -5.371620 }
  const zoom = 8
  const { Map } = await google.maps.importLibrary("maps");
  map = new Map(document.getElementById("mapContent"), {
    center,
    zoom,
    disableDefaultUI: true
  })

  bounds = new google.maps.LatLngBounds
}
window.initMap = initMap;

const createLiCountryName = (country_name) => {
  const li = document.createElement('li')
  li.classList.add('p-px', 'hover:bg-teal-200', 'cursor-pointer', 'translate-all', 'duration-300', 'ease-in-out')
  li.innerText = country_name
  li.setAttribute('data-country', country_name)
  return li
}

const fetchCountries = async () => {
  const country_options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/countries?limit=10&offset=110", country_options);
    const result = await response.json();
    return result.data
  } catch (error) {
    return error;
  }
};

(loadCountries = async () => {
  const countries = await fetchCountries()
  const countriesList = document.querySelector('#countries_list')
  const countriesInput = document.querySelector('#countries_input')

  countries.forEach(element => {
    countriesList.appendChild(createLiCountryName(element.name))
  });

  countriesList.classList.add('hidden')
  countriesInput.addEventListener('click', () => {
    countriesList.classList.remove('hidden')
  })

  const allCountries = Array.from(countriesList.children)
  allCountries.map((country) => {
    country.addEventListener('click', (e) => {
      countriesInput.value = e.target.dataset.country
      countriesList.classList.add('hidden')
      fetchHotels(e.target.dataset.country)
    })
  })
})()

const fetchHotels = async (country) => {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(`https://hotels4.p.rapidapi.com/locations/v3/search?q=${country}`, options);
    const result = await response.json();
    getMarkers(result.sr)
  } catch (error) {
    console.error(error);
  }
}


const getMarkers = (markers) => {
  markers.map((hotel, index) => {
    const position = { lat: parseFloat(hotel.coordinates.lat), lng: parseFloat(hotel.coordinates.long) }
    const icon = {
      url: './location.png',
      scaledSize: new google.maps.Size(40, 40),
    }
    const label = (index + 1).toString()

    new google.maps.Marker({ position, label, map })

    bounds.extend(new google.maps.LatLng(position))

    map.fitBounds(bounds)
  });
}

const search = document.querySelector('#search')
const suggest_lists = document.querySelector('#suggest_lists')
search.addEventListener('input', async (e) => {
  if (e.target.value === '') {
    suggest_lists.replaceChildren()
  } else {
    const countries = await fetchCountries()
    const selectCountries = countries.filter(country => country.name.toLowerCase().includes(e.target.value.toLowerCase()))
    suggest_lists.replaceChildren()
    selectCountries.map(country => {
      suggest_lists.appendChild(createLiCountryName(country.name))
    })

    const filterCountries = Array.from(suggest_lists.children)
    filterCountries.map(country => {
      country.addEventListener('click', (e) => {
        fetchHotels(e.target.dataset.country)
        search.value = e.target.dataset.country
        suggest_lists.replaceChildren()
      })
    })
  }
})