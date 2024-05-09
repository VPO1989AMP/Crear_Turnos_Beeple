const express = require("express");
const moment = require("moment");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
const Token = require('./token'); // Ruta al archivo token.js
const port = process.env.PORT || 9999;
// Middleware para analizar los datos del cuerpo de la solicitud
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//importar funciones
const { getcollaboratorOutput,getWorkLocation,createTeam,getprojectID,createEnrolment,getRandomDateNumber,deleteTeam } = require('./functions'); 


const endpoint = "https://beconstant2.grupoconstant.com/api/v1/admin/";
const API_TOKEN = Token()


app.post("/crearTurno", async (req, res) => {
    const departamento = parseFloat(req.body.proyecto);
    const funcion = parseFloat(req.body.funcion);
    const nombre = req.body.nombre;
    const dninie = req.body.doc;
    const password = req.body.password;
    const headers = {
        'Content-Type': 'application/json',
        'Token': API_TOKEN
    };
    if (password==="Beeple1234"){
        try {
            //Obtener el ID del trabajador
            const collaboratorOutputResult = await getcollaboratorOutput(nombre, endpoint, dninie, headers, API_TOKEN);
            
            if (collaboratorOutputResult==null){
                //res.send("<h1>No Encontrado</h1>")
                res.json({ success: false, message: "Datos de empleados incorrectos o no existe!!" });
            }else{
                //Obtener el ID de la workLocation
                const collboratorId= collaboratorOutputResult.id 
                const workLocationId = await getWorkLocation(endpoint,headers,API_TOKEN,departamento)
                if (workLocationId==null){
                    //res.send("<h1>No existe departamento. Contactar con el administrador</h1>")
                    res.json({ success: false, message: "No existe departamento. Contactar con el administrador!!" });
                }else{
                    //Obtener el ID del proyecto a partir del ID del departamento (la relacion es 1-1)
                    console.log("ID - Función", funcion, "ID - Collaborator", collboratorId, "ID - Work Location",workLocationId )
                    const projectID = await getprojectID(departamento, endpoint,headers, API_TOKEN)
                    if (projectID ==null){
                        //res.send("<h1>No existe proyecto. Contactar con el administrador</h1>")
                        res.json({ success: false, message: "No existe proyecto. Contactar con el administrador!!" });
                        
                    } else{
                        //console.log(collboratorId,workLocationId)
                        console.log("ID - Función", funcion, "ID - Collaborator", collboratorId, "ID - Work Location",workLocationId, "ID - proyecto",projectID  )
                        //res.send(collaboratorOutputResult);     
                        //1. Crear el equipo 
                        const startDatetime = moment(); // Obtener fecha y hora actuales
                        const endDatetime = moment().add(8, 'hours'); // Sumar 8 horas a la fecha y hora actuales
                        const bodyEquipo={
                                "name": "Automatico-" + getRandomDateNumber(),
                                "function_id": funcion,
                                "extra_practical_info": "Equipo creado desde aplicación. Trabajador no tenia turno al venir a trabajar",
                                "volunteers_needed": 1,
                                "work_location_specification": "At the entrance",
                                "registrations_via_application": true,
                                "work_location_id": workLocationId,
                                "published": true,
                                "relative_checkin_start": "01:00",
                                "relative_checkin_duration": "01:00",
                                "shifts_attributes": [
                                {
                                    "start_datetime": startDatetime,
                                    "end_datetime": endDatetime,
                                    "break_duration": "00:30"
                                }
                                ]
                        }
                        const teamID = await createTeam(projectID,endpoint,headers,API_TOKEN,bodyEquipo)
                        if (teamID ==null){
                            //res.send("<h1>Error al crear equipo</h1>")
                            res.json({ success: false, message: "No se ha podido crear el turno!!" });
                        }else{
                            console.log("ID - Función", funcion, "ID - Collaborator", collboratorId, "ID - Work Location",workLocationId, "ID - proyecto",projectID, "ID - Equipo", teamID  )
                            const bodyEnrolment ={
                                    "team_registration": {
                                        "collaborator_id": collboratorId,
                                        "team_id": teamID,
                                    }
                            }
                            //console.log(bodyEnrolment)
                            const enrolment = await createEnrolment(endpoint,headers,bodyEnrolment,API_TOKEN)
                            //console.log(enrolment)
                            if (enrolment.team != null && enrolment.id != undefined) {
                                // Envía una respuesta JSON indicando éxito
                                res.json({ success: true, message: "Turno creado y trabajador asignado!" });
                            } else {
                                // Envía una respuesta JSON indicando error
                                const delTeam = await deleteTeam(endpoint, headers, API_TOKEN, teamID);
                                res.status(500).json({ success: false, message: "" });
                            }

                        }
                            
                    } 
                    
                }   
            }
        } catch (error) {
            res.send(error);
        }
    }else{
        res.send("<h1>Contraseña inccorrecta")
    }
});

app.post("/obtenerFunciones", async (req, res) => {
    const departamento = req.body.proyecto;
    const password = req.body.password;
    const headers = {
        'Content-Type': 'application/json',
        'Token': API_TOKEN
    };

    console.log(departamento)
    try {
        const functions = await axios.get(`${endpoint}functions`, {
            headers: headers
        });
        
        const functionsResponse = functions.data.functions;
        console.log("Funciones Maestro", functionsResponse)
        const functionsOutput = [];

        for (const item of functionsResponse) {
            if(item.applies_to_all_departments === true){
                let functionObject = {
                    "id": item.id,
                    "nombre": item.name
                };
                functionsOutput.push(functionObject);
            }else{
                for (const i of item.department_ids){
                    if (i==departamento){
                        let functionObject = {
                            "id": item.id,
                            "nombre": item.name
                        };
                        functionsOutput.push(functionObject);
                    }
                }
            }
        }

        console.log("Listado funciones", functionsOutput)
        res.send(functionsOutput);
    } catch (error) {
        // Manejo de errores
        console.error('Error al obtener las funciones:', error);
        res.status(500).send('Error al obtener las funciones');
    }
});


// Configuramos el servidor para servir archivos estáticos
app.use(express.static("./"));

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});