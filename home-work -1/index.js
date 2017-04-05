"use strict";

var mysql      = require('mysql');
var aws = require('aws-sdk');

var config = require('config');
var dbHost = config.get('dbHost');
var dbName = config.get('dbName');
var dbPass = config.get('dbPass');
var dbUser = config.get('dbUser');
var dbSSL=config.get("dbSSL");

var awsRegion = config.get('awsRegion');
var awsAccessKey = config.get('awsAccessKey');
var awsSecretAccessKey = config.get('awsSecretAccessKey');
var awsQueueUrl =  config.get("awsQueueUrl");


var dbConnect = mysql.createConnection({
    host     : dbHost,
    user     : dbUser,
    password : dbPass,
    database : dbName,
    ssl: dbSSL
});

aws.config.update({
    region: awsRegion,
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretAccessKey
});
var sqs = new aws.SQS();




dbConnect.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + dbConnect.threadId);
});

dbConnect.beginTransaction(function(err) {
    if (err) { throw err; }
    dbConnect.query('call upc_refresh_upcs();', function (error, results, fields) {
        console.log("error="+error);

        if (error) {
            return dbConnect.rollback(function() {
                throw error;

            });
        }

        dbConnect.commit(function(err) {
            if (err) {
                return dbConnect.rollback(function() {
                    throw err;
                });
            }
            console.log('success!');
            var sqsMsg = { payload: 'upc_refresh_upcs executed !!' };
            var sqsParams = {
                MessageBody: JSON.stringify(sqsMsg),
                QueueUrl: awsQueueUrl
            };
           sqs.sendMessage(sqsParams, function(sqsErr, sqsData) {
                if (sqsErr) {
                    console.log('SQS Error', sqsErr);
                }


                console.log(sqsData);
            });
        });
        dbConnect.end();
    });
    //
});
