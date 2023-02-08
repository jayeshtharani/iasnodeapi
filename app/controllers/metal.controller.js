const db = require("../models");
const config = require("../config/auth.config");
const MetalTypes = db.metaltypes;
const MetalInfos = db.metalinfos;
const sanitizeHtml = require('sanitize-html');
const fs = require('fs');
const path = require('path');
const os = require('os');
var url = require('url');
const Op = db.Sequelize.Op;


exports.getmetaltypes = (req, res) => {
    MetalTypes.findAll({
        attributes: ['metaltypeid', 'metaltype'],
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "0 Metal Types found" });
        }
        var data2 = [];
        user.forEach(element => {
            data2.push({
                "MetalTypeId": element.metaltypeid,
                "MetalType": element.metaltype
            });
        });
        res.status(200).send({
            message: "Success",
            data: data2,

        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });
};

exports.getmetalinfo = (req, res) => {
    const { metaltypeid } = req.params;
    MetalInfos.findAll({
        attributes: ['mastervalue', 'childvalue'],
        where: { metaltypeid: metaltypeid },
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "0 Metal Type Info found" });
        }
        var data2 = [];
        user.forEach(element => {
            data2.push({
                "MasterValue": element.mastervalue,
                "ChildValue": element.childvalue
            });
        });
        res.status(200).send({
            message: "Success",
            data: data2,

        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });

};
exports.getmetalsubinfo = (req, res) => {
    const { metaltypeid } = req.params;
    const { metalinfoid } = req.params;
    MetalInfos.findAll({
        attributes: ['mastervalue', 'childvalue'],
        where: { metaltypeid: metaltypeid, metalinfoid: metalinfoid },
    }).then(user => {
        if (!user) {
            return res.status(404).send({ data: null, message: "0 Metal Type Sub Info found" });
        }
        var data2 = [];
        user.forEach(element => {
            data2.push({
                "MasterValue": element.mastervalue,
                "ChildValue": element.childvalue
            });
        });
        res.status(200).send({
            message: "Success",
            data: data2,

        });
    }).catch(err => {
        res.status(500).send({ data: null, message: err.message });
    });

};

