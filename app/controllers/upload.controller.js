const db = require("../models");
const Tutorial = db.clearanceitems;
const path = require('path');
const readXlsxFile = require("read-excel-file/node");
const tmpexcelfolder = path.join(__dirname, "../tmp", "excel");
const fs = require('fs');
exports.itemssheet = (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send({ data: null, message: "Please upload an excel file!" });
        }
        var pjoiner;
        if (process.platform === "win32") {
            pjoiner = "\\";
        }
        else {
            pjoiner = "/";
        }

        let path = tmpexcelfolder + pjoiner + req.file.filename;
        readXlsxFile(fs.createReadStream(path)).then((rows) => {
            rows.shift();
            let tutorials = [];
            rows.forEach((row) => {
                let tutorial = {
                    itemname: row[1],
                    itemdescription: row[2],
                    itembatch: row[3],
                    filename: req.file.filename
                };
                tutorials.push(tutorial);
            });
            Tutorial.bulkCreate(tutorials, { individualHooks: true })
                .then(() => {
                    res.status(200).send({
                        data: "Uploaded the file successfully: " + req.file.originalname,
                        message: 'Success',
                    });
                })
                .catch((error) => {
                    res.status(500).send({ data: null, message: error.message });
                });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ data: null, message: "Could not upload the file: " + req.file.originalname });
    }
};

exports.getItems = (req, res) => {
    Tutorial.findAll()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({ data: null, message: err.message || "Some error occurred while retrieving data." });
        });
};

