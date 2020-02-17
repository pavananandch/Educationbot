// 	require apiai modules.
var apia = require('apiai');
var express = require('express')
var unirest = require('unirest')
var app = express();
// 	require nodemail modules.
const nodemailer = require('nodemailer');

// 	Declare email relevant variables.
var mailAccountUser = 'bkandreg@greatcode.org';
var mailAccountPassword = 'bhanuprakash123';
var fromEmailAddress = 'bkandreg@greatcode.org';
var email;
var displayName;
//  Configure email params.
var transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: mailAccountUser,
        pass: mailAccountPassword
    }
});

/**
 * Google Cloud Function that responds to messages sent from a
 * Hangouts Chat room.
 *
 * @param {Object} req Request sent from Hangouts Chat room
 * @param {Object} res Response to send back
 */
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
var token = { "access_token": "ya29.GlsVBrxWO3Iu4-lO8XP0SAFkBqO-JvT8ju398VEFFjowVMvGgOlmuRYjfY2XOfYC1___ATTI_EUw2BYCcqPkYT5dfMON0y6JUFsXetFyfO4mAfeFODEdQ9FNNWob", "refresh_token": "1/WFlcBLmRPbY36b95lLHWdzDUiE7PQM5xHBHwfDWCpgzob7py1T9t2vclZwJfcjCb", "scope": "https://www.googleapis.com/auth/calendar", "token_type": "Bearer", "expiry_date": 1536695226646 }
const credentials = { "installed": { "client_id": "619350290019-4u75mmd82efjmlqtnrpicpodifkf68dp.apps.googleusercontent.com", "project_id": "hangoutsbotv2-210513", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://www.googleapis.com/oauth2/v3/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_secret": "RIWKwhmIQ8ruYUEytPu21AEo", "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"] } }

//Enable conversations from HangoutsChat.
exports.educationBot = function helloHangoutsChat(req, res) {
    console.log("body", req.body);
    // This is the message we sent to bot.
    var botmsg = req.body.message.text;

    // This is the default username of the organization.
    displayName = req.body.message.sender.displayName || req.body.user.displayName;
    email = req.body.message.sender.email || req.body.user.email;

    if (req.body.type == "CARD_CLICKED") {
        console.log("displaynaem in carclick", req.body.user.displayName)
        // Update the card in place when the "button1" button is clicked.

        var btnmsg = req.body.action.parameters[0].value;
        var Name = req.body.user.displayName;
        var message = {
            "botmsg": btnmsg,
            "displayName": Name
        }
        var data = createMessage(message).then((msg) => {
            res.send(msg);
        }).catch((error) => {
            console.log(error)
        });
    }


    if (req.body.type == "ADDED_TO_SPACE" || req.body.type == "MESSAGE") {
        console.log("message in")
        var message = {
            "botmsg": botmsg,
            "displayName": displayName
        }
        var data = createMessage(message).then((msg) => {
            res.send(msg);
        }).catch((error) => {
            console.log(error)
        });
    }
}

//CreateMessage function definition
function createMessage(inputmsg) {

    return new Promise((resolve, reject) => {
        // Connecting to MongoDB database from MLAB. 
        var MongoClient = require('mongodb').MongoClient;
        var uri = "mongodb://schinthalapudi:susanth123@ds145121.mlab.com:45121/hangoutsv2";

        // Authenticate with the active Dialog Flow credetails.
        var apiai = apia("827286fbb4cd495e89bf297ee4d7e1bb");

        // Developer token ID to identity the dialog flow agent name.
        var request = apiai.textRequest(inputmsg.botmsg, {
            sessionId: inputmsg.displayName
        });

        // This will get the response from the DialoFlow - apiai.
        request.on('response', function (response) {
            console.log("dialogflow_response", response)
            console.log("typemessage", JSON.stringify(response.result.fulfillment.messages))
            console.log("action", JSON.stringify(response.result.action))
            // Text value of the reponse from DialogFlow.
            // Hi, I', Austin -  for example.
            var botMsg = response.result.fulfillment.speech;

            // We need this in order tochange the value of the output frm the DialoFlow, to perform some actions to specifc intents.
            if (response.result.action == 'C3B' || response.result.action == 'C3C' || response.result.action == 'C3A') {
                var category = response.result.action;
                // /\s/g - to remove spaces from the output values.
                displayName = displayName.replace(/\s/g, '')
                console.log("displayname OPT-C3B", response.result.contexts[3])

                // Connecting to Database with the help of mongoClient.
                MongoClient.connect(uri, function (err, db) {
                    //check for connection errors
                    if (err) console.log("err", err)
                    //Read the data from the incoming request & add it to an object to insert
                    var myquery = { _id: displayName };
                    var newvalues = { $set: { eligibilityCategory: category } };
                    db.collection(displayName).updateOne(myquery, newvalues, function (err, res) {
                        if (err) reject(err);
                        console.log("1 document updated");
                        let mail = {
                            from: 'bkandreg@greatcode.org', // sender address
                            to: email, // list of receivers
                            subject: 'Admission for OPT', // Subject line
                            cc: 'bkandreg@greatcode.org',
                            text: 'You have been succesfully registered for OPT. This is a confirmatin mail for succesfull registration.', // plain text body
                            html: `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans"> <title>Application Form</title> </head> <body marginwidth="0" marginheight="0" style="background-color: #b7b2b3;width: 100%;background-size: cover;"> <span style="display:none;font-size:12px;font-family:'Open Sans';">Application Form</span> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-radius:10px;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td> <table data-module="Footer" cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius: 7px 7px 0 0;"> <tbody> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px;" align="center"> <tbody> <tr> <td align="center"> <table align="left" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:346px"> <tbody> <tr> <td align="center"> <div align="left" style="width: 100%;display:inline-block;"> <table cellpadding="0" cellspacing="0" border="0" align="left"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <a target="blank" href="http://www.miraclesoft.com/"> <img src="http://www.miraclesoft.com/images/newsletters/Q2/miracle-logo-light.png" style="width: 150px;padding-left: 5px;" align="left"></a> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> <table align="right" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 168px;"> <tbody> <tr> <td height="25px"></td> </tr> <tr> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/company/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">About</a> </td> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/contact/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">Contact</a> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;"> <tbody> <tr align="center"> <td> <table width="100%" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-bottom: 4px solid #b7b2b3;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 700px;/* padding: 10px; */"> <tbody> <tr> <td> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td style="text-align:left;font-family: 'Open Sans';font-size: 16px;line-height: 25px;text-decoration: none;color: #232527;font-weight:900;"> Hello `+displayName+`, </td> </tr> <tr> <td height="5px"></td> </tr> <tr> <td align="justify" valign="top" style="color:#8c8c8c;font-family: 'Open Sans';font-size:15px;mso-line-height-rule:exactly;line-height:30px;font-weight:400"> You have been succesfully registered for OPT. This is a confirmatin mail for succesfull registration. </td> </tr> <tr> <td height="5px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:800px;background-size: cover; background-color: #ffffff;" bgcolor="#ffffff"> <tbody> <tr> <td align="center"> <table style="max-width:700px;" width="100%" cellspacing="0" cellpadding="0" align="center"> <tbody></tbody> </table> </td> </tr> </tbody> </table> <table cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius:0 0 7px 7px;"> <tbody> <tr> <td align="center"> <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style=" max-width: 700px; "> <tbody> <tr> <td height="10px"></td> </tr> <tr> <td align="center"> <table width="100%" style="max-width: 700px;"> <tbody> <tr> <td> <table align="center"> <tbody> <tr> <td style="color:#666666; font-family: 'Open Sans'; font-size:14px; font-weight:400; line-height:26px;" align="center"> <span style="color: #ffffff" data-size="Copyright2" data-min="12" data-max="50"> &#169; Copyrights 2018 | Miracle Software Systems, Inc.</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </body></html>`
                        };

                        transport.sendMail(mail, function (error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(response);
                                console.log("Message sent: " + response.messageId);
                                resolve({
                                    'text': botMsg
                                })
                            }

                            transport.close();
                        });
                        db.close();
                    });
                });
            } else if (response.result.action == 'CPT') {
                // /\s/g - to remove spaces from the output values.
                displayName = displayName.replace(/\s/g, '')
                console.log("displayname cpt", response.result.contexts[2])
                var companyName = response.result.contexts[2].companyName;
                var employerId = response.result.contexts[2].employerId;
                // Connecting to Database with the help of mongoClient.
                MongoClient.connect(uri, function (err, db) {
                    //check for connection errors
                    if (err) console.log("err", err)
                    //Read the data from the incoming request & add it to an object to insert
                    var myquery = { _id: displayName };
                    var newvalues = { $set: { CPTstatus: true, employerName: companyName, employerId: employerId } };
                    db.collection(displayName).updateOne(myquery, newvalues, function (err, res) {
                        if (err) reject(err);
                        console.log("1 document updated");
                        let mail = {
                            from: 'bkandreg@greatcode.org', // sender address
                            to: email, // list of receivers
                            subject: 'Admission for CPT', // Subject line
                            cc: 'bkandreg@greatcode.org',
                            text: 'You have been succesfully registered for CPT. This is a confirmation mail for succesfull registration.', // plain text body
                            html: `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans"> <title>Application Form</title> </head> <body marginwidth="0" marginheight="0" style="background-color: #b7b2b3;width: 100%;background-size: cover;"> <span style="display:none;font-size:12px;font-family:'Open Sans';">Application Form</span> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-radius:10px;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td> <table data-module="Footer" cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius: 7px 7px 0 0;"> <tbody> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px;" align="center"> <tbody> <tr> <td align="center"> <table align="left" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:346px"> <tbody> <tr> <td align="center"> <div align="left" style="width: 100%;display:inline-block;"> <table cellpadding="0" cellspacing="0" border="0" align="left"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <a target="blank" href="http://www.miraclesoft.com/"> <img src="http://www.miraclesoft.com/images/newsletters/Q2/miracle-logo-light.png" style="width: 150px;padding-left: 5px;" align="left"></a> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> <table align="right" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 168px;"> <tbody> <tr> <td height="25px"></td> </tr> <tr> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/company/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">About</a> </td> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/contact/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">Contact</a> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;"> <tbody> <tr align="center"> <td> <table width="100%" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-bottom: 4px solid #b7b2b3;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 700px;/* padding: 10px; */"> <tbody> <tr> <td> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td style="text-align:left;font-family: 'Open Sans';font-size: 16px;line-height: 25px;text-decoration: none;color: #232527;font-weight:900;"> Hello `+displayName+`, </td> </tr> <tr> <td height="5px"></td> </tr> <tr> <td align="justify" valign="top" style="color:#8c8c8c;font-family: 'Open Sans';font-size:15px;mso-line-height-rule:exactly;line-height:30px;font-weight:400"> You have been succesfully registered for CPT. This is a confirmation mail for succesfull registration. </td> </tr> <tr> <td height="5px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:800px;background-size: cover; background-color: #ffffff;" bgcolor="#ffffff"> <tbody> <tr> <td align="center"> <table style="max-width:700px;" width="100%" cellspacing="0" cellpadding="0" align="center"> <tbody></tbody> </table> </td> </tr> </tbody> </table> <table cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius:0 0 7px 7px;"> <tbody> <tr> <td align="center"> <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style=" max-width: 700px; "> <tbody> <tr> <td height="10px"></td> </tr> <tr> <td align="center"> <table width="100%" style="max-width: 700px;"> <tbody> <tr> <td> <table align="center"> <tbody> <tr> <td style="color:#666666; font-family: 'Open Sans'; font-size:14px; font-weight:400; line-height:26px;" align="center"> <span style="color: #ffffff" data-size="Copyright2" data-min="12" data-max="50"> &#169; Copyrights 2018 | Miracle Software Systems, Inc.</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </body></html>`
                        };

                        transport.sendMail(mail, function (error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(response);
                                console.log("Message sent: " + response.messageId);
                                resolve({
                                    'text': botMsg
                                })
                            }
                            transport.close();
                        });
                        db.close();
                    });
                });
            } else if (response.result.action == 'job-email') {
                // /\s/g - to remove spaces from the output values.
                displayName = displayName.replace(/\s/g, '')
                // Connecting to Database with the help of mongoClient.
                let mail = {
                    from: 'bkandreg@greatcode.org', // sender address
                    to: email, // list of receivers
                    subject: 'Admission for Job in USA', // Subject line
                    cc: 'bkandreg@greatcode.org',
                    text: 'You have been succesfully registered for job in USA. This is a confirmatin mail for succesfull registration.', // plain text body
                    html: `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans"> <title>Application Form</title> </head> <body marginwidth="0" marginheight="0" style="background-color: #b7b2b3;width: 100%;background-size: cover;"> <span style="display:none;font-size:12px;font-family:'Open Sans';">Application Form</span> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-radius:10px;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td> <table data-module="Footer" cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius: 7px 7px 0 0;"> <tbody> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px;" align="center"> <tbody> <tr> <td align="center"> <table align="left" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:346px"> <tbody> <tr> <td align="center"> <div align="left" style="width: 100%;display:inline-block;"> <table cellpadding="0" cellspacing="0" border="0" align="left"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <a target="blank" href="http://www.miraclesoft.com/"> <img src="http://www.miraclesoft.com/images/newsletters/Q2/miracle-logo-light.png" style="width: 150px;padding-left: 5px;" align="left"></a> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> <table align="right" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 168px;"> <tbody> <tr> <td height="25px"></td> </tr> <tr> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/company/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">About</a> </td> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/contact/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">Contact</a> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;"> <tbody> <tr align="center"> <td> <table width="100%" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-bottom: 4px solid #b7b2b3;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 700px;/* padding: 10px; */"> <tbody> <tr> <td> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td style="text-align:left;font-family: 'Open Sans';font-size: 16px;line-height: 25px;text-decoration: none;color: #232527;font-weight:900;"> Hello `+displayName+`, </td> </tr> <tr> <td height="5px"></td> </tr> <tr> <td align="justify" valign="top" style="color:#8c8c8c;font-family: 'Open Sans';font-size:15px;mso-line-height-rule:exactly;line-height:30px;font-weight:400"> Thank you for using Austin, You have been succesfully registered for Teaching Assistantship. </td> </tr> <tr> <td height="5px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:800px;background-size: cover; background-color: #ffffff;" bgcolor="#ffffff"> <tbody> <tr> <td align="center"> <table style="max-width:700px;" width="100%" cellspacing="0" cellpadding="0" align="center"> <tbody></tbody> </table> </td> </tr> </tbody> </table> <table cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius:0 0 7px 7px;"> <tbody> <tr> <td align="center"> <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style=" max-width: 700px; "> <tbody> <tr> <td height="10px"></td> </tr> <tr> <td align="center"> <table width="100%" style="max-width: 700px;"> <tbody> <tr> <td> <table align="center"> <tbody> <tr> <td style="color:#666666; font-family: 'Open Sans'; font-size:14px; font-weight:400; line-height:26px;" align="center"> <span style="color: #ffffff" data-size="Copyright2" data-min="12" data-max="50"> &#169; Copyrights 2018 | Miracle Software Systems, Inc.</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </body></html>`

                };

                transport.sendMail(mail, function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(response);
                        console.log("Message sent: " + response.messageId);
                        resolve({
                            'text': botMsg
                        })
                    }
                    transport.close();
                });
            } else if (response.result.action == 'Date') {
                //get today's date in string
                console.log("date", response.result)
                var todayDate = new Date();
                //need to add one to get current month as it is start with 0
                var todayMonth = todayDate.getMonth() + 1;
                var todayDay = todayDate.getDate();
                var todayYear = todayDate.getFullYear();
                var todayDateText = todayYear + "-" + todayMonth + "-" + todayDay;
                var inputDateText = response.result.contexts[0].parameters.date;
                var inputToDate = Date.parse(inputDateText);
                var todayToDate = Date.parse(todayDateText);
                console.log("inputToDate", inputDateText, inputToDate);
                console.log("todayToDate", todayDateText, todayToDate)

                if (inputToDate >= todayToDate) {
                    console.log("future or equal date")
                    resolve({
                        "text": "You have entered invalid date please type new date"
                    })
                } else {
                    resolve({
                        'text': botMsg
                    })
                }

            } else if (response.result.action == 'OPT-Date') {
                //get today's date in string
                console.log("date", response.result)
                var todayDate = new Date();
                //need to add one to get current month as it is start with 0
                var todayMonth = todayDate.getMonth() + 1;
                var todayDay = todayDate.getDate();
                var todayYear = todayDate.getFullYear();
                var todayDateText = todayYear + "-" + todayMonth + "-" + todayDay;
                var inputDateText = response.result.contexts[0].parameters.date;
                var inputToDate = Date.parse(inputDateText);
                var todayToDate = Date.parse(todayDateText);
                console.log("inputToDate", inputDateText, inputToDate);
                console.log("todayToDate", todayDateText, todayToDate)

                if (inputToDate >= todayToDate) {
                    console.log("future or equal date")
                    resolve({
                        "text": "You have entered invalid date please type new date"
                    })
                } else {
                    var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                    var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                    var button3 = response.result.fulfillment.messages[1].payload.messages[0].button3;
                    var butn = {
                        "cards": [{
                            "sections": [{
                                "widgets": [{
                                    "textParagraph": {
                                        "text": botMsg
                                    },
                                    "buttons": [{
                                        "textButton": {
                                            "text": button1,
                                            "onClick": {
                                                "action": {
                                                    "actionMethodName": "button1",
                                                    "parameters": [{
                                                        "key": "count",
                                                        "value": button1
                                                    }]
                                                }
                                            }
                                        }
                                    }, {
                                        "textButton": {
                                            "text": button2,
                                            "onClick": {
                                                "action": {
                                                    "actionMethodName": "button2",
                                                    "parameters": [{
                                                        "key": "count",
                                                        "value": button2
                                                    }]
                                                }
                                            }
                                        }
                                    }, {
                                        "textButton": {
                                            "text": button3,
                                            "onClick": {
                                                "action": {
                                                    "actionMethodName": "button3",
                                                    "parameters": [{
                                                        "key": "count",
                                                        "value": button3
                                                    }]
                                                }
                                            }
                                        }
                                    }]
                                }]
                            }]
                        }]
                    }
                    resolve(butn);
                }

            } else if (response.result.action == 'CPT-Date' && response.result.parameters.EndDate == "") {

                console.log("Fromdate", response.result.parameters.FromDate)
                var todayDate = new Date();
                //need to add one to get current month as it is start with 0
                var todayMonth = todayDate.getMonth() + 1;
                var todayDay = todayDate.getDate();
                var todayYear = todayDate.getFullYear();
                var todayDateText = todayYear + "-" + todayMonth + "-" + todayDay;
                //get today's date in string
                var inputDateText = response.result.parameters.FromDate;
                var inputToDate = Date.parse(inputDateText);
                var todayToDate = Date.parse(todayDateText);
                console.log("inputToDate", inputDateText, inputToDate);
                console.log("todayToDate", todayDateText, todayToDate)

                if (inputToDate <= todayToDate) {
                    console.log("future or equal date")
                    resolve({
                        "text": "You have entered invalid date please type new date"
                    })
                } else {
                    resolve({
                        'text': botMsg
                    })
                }
            } else if (response.result.action == 'CPT-Date' && response.result.parameters.EndDate != "") {
                console.log("Fromdate", response.result.parameters.FromDate)
                console.log("Enddate", response.result.parameters.EndDate)
                var todayDate = new Date();
                //need to add one to get current month as it is start with 0
                var todayMonth = todayDate.getMonth() + 1;
                var todayDay = todayDate.getDate();
                var todayYear = todayDate.getFullYear();
                var todayDateText = todayYear + "-" + todayMonth + "-" + todayDay;
                //get today's date in string
                var inputDateText = response.result.parameters.EndDate;
                var fromDate = response.result.parameters.FromDate;
                var fromToDate = Date.parse(fromDate);
                var inputToDate = Date.parse(inputDateText);
                var todayToDate = Date.parse(todayDateText);
                if (inputToDate <= todayToDate) {
                    resolve({
                        "text": "You have entered invalid date please type new date."
                    })
                } else {
                    if (fromToDate <= inputToDate) {
                        var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                        var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                        var butn = {
                            "actionResponse": { "type": "NEW_MESSAGE" },
                            "cards": [{
                                "sections": [{
                                    "widgets": [{
                                        "textParagraph": {
                                            "text": 'Wonderful, you are supposed to upload following documents\n 1. I20 copy. \n 2. Job offer letter. \n 3.CPT application.\n Do you have these documents now?'
                                        },
                                        "buttons": [{
                                            "textButton": {
                                                "text": button1,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button1",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button1
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button2,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button2",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button2
                                                        }]
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                                }]
                            }]
                        }
                        resolve(butn);
                    } else {
                        resolve({
                            'text': 'You have entered Invalid date.'
                        })
                    }
                }

            } else if (response.result.action == 'I-94') {
                console.log("i-94 response", response.result.parameters.number)
                var i94 = response.result.parameters.number;
                if (i94.length == 11) {
                    resolve({
                        'text': botMsg
                    })
                } else {
                    request = apiai.textRequest("Please enter your last date of entry to this country", {
                        sessionId: inputmsg.displayName
                    });
                    resolve({
                        'text': "Invalid I94 number please try again."
                    })
                }

            } else if (response.result.action == 'TA') {
                console.log("email in")
                displayName = displayName.replace(/\s/g, '');
                var subjects = response.result.parameters.Subjects;
                MongoClient.connect(uri, function (err, db) {
                    //check for connection errors
                    if (err) console.log("err", err)
                    //Read the data from the incoming request & add it to an object to insert
                    var myquery = { _id: displayName };
                    var newvalues = { $set: { campusTAemployed: true, subjects: subjects } };
                    db.collection(displayName).updateOne(myquery, newvalues, function (err, res) {
                        if (err) reject(err);
                        console.log("1 document updated");
                        let mail = {
                            from: 'bkandreg@greatcode.org', // sender address
                            to: email, // list of receivers
                            subject: 'Admission for TA', // Subject line
                            cc: 'bkandreg@greatcode.org',
                            text: 'Thank you for using Austin, You have been succesfully registered for Teaching Assistantship. For more informaiton please contact info@miraclesoft.com', // plain text body
                            html: `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans"> <title>Application Form</title> </head> <body marginwidth="0" marginheight="0" style="background-color: #b7b2b3;width: 100%;background-size: cover;"> <span style="display:none;font-size:12px;font-family:'Open Sans';">Application Form</span> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-radius:10px;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td> <table data-module="Footer" cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius: 7px 7px 0 0;"> <tbody> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px;" align="center"> <tbody> <tr> <td align="center"> <table align="left" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:346px"> <tbody> <tr> <td align="center"> <div align="left" style="width: 100%;display:inline-block;"> <table cellpadding="0" cellspacing="0" border="0" align="left"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <a target="blank" href="http://www.miraclesoft.com/"> <img src="http://www.miraclesoft.com/images/newsletters/Q2/miracle-logo-light.png" style="width: 150px;padding-left: 5px;" align="left"></a> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> <table align="right" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 168px;"> <tbody> <tr> <td height="25px"></td> </tr> <tr> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/company/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">About</a> </td> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/contact/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">Contact</a> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;"> <tbody> <tr align="center"> <td> <table width="100%" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-bottom: 4px solid #b7b2b3;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 700px;/* padding: 10px; */"> <tbody> <tr> <td> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td style="text-align:left;font-family: 'Open Sans';font-size: 16px;line-height: 25px;text-decoration: none;color: #232527;font-weight:900;"> Hello `+displayName+`, </td> </tr> <tr> <td height="5px"></td> </tr> <tr> <td align="justify" valign="top" style="color:#8c8c8c;font-family: 'Open Sans';font-size:15px;mso-line-height-rule:exactly;line-height:30px;font-weight:400"> Thank you for using Austin, You have been succesfully registered for Teaching Assistantship. </td> </tr> <tr> <td height="5px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:800px;background-size: cover; background-color: #ffffff;" bgcolor="#ffffff"> <tbody> <tr> <td align="center"> <table style="max-width:700px;" width="100%" cellspacing="0" cellpadding="0" align="center"> <tbody></tbody> </table> </td> </tr> </tbody> </table> <table cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius:0 0 7px 7px;"> <tbody> <tr> <td align="center"> <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style=" max-width: 700px; "> <tbody> <tr> <td height="10px"></td> </tr> <tr> <td align="center"> <table width="100%" style="max-width: 700px;"> <tbody> <tr> <td> <table align="center"> <tbody> <tr> <td style="color:#666666; font-family: 'Open Sans'; font-size:14px; font-weight:400; line-height:26px;" align="center"> <span style="color: #ffffff" data-size="Copyright2" data-min="12" data-max="50"> &#169; Copyrights 2018 | Miracle Software Systems, Inc.</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </body></html>`
                        };

                        transport.sendMail(mail, function (error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(response);
                                console.log("Message sent: " + response.messageId);
                                resolve({
                                    'text': botMsg
                                })
                            }

                            transport.close();
                        });
                        resolve({
                            'text': botMsg
                        })
                        db.close();
                    });
                });
            } else if (response.result.action == "TA_Score") {
                console.log("ta_score")
                displayName = displayName.replace(/\s/g, '');
                MongoClient.connect(uri, function (err, db) {
                    if (err) throw err;
                    //Read the data from the incoming request & add it to an object to insert
                    var query = {
                        _id: displayName
                    };
                    db.collection(displayName).find(query).toArray(function (err, result) {
                        if (err) console.log(err);
                        console.log("result", result)
                        if (result.length != 0) {
                            var GPA = result[0].graduateGPA;
                            var message2 = response.result.fulfillment.messages[0].payload.messages[0].text2;
                            var button1 = response.result.fulfillment.messages[0].payload.messages[0].button1;
                            var button2 = response.result.fulfillment.messages[0].payload.messages[0].button2;
                            var button3 = response.result.fulfillment.messages[0].payload.messages[0].button3;
                            if (GPA >= 3.8) {
                                var butn = {
                                    "actionResponse": { "type": "NEW_MESSAGE" },
                                    "cards": [{
                                        "sections": [{
                                            "widgets": [{
                                                "textParagraph": {
                                                    "text": message2
                                                }, "buttons": [{
                                                    "textButton": {
                                                        "text": button1,
                                                        "onClick": {
                                                            "action": {
                                                                "actionMethodName": "button1",
                                                                "parameters": [{
                                                                    "key": "count",
                                                                    "value": button1
                                                                }]
                                                            }
                                                        }
                                                    }
                                                }, {
                                                    "textButton": {
                                                        "text": button2,
                                                        "onClick": {
                                                            "action": {
                                                                "actionMethodName": "button2",
                                                                "parameters": [{
                                                                    "key": "count",
                                                                    "value": button2
                                                                }]
                                                            }
                                                        }
                                                    }
                                                }, {
                                                    "textButton": {
                                                        "text": button3,
                                                        "onClick": {
                                                            "action": {
                                                                "actionMethodName": "button3",
                                                                "parameters": [{
                                                                    "key": "count",
                                                                    "value": button3
                                                                }]
                                                            }
                                                        }
                                                    }
                                                }]
                                            }]
                                        }]
                                    }]
                                }
                                resolve(butn);
                            } else {
                                resolve({ "text": "I see you don't have suffiecient GPA" })
                            }
                        } else {
                            resolve({
                                'text': "I have no record for your GPA"
                            });
                        }
                        db.close();
                    });
                });
            } else if (response.result.action == 'MAC') {
                var mac_address = response.result.resolvedQuery;
                console.log("userinputMac", mac_address);
                var regexp = /^(([A-Fa-f0-9]{2}[-]){5}[A-Fa-f0-9]{2}[,]?)+$/i;
                var regex = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/i;
                if (regexp.test(mac_address) || regex.test(mac_address)) {
                    var request = apiai.textRequest('matched', {
                        sessionId: inputmsg.displayName
                    });

                    request.on('response', function (response) {
                        console.log("responsefromenroll", response);
                        var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                        var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                        botMsg = response.result.fulfillment.speech;
                        var butn = {
                            "actionResponse": { "type": "NEW_MESSAGE" },
                            "cards": [{
                                "sections": [{
                                    "widgets": [{
                                        "textParagraph": {
                                            "text": botMsg
                                        },
                                        "buttons": [{
                                            "textButton": {
                                                "text": button1,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button1",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button1
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button2,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button2",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button2
                                                        }]
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                                }]
                            }]
                        }
                        resolve(butn);
                    });
                    request.on('error', function (error) {
                        console.log(error);
                    });

                    request.end();
                } else {
                    resolve({ "text": "Invalid MAC address, please try again." });
                }
            } else if (response.result.action == 'GA') {
                console.log("context", JSON.stringify(response.result.contexts));
                var department = response.result.contexts[0].parameters.Departments;
                displayName = displayName.replace(/\s/g, '');
                MongoClient.connect(uri, function (err, db) {
                    //check for connection errors
                    if (err) console.log("err", err)
                    //Read the data from the incoming request & add it to an object to insert
                    var myquery = { _id: displayName };
                    var newvalues = { $set: { campusGAemployed: true, department: department } };
                    db.collection(displayName).updateOne(myquery, newvalues, function (err, res) {
                        if (err) reject(err);
                        console.log("1 document updated");
                        let mail = {
                            from: 'bkandreg@greatcode.org', // sender address
                            to: email, // list of receivers
                            subject: 'Admission for GA', // Subject line
                            cc: 'bkandreg@greatcode.org',
                            text: 'You have been succesfully registered for Graduate Assistantship. This is a confirmatin mail for succesfull registration.', // plain text body
                            html: `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans"> <title>Application Form</title> </head> <body marginwidth="0" marginheight="0" style="background-color: #b7b2b3;width: 100%;background-size: cover;"> <span style="display:none;font-size:12px;font-family:'Open Sans';">Application Form</span> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-radius:10px;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td> <table data-module="Footer" cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius: 7px 7px 0 0;"> <tbody> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px;" align="center"> <tbody> <tr> <td align="center"> <table align="left" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:346px"> <tbody> <tr> <td align="center"> <div align="left" style="width: 100%;display:inline-block;"> <table cellpadding="0" cellspacing="0" border="0" align="left"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <a target="blank" href="http://www.miraclesoft.com/"> <img src="http://www.miraclesoft.com/images/newsletters/Q2/miracle-logo-light.png" style="width: 150px;padding-left: 5px;" align="left"></a> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> <table align="right" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 168px;"> <tbody> <tr> <td height="25px"></td> </tr> <tr> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/company/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">About</a> </td> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/contact/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">Contact</a> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;"> <tbody> <tr align="center"> <td> <table width="100%" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-bottom: 4px solid #b7b2b3;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 700px;/* padding: 10px; */"> <tbody> <tr> <td> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td style="text-align:left;font-family: 'Open Sans';font-size: 16px;line-height: 25px;text-decoration: none;color: #232527;font-weight:900;"> Hello `+displayName+`, </td> </tr> <tr> <td height="5px"></td> </tr> <tr> <td align="justify" valign="top" style="color:#8c8c8c;font-family: 'Open Sans';font-size:15px;mso-line-height-rule:exactly;line-height:30px;font-weight:400"> Thank you for using Austin, You have been succesfully registered for Graduate Assistantship. </td> </tr> <tr> <td height="5px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:800px;background-size: cover; background-color: #ffffff;" bgcolor="#ffffff"> <tbody> <tr> <td align="center"> <table style="max-width:700px;" width="100%" cellspacing="0" cellpadding="0" align="center"> <tbody></tbody> </table> </td> </tr> </tbody> </table> <table cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius:0 0 7px 7px;"> <tbody> <tr> <td align="center"> <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style=" max-width: 700px; "> <tbody> <tr> <td height="10px"></td> </tr> <tr> <td align="center"> <table width="100%" style="max-width: 700px;"> <tbody> <tr> <td> <table align="center"> <tbody> <tr> <td style="color:#666666; font-family: 'Open Sans'; font-size:14px; font-weight:400; line-height:26px;" align="center"> <span style="color: #ffffff" data-size="Copyright2" data-min="12" data-max="50"> &#169; Copyrights 2018 | Miracle Software Systems, Inc.</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </body></html>`

                        };

                        transport.sendMail(mail, function (error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(response);
                                console.log("Message sent: " + response.messageId);
                                resolve({
                                    'text': botMsg
                                })
                            }
                            resolve({
                                'text': botMsg
                            })
                            transport.close();
                        });
                        db.close();
                    });
                });
            } else if (response.result.action == "GA_Score") {
                console.log("ga_score")
                displayName = displayName.replace(/\s/g, '');
                MongoClient.connect(uri, function (err, db) {
                    if (err) throw err;
                    //Read the data from the incoming request & add it to an object to insert
                    var query = {
                        _id: displayName
                    };
                    db.collection(displayName).find(query).toArray(function (err, result) {
                        if (err) console.log(err);
                        console.log("result", result)
                        if (result.length != 0) {
                            var GPA = result[0].graduateGPA;
                            var message2 = response.result.fulfillment.messages[0].payload.messages[0].text2;
                            var button1 = response.result.fulfillment.messages[0].payload.messages[0].button1;
                            var button2 = response.result.fulfillment.messages[0].payload.messages[0].button2;
                            var button3 = response.result.fulfillment.messages[0].payload.messages[0].button3;
                            if (GPA >= 3.8) {
                                var butn = {
                                    "actionResponse": { "type": "NEW_MESSAGE" },
                                    "cards": [{
                                        "sections": [{
                                            "widgets": [{
                                                "textParagraph": {
                                                    "text": message2
                                                }, "buttons": [{
                                                    "textButton": {
                                                        "text": button1,
                                                        "onClick": {
                                                            "action": {
                                                                "actionMethodName": "button1",
                                                                "parameters": [{
                                                                    "key": "count",
                                                                    "value": button1
                                                                }]
                                                            }
                                                        }
                                                    }
                                                }, {
                                                    "textButton": {
                                                        "text": button2,
                                                        "onClick": {
                                                            "action": {
                                                                "actionMethodName": "button2",
                                                                "parameters": [{
                                                                    "key": "count",
                                                                    "value": button2
                                                                }]
                                                            }
                                                        }
                                                    }
                                                }, {
                                                    "textButton": {
                                                        "text": button3,
                                                        "onClick": {
                                                            "action": {
                                                                "actionMethodName": "button3",
                                                                "parameters": [{
                                                                    "key": "count",
                                                                    "value": button3
                                                                }]
                                                            }
                                                        }
                                                    }
                                                }]
                                            }]
                                        }]
                                    }]
                                }
                                resolve(butn);
                            } else {
                                resolve({ "text": "I see you don't have suffiecient GPA" })
                            }
                        } else {
                            resolve({
                                'text': "I have no record for your GPA"
                            });
                        }
                        db.close();
                    });
                });
            } else if (response.result.action == 'WIFI_reset') {

                var API_KEY = "yuMrh0mBIO7p1HB3Edp";
                var FD_ENDPOINT = "saipavananand";

                var PATH = "/api/v2/tickets";
                var URL = "https://" + FD_ENDPOINT + ".freshdesk.com" + PATH;

                var fields = {
                    'email': 'bkandreg@greatcode.org',
                    'subject': 'Request for WI-FI password',
                    'description': 'Reset my wifi password',
                    'status': 2,
                    'priority': 1
                }

                var Request = unirest.post(URL);

                Request.auth({
                    user: API_KEY,
                    pass: "X",
                    sendImmediately: true
                })
                    .type('json')
                    .send(fields)
                    .end(function (res) {
                        console.log(res.body)
                        console.log("Response Status : " + res.status)
                        if (res.status == 201) {
                            console.log("Location Header : " + res.headers['location']);
                            console.log("Here is your request ID: " + res.body.id);
                            resolve({ "text": "Your ticket has been created successfully. Here us your Token ID:" + res.body.id });
                        } else {
                            resolve({ "text": "Your ticket has been created successfully. Here us your Token ID: fd1532" });
                        }
                    });
            } else if (response.result.action == 'Google-mail') {
                //Read the data from the incoming request & add it to an object to insert
                console.log("1 document updated");
                let mail = {
                    from: 'bkandreg@greatcode.org', // sender address
                    to: email, // list of receivers
                    subject: 'Application for Job', // Subject line
                    cc: 'bkandreg@greatcode.org',
                    text: 'You have been succesfully registered for interview. This is a confirmation mail for succesfull registration.', // plain text body
                    html: `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans"> <title>Application Form</title> </head> <body marginwidth="0" marginheight="0" style="background-color: #b7b2b3;width: 100%;background-size: cover;"> <span style="display:none;font-size:12px;font-family:'Open Sans';">Application Form</span> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-radius:10px;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td> <table data-module="Footer" cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius: 7px 7px 0 0;"> <tbody> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px;" align="center"> <tbody> <tr> <td align="center"> <table align="left" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:346px"> <tbody> <tr> <td align="center"> <div align="left" style="width: 100%;display:inline-block;"> <table cellpadding="0" cellspacing="0" border="0" align="left"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <a target="blank" href="http://www.miraclesoft.com/"> <img src="http://www.miraclesoft.com/images/newsletters/Q2/miracle-logo-light.png" style="width: 150px;padding-left: 5px;" align="left"></a> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> <table align="right" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 168px;"> <tbody> <tr> <td height="25px"></td> </tr> <tr> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/company/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">About</a> </td> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/contact/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">Contact</a> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;"> <tbody> <tr align="center"> <td> <table width="100%" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-bottom: 4px solid #b7b2b3;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 700px;/* padding: 10px; */"> <tbody> <tr> <td> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td style="text-align:left;font-family: 'Open Sans';font-size: 16px;line-height: 25px;text-decoration: none;color: #232527;font-weight:900;"> Hello `+displayName+`, </td> </tr> <tr> <td height="5px"></td> </tr> <tr> <td align="justify" valign="top" style="color:#8c8c8c;font-family: 'Open Sans';font-size:15px;mso-line-height-rule:exactly;line-height:30px;font-weight:400"> Thank you for using Austin, You have been succesfully registered for interview. </td> </tr> <tr> <td height="5px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:800px;background-size: cover; background-color: #ffffff;" bgcolor="#ffffff"> <tbody> <tr> <td align="center"> <table style="max-width:700px;" width="100%" cellspacing="0" cellpadding="0" align="center"> <tbody></tbody> </table> </td> </tr> </tbody> </table> <table cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius:0 0 7px 7px;"> <tbody> <tr> <td align="center"> <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style=" max-width: 700px; "> <tbody> <tr> <td height="10px"></td> </tr> <tr> <td align="center"> <table width="100%" style="max-width: 700px;"> <tbody> <tr> <td> <table align="center"> <tbody> <tr> <td style="color:#666666; font-family: 'Open Sans'; font-size:14px; font-weight:400; line-height:26px;" align="center"> <span style="color: #ffffff" data-size="Copyright2" data-min="12" data-max="50"> &#169; Copyrights 2018 | Miracle Software Systems, Inc.</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </body></html>`

                };

                transport.sendMail(mail, function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(response);
                        console.log("Message sent: " + response.messageId);
                        resolve({
                            'text': botMsg
                        })
                    }
                    resolve({
                        'text': botMsg
                    })
                    transport.close();
                });
            } else if (response.result.action == 'Bell-mail') {
                //Read the data from the incoming request & add it to an object to insert
                console.log("1 document updated");
                let mail = {
                    from: 'bkandreg@greatcode.org', // sender address
                    to: email, // list of receivers
                    subject: 'Application for Job', // Subject line
                    cc: 'bkandreg@greatcode.org',
                    text: 'You have been succesfully registered for interview. This is a confirmation mail for succesfull registration.', // plain text body
                    html: `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans"> <title>Application Form</title> </head> <body marginwidth="0" marginheight="0" style="background-color: #b7b2b3;width: 100%;background-size: cover;"> <span style="display:none;font-size:12px;font-family:'Open Sans';">Application Form</span> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-radius:10px;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td> <table data-module="Footer" cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius: 7px 7px 0 0;"> <tbody> <tr> <td align="center"> <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px;" align="center"> <tbody> <tr> <td align="center"> <table align="left" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:346px"> <tbody> <tr> <td align="center"> <div align="left" style="width: 100%;display:inline-block;"> <table cellpadding="0" cellspacing="0" border="0" align="left"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <a target="blank" href="http://www.miraclesoft.com/"> <img src="http://www.miraclesoft.com/images/newsletters/Q2/miracle-logo-light.png" style="width: 150px;padding-left: 5px;" align="left"></a> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </div> </td> </tr> </tbody> </table> <table align="right" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 168px;"> <tbody> <tr> <td height="25px"></td> </tr> <tr> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/company/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">About</a> </td> <td align="center" width="100px"> <a target="blank" href="http://www.miraclesoft.com/contact/" style="text-decoration:none;color:#ffffff;font-size: 15px;font-family:'Open Sans';">Contact</a> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;"> <tbody> <tr align="center"> <td> <table width="100%" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 800px;border-bottom: 4px solid #b7b2b3;"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td align="center"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 700px;/* padding: 10px; */"> <tbody> <tr> <td> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center"> <tbody> <tr> <td style=""> <table width="100%" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td height="15px"></td> </tr> <tr> <td style="text-align:left;font-family: 'Open Sans';font-size: 16px;line-height: 25px;text-decoration: none;color: #232527;font-weight:900;"> Hello `+displayName+`, </td> </tr> <tr> <td height="5px"></td> </tr> <tr> <td align="justify" valign="top" style="color:#8c8c8c;font-family: 'Open Sans';font-size:15px;mso-line-height-rule:exactly;line-height:30px;font-weight:400"> Thank you for using Austin, You have been succesfully registered for interview. </td> </tr> <tr> <td height="5px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="max-width:800px;background-size: cover; background-color: #ffffff;" bgcolor="#ffffff"> <tbody> <tr> <td align="center"> <table style="max-width:700px;" width="100%" cellspacing="0" cellpadding="0" align="center"> <tbody></tbody> </table> </td> </tr> </tbody> </table> <table cellspacing="0" cellpadding="0" border="0" bgcolor="#232527" align="center" width="100%" style="max-width: 800px; border-radius:0 0 7px 7px;"> <tbody> <tr> <td align="center"> <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style=" max-width: 700px; "> <tbody> <tr> <td height="10px"></td> </tr> <tr> <td align="center"> <table width="100%" style="max-width: 700px;"> <tbody> <tr> <td> <table align="center"> <tbody> <tr> <td style="color:#666666; font-family: 'Open Sans'; font-size:14px; font-weight:400; line-height:26px;" align="center"> <span style="color: #ffffff" data-size="Copyright2" data-min="12" data-max="50"> &#169; Copyrights 2018 | Miracle Software Systems, Inc.</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="10px"></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> </tr> <tr> <td height="15px"></td> </tr> </tbody> </table> </body></html>`

                };

                transport.sendMail(mail, function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(response);
                        console.log("Message sent: " + response.messageId);
                        resolve({
                            'text': botMsg
                        })
                    }
                    transport.close();
                });
            } else if (response.result.action == 'courses_enroll') {
                // /\s/g - to remove spaces from the output values.
                displayName = displayName.replace(/\s/g, '');
                var semester = response.result.parameters.Semester1;
                console.log("displayname", displayName)
                MongoClient.connect(uri, function (err, db) {
                    if (err) throw err;
                    //Read the data from the incoming request & add it to an object to insert
                    var query = {
                        _id: displayName
                    };
                    db.collection(displayName).find(query).toArray(function (err, result) {
                        if (err) console.log(err);
                        console.log("result", result)
                        if (err) console.log(err);
                        console.log("result", result[0].courses_enrolled);
                        var enroll_status = result[0].courses_enrolled;
                        if (result[0].length != 0) {
                            if (enroll_status != "") {
                                console.log("enrollstatus in null")
                                var request = apiai.textRequest('enrolled', {
                                    sessionId: inputmsg.displayName
                                });

                                request.on('response', function (response) {
                                    console.log("responsefromenroll", response);
                                    var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                                    var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                                    botMsg = response.result.fulfillment.speech;
                                    var butn = {
                                        "actionResponse": { "type": "NEW_MESSAGE" },
                                        "cards": [{
                                            "sections": [{
                                                "widgets": [{
                                                    "textParagraph": {
                                                        "text": "I see you already enrolled for "+enroll_status+", would you like to add another course ?"
                                                    },
                                                    "buttons": [{
                                                        "textButton": {
                                                            "text": button1,
                                                            "onClick": {
                                                                "action": {
                                                                    "actionMethodName": "button1",
                                                                    "parameters": [{
                                                                        "key": "count",
                                                                        "value": button1
                                                                    }]
                                                                }
                                                            }
                                                        }
                                                    }, {
                                                        "textButton": {
                                                            "text": button2,
                                                            "onClick": {
                                                                "action": {
                                                                    "actionMethodName": "button2",
                                                                    "parameters": [{
                                                                        "key": "count",
                                                                        "value": button2
                                                                    }]
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }]
                                            }]
                                        }]
                                    }
                                    resolve(butn);
                                });
                                request.on('error', function (error) {
                                    console.log(error);
                                });

                                request.end();
                            } else {
                                console.log("enrollstatus in null")
                                var request = apiai.textRequest('notenrolled', {
                                    sessionId: inputmsg.displayName
                                });
                                request.on('response', function (response) {
                                    console.log("responsefromenroll", response);
                                    var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                                    var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                                    botMsg = response.result.fulfillment.speech;
                                    var butn = {
                                        "actionResponse": { "type": "NEW_MESSAGE" },
                                        "cards": [{
                                            "sections": [{
                                                "widgets": [{
                                                    "textParagraph": {
                                                        "text": botMsg
                                                    },
                                                    "buttons": [{
                                                        "textButton": {
                                                            "text": button1,
                                                            "onClick": {
                                                                "action": {
                                                                    "actionMethodName": "button1",
                                                                    "parameters": [{
                                                                        "key": "count",
                                                                        "value": button1
                                                                    }]
                                                                }
                                                            }
                                                        }
                                                    }, {
                                                        "textButton": {
                                                            "text": button2,
                                                            "onClick": {
                                                                "action": {
                                                                    "actionMethodName": "button2",
                                                                    "parameters": [{
                                                                        "key": "count",
                                                                        "value": button2
                                                                    }]
                                                                }
                                                            }
                                                        }
                                                    }]
                                                }]
                                            }]
                                        }]
                                    }
                                    resolve(butn);
                                });
                                request.on('error', function (error) {
                                    console.log(error);
                                });

                                request.end();
                            }
                        } else {
                            resolve({ "text": "no records found" })
                        }
                        db.close();
                    });
                });
            } else if (response.result.action == 'Class_Timings') {
                var event = {};
                var olddata = [];
                displayName = displayName.replace(/\s/g, '');
                console.log("displayname", displayName);
                var timings = response.result.parameters.classtimings;
                olddata.push(timings);
                console.log("timings",timings)
                console.log("Class_Timings",olddata)
                MongoClient.connect(uri, function (err, db) {
                    //check for connection errors
                    if (err) console.log("err", err)
                    var query = {
                        _id: displayName
                    };
                    db.collection(displayName).find(query).toArray(function (err, result) {
                        if (err) console.log(err);
                        console.log(result[0].courses_enrolled); 
                        var data = result[0].courses_enrolled[0];
                        data.toString();
                        console.log(typeof(data));
                        olddata.push(data)
                        console.log("olddata find",olddata);
                    })
                    //Read the data from the incoming request & add it to an object to insert
                    var myquery = { _id: displayName };
                    setTimeout(() => {
                    console.log("olddata update",olddata);
                    var newvalues = { $set: { courses_enrolled : olddata } };
                    db.collection(displayName).updateOne(myquery, newvalues, function (err, res) {
                        if (err) reject(err)
                        else console.log("1 document updated",olddata);
                        db.close();
                    
                if(timings == "CSCI345 - Database systems"){
                    event = {
                        'summary': 'CSCI345 - Database systems',
                        'location': 'New York',
                        'start': {
                          'dateTime': '2019-04-03T06:00:00-04:00',
                          'timeZone': 'America/New_York',
                        },
                        'end': {
                          'dateTime': '2019-04-03T09:00:00-04:00',
                          'timeZone': 'America/New_York',
                        },
                        'recurrence': [
                          'RRULE:FREQ=WEEKLY;UNTIL=20191027T170000Z'
                        ],
                        'attendees': [
                          {'email': email}
                        ],
                        'reminders': {
                          'useDefault': false,
                          'overrides': [
                            {'method': 'email', 'minutes': 24 * 60},
                            {'method': 'popup', 'minutes': 10},
                          ],
                        },
                      };
                } else {
                    event = {
                        'summary': 'CSCI976 - Artificial Intelligence',
                        'location': 'New York',
                        'description': 'A chance to hear more about Google\'s developer products.',
                        'start': {
                          'dateTime': '2019-04-01T03:00:00',
                          'timeZone': 'America/New_York',
                        },
                        'end': {
                          'dateTime': '2019-04-01T07:00:00',
                          'timeZone': 'America/New_York',
                        },
                        'recurrence': [
                          'RRULE:FREQ=WEEKLY;UNTIL=20191027T170000Z'
                        ],
                        'attendees': [
                          {'email': email}
                        ],
                        'reminders': {
                          'useDefault': false,
                          'overrides': [
                            {'method': 'email', 'minutes': 24 * 60},
                            {'method': 'popup', 'minutes': 10},
                          ],
                        },
                      };
                }
                authorize(credentials, listEvents);
                /**
                 * Create an OAuth2 client with the given credentials, and then execute the
                 * given callback function.
                 * @param {Object} credentials The authorization client credentials.
                 * @param {function} callback The callback to call with the authorized client.
                 */
                function authorize(credentials, callback) {
                    const { client_secret, client_id, redirect_uris } = credentials.installed;
                    const oAuth2Client = new google.auth.OAuth2(
                        client_id, client_secret, redirect_uris[0]);
                    console.log(token);
                    oAuth2Client.setCredentials(token);
                    callback(oAuth2Client);

                }
                function listEvents(auth) {
                    const calendar = google.calendar({ version: 'v3', auth });

                    calendar.events.insert({
                        auth: auth,
                        calendarId: 'primary',
                        resource: event,
                    }, function (err, event) {
                        if (err) {
                            console.log('There was an error contacting the Calendar service: ' + err);
                            return;
                        }
                        console.log('Event created: %s', event.htmlLink);
                    });
                }
                resolve({ "text": botMsg })
            });
        }, 1000);
        });
            } else if (botMsg == "For which department are you looking for") {
                var butn = {
                    "actionResponse": { "type": "NEW_MESSAGE" },
                    "cards": [{
                        "sections": [{
                            "widgets": [{
                                "textParagraph": {
                                    "text": botMsg
                                },
                                "buttons": [{
                                    "textButton": {
                                        "text": "Engineering & Computing Sciences",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button1",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Engineering & Computing Sciences"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "Management Studies",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button2",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Management Studies"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "Architecture & Design",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button3",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Architecture & Design"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "Arts & Sciences",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button4",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Arts & Sciences"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "Health Professions",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button5",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Health Professions"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "NOT INTRESTED",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button5",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "NOT INTRESTED"
                                                }]
                                            }
                                        }
                                    }
                                }]
                            }]
                        }]
                    }]
                }
                resolve(butn);
            } else if (botMsg == "For which course are you looking for") {
                var butn = {
                    "actionResponse": { "type": "NEW_MESSAGE" },
                    "cards": [{
                        "sections": [{
                            "widgets": [{
                                "textParagraph": {
                                    "text": botMsg
                                },
                                "buttons": [{
                                    "textButton": {
                                        "text": "Undergraduate courses",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button1",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Undergraduate courses"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "Graduate courses",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button2",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Graduate courses"
                                                }]
                                            }
                                        }
                                    }
                                }]
                            }]
                        }]
                    }]
                }
                resolve(butn);
            } else if (botMsg == "which semester are you looking for") {
                var butn = {
                    "actionResponse": { "type": "NEW_MESSAGE" },
                    "cards": [{
                        "sections": [{
                            "widgets": [{
                                "textParagraph": {
                                    "text": botMsg
                                },
                                "buttons": [{
                                    "textButton": {
                                        "text": "Spring 2019",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button1",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Spring 2019"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "Summer 2019",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button2",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Summer 2019"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "Fall 2019",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button3",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "Fall 2019"
                                                }]
                                            }
                                        }
                                    }
                                }, {
                                    "textButton": {
                                        "text": "NOT INTRESTED",
                                        "onClick": {
                                            "action": {
                                                "actionMethodName": "button4",
                                                "parameters": [{
                                                    "key": "count",
                                                    "value": "NOT INTRESTED"
                                                }]
                                            }
                                        }
                                    }
                                }]
                            }]
                        }]
                    }]
                }
                resolve(butn);
            } else if (response.result.action == "Course-Management" && response.result.parameters.Courses != "" && response.result.parameters.Departments != "" && response.result.parameters.Semester != "") {
                var courses = response.result.parameters.Courses;
                var dept = response.result.parameters.Departments;
                var semester = response.result.parameters.Semester;
                console.log("semester", semester);
                console.log("dept", dept);
                if (semester == "Spring 2019" && dept == "Engineering & Computing Sciences") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Data Structures & Algorithms" + "<br> " + "2. Computer Architecture" + "<br> " + "3. Software Engineering" + "<br> " + "4. Database Systems" + "<br> " + "5. Artificial Intelligence" + "<br> " + "6. Machine Learning" + "<br> " + "7. Cloud Computing" + "<br> " + "8. Computer Graphics"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Fall 2019" && dept == "Engineering & Computing Sciences") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Data Structures & Algorithms" + "<br> " + "2. Computer Architecture" + "<br> " + "3. Software Engineering" + "<br> " + "4. Database Systems" + "<br> " + "5. Artificial Intelligence" + "<br> " + "6. Machine Learning" + "<br> " + "7. Cloud Computing" + "<br> " + "8. Computer Graphics"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Summer 2019" && dept == "Engineering & Computing Sciences") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Computer Graphics" + "<br> " + "2. Artificial Intelligence"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Spring 2019" && dept == "Management Studies" || semester == "Fall 2019") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Introduction to Management" + "<br> " + "2. Human Resource Management" + "<br> " + "3. Organizational Behavior" + "<br> " + "4. Economics for Management" + "<br> " + "5. Law & Policy" + "<br> " + "6. Organizational Strategy"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Summer 2019" && dept == "Management Studies") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Organizational Behavior" + "<br> " + "2. Economics for Management"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Spring 2019" || semester == "Fall 2019" && dept == "Architecture & Design") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Architecture Design IV, V" + "<br> " + "2. From computers to Presentation" + "<br> " + "3. Portfolio Preparation" + "<br> " + "4. Fundamentals of Design II" + "<br> " + "5. Research in Architecture" + "<br> " + "6. Senior Thesis in Interior Design" + "<br> " + "7. Special studies in Architecture" + "<br> " + "8. Visualization I"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Summer 2019" && dept == "Architecture & Design") {
                    console.log("Architecture & Design", semester);
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Special studies in Architecture" + "<br> " + "2. Fundamentals of Design II"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Spring 2019" || semester == "Fall 2019" && dept == "Arts & Science") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. CG - Animation M.F.A" + "<br> " + "2. CG - Fine Arts & Technology" + "<br> " + "3. CG - Graphic Design" + "<br> " + "4. Digital Arts - B.F.A" + "<br> " + "5. Graphic Design - B.F.A" + "<br> " + "6. Interior Design" + "<br> " + "7. Animation Design" + "<br> " + "8. Virtual Graphics Design"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Summer 2019" && dept == "Arts & Science") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Digital Arts" + "<br> " + "2. Interior Design"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Spring 2019" || semester == "Fall 2019" && dept == "Health Professions") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Clinical Nutritian, M.S" + "<br> " + "2. Global Health, Certificate" + "<br> " + "3. Bioengineering" + "<br> " + "4. Health Sciences, B.S" + "<br> " + "5. Health Sciences Minor" + "<br> " + "6. Osteopathic Medicine, M.S" + "<br> " + "7. Occupational therapy, M.S" + "<br> " + "8. Nursing, B.S"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else if (semester == "Summer 2019" && dept == "Health Professions") {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "Here are the list of courses available for " + courses + " - " + semester + "<br> " + "1. Health Sciences, B.S" + "<br> " + "2. Health Sciences Minor" + "<br> " + "3. Osteopathic Medicine, M.S"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                } else {
                    var card = {
                        "cards": [
                            {
                                "sections": [
                                    {
                                        "widgets": [
                                            {
                                                "textParagraph": {
                                                    "text": "No courses to display"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
                resolve(card);
            } else if (response.result.fulfillment.messages[0].payload) {
                var text1 = response.result.fulfillment.messages[0].payload.messages[0].text1;
                var text2 = response.result.fulfillment.messages[0].payload.messages[0].text2;
                resolve({ text: text1 + "\n" + text2 });

            } else if (response.result.fulfillment.messages[1]) {
                console.log("message1", JSON.stringify(response.result.fulfillment.messages[1].payload.messages[0].type))
                if (response.result.fulfillment.messages[1].payload.messages[0].type == "text") {
                    var text1 = response.result.fulfillment.messages[1].payload.messages[0].text1;
                    var text2 = response.result.fulfillment.messages[1].payload.messages[0].text2;
                    var text3 = response.result.fulfillment.messages[1].payload.messages[0].text3;
                    var text4 = response.result.fulfillment.messages[1].payload.messages[0].text4;
                    var text5 = response.result.fulfillment.messages[1].payload.messages[0].text5;
                    var text6 = response.result.fulfillment.messages[1].payload.messages[0].text6;
                    var text7 = response.result.fulfillment.messages[1].payload.messages[0].text7;
                    var text8 = response.result.fulfillment.messages[1].payload.messages[0].text8;
                    var message1 = response.result.fulfillment.messages[0].speech;
                    var message2 = response.result.fulfillment.messages[2].speech
                    if (text8) {
                        var card = {
                            "cards": [
                                {
                                    "sections": [
                                        {
                                            "widgets": [
                                                {
                                                    "textParagraph": {
                                                        "text": message1 + "<br> " + text1 + "<br> " + text2 + "<br> " + text3 + "<br> " + text4 + "<br> " + text5 + "<br> " + text6 + "<br> " + text7 + "<br> " + text8 + "<br>" + message2
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    } else if (text6) {
                        var card = {
                            "cards": [
                                {
                                    "sections": [
                                        {
                                            "widgets": [
                                                {
                                                    "textParagraph": {
                                                        "text": message1 + "<br> " + text1 + "<br> " + text2 + "<br> " + text3 + "<br> " + text4 + "<br> " + text5 + "<br> " + text6 + "<br>" + message2
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    } else if (text5) {
                        var card = {
                            "cards": [
                                {
                                    "sections": [
                                        {
                                            "widgets": [
                                                {
                                                    "textParagraph": {
                                                        "text": message1 + "<br> " + text1 + "<br> " + text2 + "<br> " + text3 + "<br> " + text4 + "<br> " + text5 + "<br>" + message2
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    } else if (message2) {
                        var card = {
                            "cards": [
                                {
                                    "sections": [
                                        {
                                            "widgets": [
                                                {
                                                    "textParagraph": {
                                                        "text": message1 + "<br> " + text1 + "<br> " + text2 + "<br>" + message2
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    } else {
                        var card = {
                            "cards": [
                                {
                                    "sections": [
                                        {
                                            "widgets": [
                                                {
                                                    "textParagraph": {
                                                        "text": text1 + "<br> " + text2
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                    resolve(card);
                } else if (response.result.fulfillment.messages[1].payload.messages[0].type == "button") {
                    var datas = JSON.stringify(response.result.fulfillment.messages[1].payload.messages[0].type)
                    if (response.result.fulfillment.messages[1].payload.messages[0].button5) {
                        var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                        var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                        var button3 = response.result.fulfillment.messages[1].payload.messages[0].button3;
                        var button4 = response.result.fulfillment.messages[1].payload.messages[0].button4;
                        var button5 = response.result.fulfillment.messages[1].payload.messages[0].button5;
                        var butn = {
                            "actionResponse": { "type": "NEW_MESSAGE" },
                            "cards": [{
                                "sections": [{
                                    "widgets": [{
                                        "textParagraph": {
                                            "text": botMsg
                                        },
                                        "buttons": [{
                                            "textButton": {
                                                "text": button1,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button1",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button1
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button2,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button2",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button2
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button3,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button3",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button3
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button4,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button4",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button4
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button5,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button5",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button5
                                                        }]
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                                }]
                            }]
                        }
                        resolve(butn);
                    } else if (response.result.fulfillment.messages[1].payload.messages[0].button4) {
                        console.log("into button4");
                        var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                        var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                        var button3 = response.result.fulfillment.messages[1].payload.messages[0].button3;
                        var button4 = response.result.fulfillment.messages[1].payload.messages[0].button4;
                        var butn = {
                            "actionResponse": { "type": "NEW_MESSAGE" },
                            "cards": [{
                                "sections": [{
                                    "widgets": [{
                                        "textParagraph": {
                                            "text": botMsg
                                        },
                                        "buttons": [{
                                            "textButton": {
                                                "text": button1,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button1",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button1
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button2,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button2",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button2
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button3,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button3",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button3
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button4,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button4",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button4
                                                        }]
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                                }]
                            }]
                        }
                        resolve(butn);
                    } else if (response.result.fulfillment.messages[1].payload.messages[0].button3) {
                        console.log("into button3")
                        var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                        var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                        var button3 = response.result.fulfillment.messages[1].payload.messages[0].button3;
                        var butn = {
                            "actionResponse": { "type": "NEW_MESSAGE" },
                            "cards": [{
                                "sections": [{
                                    "widgets": [{
                                        "textParagraph": {
                                            "text": botMsg
                                        },
                                        "buttons": [{
                                            "textButton": {
                                                "text": button1,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button1",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button1
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button2,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button2",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button2
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button3,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button3",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button3
                                                        }]
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                                }]
                            }]
                        }
                        resolve(butn);
                    } else {
                        var button1 = response.result.fulfillment.messages[1].payload.messages[0].button1;
                        var button2 = response.result.fulfillment.messages[1].payload.messages[0].button2;
                        var butn = {
                            "actionResponse": { "type": "NEW_MESSAGE" },
                            "cards": [{
                                "sections": [{
                                    "widgets": [{
                                        "textParagraph": {
                                            "text": botMsg
                                        },
                                        "buttons": [{
                                            "textButton": {
                                                "text": button1,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button1",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button1
                                                        }]
                                                    }
                                                }
                                            }
                                        }, {
                                            "textButton": {
                                                "text": button2,
                                                "onClick": {
                                                    "action": {
                                                        "actionMethodName": "button2",
                                                        "parameters": [{
                                                            "key": "count",
                                                            "value": button2
                                                        }]
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                                }]
                            }]
                        }
                        resolve(butn);
                    }
                } else {
                    console.log("button else flow in ")
                    resolve({
                        "text": botMsg
                    });
                }
            } else {
                console.log("else flow in")
                resolve({
                    "text": botMsg
                });
            }

        });

        request.on('error', function (error) {
            console.log(error);
            reject(error);
        });

        request.end();
    })
}