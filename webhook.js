var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));
app.set('verify_token', (process.env.VERIFY_TOKEN || 'TEST'));
app.set('page_access_token', (process.env.PAGE_ACCESS_TOKEN || 'EAAZAElSBZAfHEBAHqYsQQ6eltBKRyAZCUplAWk52tuGY87CfnArIcndLmwBR8QmHr59r5CqCHPP0L7Vwot3UJkbMSWApbTjYTzdAZAElwzK1V8ouGLm8VxjSYh3xr4VKY5NgJUBWIvmX0JY9ZBnZAwdrk0sI6d33tyaFOekujWLQZDZD'));

app.get('/', function (req, res) {
        res.send('It Works! Follow FB Instructions to activate.');
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === app.get('verify_token')) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});


// {
//   "object":"page",
//   "entry":[
//     {
//       "id":PAGE_ID,
//       "time":12341,
//       "messaging":[
//         {
//           "sender":{
//             "id":"USER_ID"
//           },
//           "recipient":{
//             "id":"PAGE_ID"
//           },
//           "timestamp":1234567890,
//           "optin":{
//             "ref":"PASS_THROUGH_PARAM"
//           }
//         }
//       ]
//     }
//   ]
// }

// {
//   "object":"page",
//   "entry":[
//     {
//       "id":PAGE_ID,
//       "time":1457764198246,
//       "messaging":[
//         {
//           "sender":{
//             "id":"USER_ID"
//           },
//           "recipient":{
//             "id":"PAGE_ID"
//           },
//           "timestamp":1457764197627,
//           "message":{
//             "mid":"mid.1457764197618:41d102a3e1ae206a38",
//             "seq":73,
//             "text":"hello, world!"
//           }
//         }
//       ]
//     }
//   ]
// }

app.post('/webhook/', function (req, res) {
    // console.log (req.body);
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
            // Your Logic Replaces the following Line
            if (text === 'Generic') {
                sendGenericMessage(sender)
                continue
            }

            console.log('WORK');
            if (event.optin) {
               console.log(event.optin);
               console.log(event.optin.ref);
            }

            for (var prop in event) {
                console.log(prop + " = " + event[prop]);
            }
            console.log('event sender'+event.sender);
            console.log('event recipient'+event.recipient);

            // console.log('event[0]'+event[0]);  

            sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));                 
        }
    }
    res.sendStatus(200);
});

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:app.get('page_access_token')},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }        
    });
}

function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:app.get('page_access_token')},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});