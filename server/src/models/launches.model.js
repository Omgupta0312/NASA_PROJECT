const axios = require('axios');

const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')

const launches = new Map()
const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: 100,//flight_number
    mission: 'Kepler Exploration X',//name
    rocket: 'Explorer IS1',//rocket.name
    launcDate: new Date("March 27,2030"),//date_local
    target: 'Kepler-442 b',
    customers: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
};

saveLaunch(launch)

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading launch data from spacex api .......');

    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,//used to get all the data from every page at once
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });
    if (response.status !== 200) {
        console.log('Problem downloading launch date')
        throw new Error('Launch data download fail')
    }


    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });
        // console.log(customers);

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        }

        console.log(`${launch.flightNumber} ${launch.mission}`)

        await saveLaunch(launch);

    }
}
async function loadLaunchData() {

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if (firstLaunch) {
        console.log('Launch Data already loaded')
    } else {
        await populateLaunches();
    }
    // await populateLaunches();



}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter)
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    }
    );
}

async function getlatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
        .find({}, {
            '_id': 0,
            '__v': 0
        }).skip(skip)
        .limit(limit);
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,

    }, launch, {
        upsert: true,
    })
    // console.log(launch)
    // const r = await findLaunch({
    //     flightNumber:launch.flightNumber
    // })
    // console.log(r);

}


async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target ,
    });

    if (!planet) {
        throw new Error('No matching planet found');
    }

    const newFlightNumber = await getlatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero To Mastery', 'NASA'],
        flightNumber: newFlightNumber

    });
    await saveLaunch(newLaunch)
}
// function addNewNlaunches(launch) {
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber, Object.assign(launch, {
//             success: true,
//             upcoming :true,
//             customers : ['Zero To Mastery' ,'NASA'],
//             flightNumber: latestFlightNumber,
//         })
//     );
// }

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });

    console.log(aborted)
    console.log(aborted.ok, aborted.nModified)
    return aborted.modifiedCount === 1;
    //     const aborted = launches.get(launchId);
    //     aborted.upcoming = false;
    //     aborted.success = false;
    //     return aborted;
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,

};