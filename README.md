# discord-raider

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

(WIP) A raid scheduling tool for [Discord](https://discordapp.com/).

Table of contents
=================
  - [Installation](#installation)
    - [Discord token](#discord-token)
    - [Run the bot (WIP)](#run-the-bot-wip)
  - [Commands](#commands)
    - [Raid related commands](#raid-related-commands)
      - [Event administration](#event-administration)
      - [Event list](#event-list)
      - [Event participation](#event-participation)
      - [Organizer commands](#organizer-commands)
      - [Extras](#extras)
    - [Character related command](#character-related-command)
      - [Character definition](#character-definition)
    - [Role related command](#role-related-command)
      - [Role administration](#role-administration)
      - [Role list](#role-list)
  - [Run the tests](#run-the-tests)
    - (WIP)
  - [License](#Licensing)


Installation
============
#### Discord token
You need a valid Discord token and provide it to the bot. To generate a Discord token, please follow intructions here: [Discord bots](https://discordapp.com/developers/docs/topics/oauth2#bots)

#### Run the bot (WIP)

```
DISCORD_TOKEN=Your_Discord_Token npm start
```

Commands
========

>Spaces in parameters are allowed if the parameter is between quotes: `!raider add "a name with space"`.


## Raid related commands

### Event administration
```docker
# Create a new event
!raider add <event_name> <event_date> <event_description>

# Remove an event
!raider remove <event_id>
```

### Event list
```docker
# List all events
!raider list
```

### Event participation
```docker
# Join an event
!raider join <event_id>

# Decline an event
!raider decline <event_id>
```

### Organizer commands
```docker
# Accept a participant to the event
!raider accept <event_id> <player_name>

# Refuse a participant to the event
!raider refuse <event_id> <player_name>
```

### Extras
```docker
# Call (mention) all players for the next event
!raider call

# Get a summary of the next event
!raider summary
```

## Character related command

### Character definition
```docker
# Set a role to the discord user
!raider set <role_name>
```

## Role related command

### Role administration
```docker
# Define a new role with a name, a category and an icon
!raider rdefine <role_name> <role_category> <role_icon>
```

> The icon used can be an emoji. Just use the emoji synthax in the command.

```docker
!raider rdefine Priest Healer :sun_with_face:  
```

### Role list
TBD


Run the tests
=============
WIP

Licensing
=========
This project is under the MIT License.
