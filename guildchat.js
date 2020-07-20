const fs = require('fs');
const { Client } = require('iron-golem');
const mineflayer = require('mineflayer');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);
const readline = require('readline');
const unorm = require('unorm');
const vec3 = require('vec3')
const Discord = require('discord.js');
const dClient = new Discord.Client();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const name = "<Account Name>";
const readChannel = '<Channel ID to read guild chat messages from>';
const officerReadChannel = '<Channel ID to read officer chat messages from>';
const webhookId = "<Guild chat webhook Id>"
const webhookKey = "<Guild chat webhook Key";
const officerWebhookId = "<Officer chat webhook Id>";
const officerWebhookKey = "<Officer chat webhook Key>";
const discordToken = "<Discord Bot Token>";
const minecraftUsername = "<Mojang Email>";
const minecraftPassword = "<Minecraft Password>";
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });

const client = new Client({
    username: 'minecraftUsername',
    password: 'minecraftPassword',
    server: 'hypixel.net',
	sessionCache: {
		name: "default"
	},
	version: "1.8",
	serverConfigs: [
		{
			server:  /\.?hypixel\.net$/i,
			name: "Hypixel",
			version: "1.8",
			chatDelay: 4000,
			chat: [
				{
                name: 'chat',
                regex: /^.+$/,
                matches: ['fullText']
				}
			]
		}
	]
    // other settings here,
    // look inside Client.js
    // for all the possible settings
    // (or by the time you read this I
    // might actually have some jsdocs)
});

function register() {
    // Restart after 2.5 seconds
    function restart() {
        setTimeout(function () {
            // There is a promise being ignored here
            // but I am currently too lazy to fix that
            client.init();
        }, 2500);
    }
    
    //client.on('kicked', restart);
    //client.on('end', restart);
    //client.on('error', function (e) {
        //if (e.toString().includes('FATAL')) {
            //restart();
        //}
    //});

    client.on('login', function () {
        console.log('Succesfully logged in!');
		navigatePlugin(client.bot);
		//console.log(client.bot);
		//console.log(client.bot.navigate);
		client.bot.navigate.on('pathFound', function (path) {
		  console.log("found path. I can get there in " + path.length + " moves.");
		});
		client.bot.navigate.on('cannotFind', function (closestPath) {
		  console.log("unable to find path. getting as close as possible");
		  client.bot.navigate.walk(closestPath);
		});
		client.bot.navigate.on('arrived', function () {
		  console.log("I have arrived");
		});
		client.bot.navigate.on('interrupted', function() {
		  console.log("stopping");
		});
		client.bot._client.on('update_health', function (packet) {
			console.log("Updated Health.");
			client.bot.setQuickBarSlot(0);
			//setTimeout(function() {
			//	client.bot.activateItem()
			//}, 250);
		});
		client.bot.on('windowOpen', (window) => {
			/*
			console.log(window);
			if (window.title == '{"translate":"Game Menu"}') {
				client.bot.clickWindow(11, 0, 0);
				console.log("Joined Skyblock.");
				setTimeout(function() {
					client.send("/warp hub");
					setTimeout(function() {
						console.log("Should be in hub now.");
						client.bot.navigate.to(vec3(16, 71, -80));
					}, 1000);
				}, 1000);
			}*/
			//bot.clickWindow(11);
		});
		client.bot.on('entitySpawn', (entity) => {
			//console.log(entity.displayName + " <" + entity.uuid + ">");
			//console.log(entity);
		});
		client.bot.on('playerJoined', (player) => {
			//console.log(entity.displayName + " <" + entity.uuid + ">");
			//console.log(player);
		});
		client.bot._client.on('player_info', (player) => {
			//console.log(entity.displayName + " <" + entity.uuid + ">");
			if (player.action == 0) {
				for (var i = 0; i < player.data.length; i++) {
					//console.log(player.data[i].UUID);
					//console.log(player.data[i].properties);
				}
			}
		});
    });
    
    // Message is the event emitted by un-parsed chat
    // this event is emitted regardless of server configs
    client.on('message', function (msg, coloredText) {
		if ((msg.startsWith("Guild >") || msg.startsWith("Officer >")) && msg.includes(":")) {
			let v = msg.split(" ");
			//console.log(v)
			//if (v[2].includes(name + ":") || v[3].includes(name + ":")) return;
			if (v[2].includes(name + "") || v[3].includes(name + "")) return;

			let splitMsg = msg.split(" ");
			let i = msg.indexOf(":");
			let splitMsg2 = [msg.slice(0,i), msg.slice(i+1)];
			let sender, sentMsg;
			if (splitMsg[2].includes("[")) {
				sender = splitMsg[3].replace(":","");
			} else {
				sender = splitMsg[2].replace(":","");
			}
			sentMsg = splitMsg2[1];
			sentMsg = sentMsg.replace("@everyone","@ everyone").replace("@here", "@ here");
			if (msg.startsWith("Guild >"))
			{
				webhook = new Discord.WebhookClient(webhookId, webhookKey);
			}
			else if (msg.startsWith("Officer >"))
			{
				webhook = new Discord.WebhookClient(officerWebhookId, officerWebhookKey);
			}
			webhook.send(sentMsg, {username: sender, avatarURL:"https://minotar.net/helm/" + sender + "/256.png"});
		}
        // Print the ANSI colored text
		//if (text.indexOf("✎ Mana") <= 0) {
		logFile.write(coloredText + '\n');
		console.log(coloredText);
		//}
    });

    // This is a custom one emitted because there is
    // a chat message regex registered for Mineplex
    client.on('chat', function (msg) {
        //console.log(`Just got a message from ${msg.sender}, who is level ${msg.level} and rank ${msg.rank} - ${msg.text}`);
    });

    client.on('spawn', function () {
		console.log("SPAWN.");
        // You can still access mineflayer if you want
        // Don't set events on mineflayer though, because
        // if the client is restarted those go poof.
        //console.log(`There are ${Object.keys(client.bot.players).length} players online.`);
		
        // Send chat messages through the client so that it obeys chat delay
        // This is async because it may take a while to send, because of the delay.
        // It usually won't fail.
        //client.send('Hello world!').catch(console.error);
    });
}

dClient.on('ready', () => {
  //console.log(`Logged in as ${client.user.tag}!`);
  //new Discord.TextChannel(guilddata);
});

dClient.on('message', msg => {
	if (msg.channel.id === readChannel || msg.channel.id === officerReadChannel)
	{
		if (!msg.author.bot)
		{
			discordMsg = unorm.nfkd(msg.cleanContent);
			if (msg.author.id !== "115659366337740809")
			{
				discordMsg = discordMsg.replace(/u[\.\- ]?w[\.\- ]?u/ig,"u-word");
				discordMsg = discordMsg.replace(/q[\.\- ]?w[\.\- ]?q/ig,"u-word");
				discordMsg = discordMsg.replace(/o[\.\- ]?w[\.\- ]?o/ig,"u-word");
				discordMsg = discordMsg.replace(/a[\.\- ]?w[\.\- ]?a/ig,"u-word");
			}
			console.log("\x1b[1m\x1b[36m[DISCORD]\x1b[0m " + unorm.nfkd(msg.author.username) + "#" + msg.author.discriminator + "> " + discordMsg);
			logFile.write("\x1b[1m\x1b[36m[DISCORD]\x1b[0m " + unorm.nfkd(msg.author.username) + "#" + msg.author.discriminator + "> " + discordMsg + "\n");
			if (msg.channel.id === readChannel) {
				client.send("/gc " + unorm.nfkd(msg.author.username) + "#" + msg.author.discriminator + "> " + discordMsg).catch(console.error);
			}
			else if (msg.channel.id === officerReadChannel)
			{
				client.send("/g oc " + unorm.nfkd(msg.author.username) + "#" + msg.author.discriminator + "> " + discordMsg).catch(console.error);
			}
		}
	}
});

dClient.login(discordToken);

async function run() {
    try {
        await client.init();
    } catch (e) {
        console.error('Client hit a fatal error while initializing: ');
        console.error(e);
        return;
    }
    
    register();
}

run().catch(console.error);

function terminal() {
	rl.question("> ", (answer) => {
		if (answer.substring(0, 1) == "!") {
			client.send(answer.substring(1)).catch(console.error);
		}
		args = answer.split(" ");
		if (args[0] == "nav") {
			x = parseInt(args[1]);
			y = parseInt(args[2]);
			z = parseInt(args[3]);
			client.bot.navigate.to(vec3(x, y, z));
		}
		terminal();
	});
}

terminal();
