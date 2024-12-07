document.addEventListener("DOMContentLoaded", function () { //wait for content to load before running
  const API_KEY = "04bc5b60ec7e43479b66a1282bd27431";  // API key for LastFM
  const API_URL = "https://ws.audioscrobbler.com/2.0/"; // base Url

  // Function to fetch and display albums
  function loadArtistAlbums(artist) {
    if (!artist) {
      alert("Please enter artist name.");
      return;
    }
    // creating full URL to fetch artist albums and encoding query
    const fullURL = `${API_URL}?method=artist.getTopAlbums&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`;

    // create request to call API
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", fullURL, true);
    xmlhttp.send();

    // API responce processing
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4) {  //request complete
        if (xmlhttp.status === 200) { // request successfull
          const response = JSON.parse(xmlhttp.responseText);

          if (response.error) {
            alert("Artist not found. Try again");
            return;
          }

          // Get list of albums and add to div 
          const albums = response.topalbums.album;
          const container = document.getElementById("albumInfo");
          container.innerHTML = ""; // clear previous results
 
          if (!albums || albums.length === 0) {
            container.innerHTML = "<p>No albums found for this artist.</p>";
            return;
          }

          // For each album, fetch track info
          albums.forEach((album) => {
            fetchAlbumTracks(album, container);
          });
        } else {
          console.error("Error fetching data:", xmlhttp.statusText);
        }
      }
    };
  }

  // Function to fetch tracks for album
  function fetchAlbumTracks(album, container) {
    const albumURL = `${API_URL}?method=album.getInfo&artist=${encodeURIComponent(
      album.artist.name)}&album=${encodeURIComponent(album.name)}&api_key=${API_KEY}&format=json`;

    // Create a new XMLHttpRequest to get album details
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", albumURL, true);
    xmlhttp.send();
    
    // process response
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        const response = JSON.parse(xmlhttp.responseText);

        if (response.error || !response.album) {
          console.error("Error fetching album data:", response.message);
          return;
        }

        // get album data 
        const albumData = response.album;

        // Create a div for each album
        const albumDiv = document.createElement("div");
        albumDiv.className = "album";

        // Add album cover image
        const img = document.createElement("img");
        img.src = album.image[2]["#text"]; // Medium-sized image
        albumDiv.appendChild(img);

        // Add album name and create header
        const title = document.createElement("h3");
        title.textContent = album.name;
        albumDiv.appendChild(title);

        // Add track list
        const trackList = document.createElement("ul");
        trackList.className = "track-list";

        // Check if the album has tracks
        if (albumData.tracks && albumData.tracks.track) {
          const tracks = Array.isArray(albumData.tracks.track)
            ? albumData.tracks.track 
            : [albumData.tracks.track]; // create array if not in array

          tracks.forEach((track) => {
            const trackItem = document.createElement("li");
            trackItem.textContent = track.name;
            trackList.appendChild(trackItem);
          });
          // no tracks info
        } else {
          const noTracksItem = document.createElement("li");
          noTracksItem.textContent = "No tracks available.";
          trackList.appendChild(noTracksItem);
        }

        albumDiv.appendChild(trackList);

        // Append album div to the container
        container.appendChild(albumDiv);
      }
    };
  }

  // Add event listener to the search button
  document.getElementById("searchButton").addEventListener("click", function () {
    const artistInput = document.getElementById("artistInput").value.trim();
    loadArtistAlbums(artistInput); // Load albums from input
  });
});
