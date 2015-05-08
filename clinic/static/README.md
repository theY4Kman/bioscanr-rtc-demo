# Acision Forge Banking Application
To demonstrate the power of the Acision Forge platform we created a demo banking application showcased at CES in Las Vegas back in January. 

Below is an outline of how to get the application up and running within your own application. It has two user interfaces, one for the agents and another for the customer. You will need three separate usernames and passwords from your Acision Forge account to create this demo. It only uses simple `AUTH` for this demo.

NOTE: All values are hardcodes for demo purposes only.

## Customer Interface
**File Location: /index.html**

`Line 364` set `data-agent-id=""`: needs to be the user name for agent one.

`Line 432` set `data-agent-id=""`: needs to be the user name for agent two.

**File Location: /scipt/app.js**

`Line 7` set `API KEY` from the Forge platform

`Line 10` set customer username from the Forge platform 

`Line 11` set customer password from the Forge platform

`Line 14` set agent one username from the Forge platform

`Line 15` set agent two username from the Forge platform

## Agent Interface
**File Location: /agent/js/app.js**

`Line 7` set `API KEY` from the Forge platform

`Line 15` set username of agent one from the Forge platform

`Line 16` set password of agent one from the Forge platform

`Line 19` set display name for agent one

`Line 25` set username of agent two from the Forge platform

`Line 26` set password of agent two from the Forge platform

`Line 29` set display name for agent two

# Query Strings for Agents
Agents have their own interface that you will enter from a separte url. See below for an example of how to query your agents.

`example.com/agent?uid=1` for agent one

`example.com/agent?uid=2` for agent two 

## Pin Numbers for Agents
Agents have a hardcode pin number that can be accessed by clicking on the `CLICK TO COMMUNICATE` button. It will display a modal that you can enter an agent pin to connect directly. 

Agent One Pin Number: `1111`

Agent Two Pin Number: `2222`



