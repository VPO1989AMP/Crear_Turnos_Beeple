const axios = require("axios");
const bodyParser = require("body-parser");

const getcollaboratorOutput = async (nombre, endpoint, dninie, headers, API_TOKEN) => {
    try {
        //console.log(`${endpoint}collaborators?q=${nombre}&page_items=300`);
        const collaborators = await axios.get(`${endpoint}collaborators?q=${nombre}&page_items=1000`, {
            headers: headers
        });
        const collaboratorsAllResponse = collaborators.data.collaborators;

        for (const collaborator of collaboratorsAllResponse) {
            console.log(collaborator);
            const collaboratorID = collaborator.id;
            const collaboratorResponse = await axios.get(`${endpoint}/collaborators/${collaboratorID}`, {
                headers: headers
            });
            const collaboratorDetail = collaboratorResponse.data;
            console.log(collaboratorDetail);

            for (const key in collaboratorDetail) {
                if (key === "national_identification_be" || key === "national_identification_de" || key === "national_identification_nl" || key === "national_identification_fr" || key === "national_identification_es" || key === "national_identification_es_foreign" || key === "national_identification_cl") {
                    if (collaboratorDetail[key] === dninie) {
                        return collaboratorDetail; // Devuelve el objeto del colaborador
                    }
                }
            }
        }
        // Si no se encuentra el colaborador, puedes devolver null o lanzar un error
        return null; // Opcionalmente, puedes devolver un valor que indique que no se encontró el colaborador
    } catch (error) {
        // Manejar el error aquí
        return null
    }
};

const getWorkLocation = async (endpoint,headers,API_TOKEN,departamento) => {
    try {
        console.log(`${endpoint}addresses`);
        const addresses = await axios.get(`${endpoint}addresses`, {
            headers: headers
        });
        const addressesAllResponse = addresses.data.addresses
        for (const address of addressesAllResponse) {
            if (address.departments[0].id == departamento){
                return address.id
            }
        }
        return null; 
    } catch (error) {
        // Manejar el error aquí
        return null
    }
};

const getprojectID = async (departamento, endpoint,headers, API_TOKEN) => {
    try {
        console.log(`${endpoint}projects`);
        const projects = await axios.get(`${endpoint}projects`, {
            headers: headers
        });
        const projectsAllResponses = projects.data.projects
        for (const project of projectsAllResponses) {
            if (project.department.id == departamento){
                return project.id
            }
        }
        return null; 
    } catch (error) {
        // Manejar el error aquí
        return null
    }
};


const createTeam = async (projectID, endpoint, headers, API_TOKEN, bodyEquipo) => {
    try {
        console.log(`${endpoint}projects/${projectID}/teams`);
        const team = await axios.post(`${endpoint}projects/${projectID}/teams`, bodyEquipo, {
            headers: headers
        });
        const teamResponse = team.data.id;
        //console.log(teamResponse);
        return teamResponse;
    } catch (error) {
        // Manejar el error aquí
        return null;
    }
};

const createEnrolment = async(endpoint,headers,bodyEnrolment,API_TOKEN)=> {
    try {
        console.log(`${endpoint}collaborators/enrolments`);
        const enrolment = await axios.post(`${endpoint}collaborators/enrolments`, bodyEnrolment, {
            headers: headers
        });
        const enrolmentResponse = enrolment.data;
        //console.log(teamResponse);
        return enrolmentResponse;
    } catch (error) {
        // Manejar el error aquí
        return null;
    }
}
const deleteTeam = async(endpoint,headers,API_TOKEN,teamID)=> {
    try {
        console.log(`${endpoint}collaborators/enrolments`);
        const delteam = await axios.delete(`${endpoint}teams/${teamID}`, {
            headers: headers
        });
        const delteamResponse = delteam.data;
        //console.log(teamResponse);
        return delteamResponse;
    } catch (error) {
        // Manejar el error aquí
        return null;
    }
}




function getRandomDateNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    const randomNumber = parseInt(`${year}${month}${day}${hours}${minutes}${seconds}`);
    
    return randomNumber;
}




module.exports = {
    getcollaboratorOutput,
    getWorkLocation,
    createTeam,
    getprojectID,
    getRandomDateNumber,
    createEnrolment,
    deleteTeam,
};
