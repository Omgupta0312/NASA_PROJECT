const API_URL = "http://localhost:8000/v1"

async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${API_URL}/launches`);
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  })
}

async function httpSubmitLaunch(launch) {
  try {
    //launch was an object
    return await fetch(`${API_URL}/launches`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(launch),
    });
  }catch(err){
    return {
      ok:false,
    };
  }
  
 
}

async function httpAbortLaunch(id) {
  try {
    // TODO: Once API is ready.
      return await fetch(`${API_URL}/launches/${id}`, {
    // Delete launch with given ID.
        method: "delete",
      });
    } catch(err) {
      console.log(err);
      return {
        ok: false,
      };
    }

}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};