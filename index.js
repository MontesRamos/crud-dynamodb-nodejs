const express = require('express');
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');
const app = express();
const port = 3000;
app.use(bodyParser.json());

AWS.config.update({region: 'us-east-1'});
//creamos un cliente de dynamodb
const client = new AWS.DynamoDB.DocumentClient();
//documentacion oficial: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html

const tableNameCar = 'Car';

//endpoint para obtener toda la data del documento "Car" (tabla no SQL)
app.get("/cars", (req, res) => {
    let params = {
        TableName: tableNameCar
    };

    client.scan(params, (error, data)=> { //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
        if (error) {
            console.log("===> error al escanear: ", error);
        } else {
            let items = [];
            for (let i in data.Items) {
                items.push(data.Items[i]['Brand']);
            }
            res.contentType = 'application/json';
            res.send(items);
        }
    });

});

//endpoint para insertar una nueva fila al documento "Car" (tabla no SQL)
app.post("/cars/add", (req, res) => {
    let body = req.body;
    let params = {
        TableName: tableNameCar,
        Item: {
            "id" : uuidv4(),
            "Color" : body["Color"],
            "Brand": body["Brand"],
            "Price": body["USD_price"]
        }
    }

    client.put(params, (error, data)=> { //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
        let status = {};
        if (error) {
            console.log("Unable to save data, error: ", JSON.stringify(error, null, 2));
            status["success"] = false;
        } else {
            console.log("saving data:: ", JSON.stringify(data, null, 2));
            status["success"] = true;
        }
        res.contentType = "application/json";
        res.send(status);
    });
});

//endpoint para eliminar un item por su id
app.delete("/cars/deleteById", (req, res)=> {
    let body = req.body;
    let params = {
        TableName: tableNameCar,
        Key: {
            id : body["id"]
        }
    }

    client.delete(params, (error, data)=> { //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#delete-property
        let response = {};
        if (error) {
            console.log("Unable to delete data, error: ", JSON.stringify(error, null, 2));
            response["msg"] = error;
        } else {
            console.log("after deleting:: ", JSON.stringify(data, null, 2));
            response["msg"] = data;
        }
        res.contentType = "application/json";
        res.send(response);
    })
});

//endpoint para actualizar los atributos existentes de un item, (se necesitan pasar todos los atributos de ese item), en caso no se encuentre el item se crea uno nuevo
//esto se hace mediante update nota: no se crean nuevos atributos
app.put("/cars/updateById", (req, res)=> {
    let body = req.body;
    let params = {
        TableName: tableNameCar,
        Key : {
            id: body["id"]
        },
        UpdateExpression: 'set Brand = :r',
        ExpressionAttributeValues: {
            ':r': body["brand"]
        },
    };
    client.update(params, (error, data)=> {
        let response = {};
        if (error) {
            console.log("Unable to update data, error: ", JSON.stringify(error, null, 2));
            response["msg"] = error;
        } else {
            console.log("after updating:: ", JSON.stringify(data, null, 2));
            response["msg"] = data;
        }
        res.contentType = "application/json";
        res.send(response);
    })
});


//endpoint para reemplazar por completo 1 item existente y todos sus atributos o crear uno nuevo en caso no exista
//esto se hace mediante put
app.put("/cars/putById", (req, res)=> {
    let body = req.body;
    let params = {
        TableName: tableNameCar,
        Item: {
            id : '8a727a8d-5020-4b26-b981-3cf281ed427d',
            //podemos definir atributos nuevos que seran creados si no existen
            base : 'base1'
        }
    };
    client.put(params, (error, data)=> {
        let response = {};
        if (error) {
            console.log("Unable to put data, error: ", JSON.stringify(error, null, 2));
            response["msg"] = error;
        } else {
            console.log("after put:: ", JSON.stringify(data, null, 2));
            response["msg"] = data;
        }
        res.contentType = "application/json";
        res.send(response);
    })
});

app.listen(port, ()=> {
    console.log("corriendo en el 3000");
})