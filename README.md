# SIP Trunking

This is a catapult-based app for creating and managing sip trunks

## Install

Run

```
git clone https://github.com/jhorwitz828/sipTrunking.git
npm install
```

## Getting Started

* Install dependencies from npm,
* **get user id, api token and secret** - to use the Catapult API you need these data. You can get them [here](https://catapult.inetwork.com/pages/catapult.jsf) on the tab "Account." You will also need to create a new domain under the "My SIP" tab,
* **Set NGROK_URL, SIP_TRUNKING_DOMAIN_ID, CATAPULT_USER_ID, CATAPULT_API_TOKEN and CATAPULT_API_SECRET** - you need to set these on your machine as environment variables.

## Usage

* When running with ngrok, set the call URL on the catapult application to http://ngrok-url-from-your-machine/calls.
* When using Heroku, set the call URL to http://heroku-webapp-url/calls
