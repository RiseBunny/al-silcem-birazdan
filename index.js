const { Client, GatewayIntentBits, Routes, Collection, ActivityType, Events, Partials } = require("discord.js");
const config = require("./config");
const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const db = require("croxydb");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const client = new Client({ intents: INTENTS, partials: PARTIALS});

client.commands = new Collection();
const slashCommands = [];

client.on(Events.GuildCreate, async (guild) => {
    console.log(`${client.user.tag} sunucuya eklendi: ${guild.name} (${guild.id})`);

    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        await rest.put(Routes.applicationGuildCommands(config.clientID, guild.id), { body: slashCommands });
        console.log(`Başarıyla komutlar yüklendi - Sunucu: ${guild.name} (${guild.id})`);
    } catch (error) {
        console.error('Komut yüklenirken bir hata oluştu:', error);
    }
});

client.on(Events.ClientReady, async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı.`);
	client.user.setStatus("dnd");
    client.user.setActivity(`Sizleri`, { type: ActivityType.Watching });

    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
        const guilds = await client.guilds.fetch();
        const guildIDs = guilds.map(guild => guild.id);	

        for (const guildID of guildIDs) {
            await rest.put(Routes.applicationGuildCommands(config.clientID, guildID), { body: slashCommands });
        }

        console.log(`Toplam ${guildIDs.length} sunucuda komutlar yüklendi.`);
    } catch (error) {
        console.error('Komut yüklenirken bir hata oluştu:', error);
	}
});

const commandsPath = path.join(__dirname, 'commands'); // Buraya komutlar klasörünün adını giriniz, bu kodda varsayılan olarak commands olarak belirttim.
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());

    console.log(`${command.data.name} dosyası yüklendi.`)
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Komut ${interaction.commandName} bulunamadı.`);
        return;
    }

    try {
        await command.execute(client, interaction);
    } catch (error) {
        return console.error("Bir hata oluştu: " + error.message);
    }
});

client.on(Events.MessageCreate, async msg => {
    if (msg.channel.id != "1128316367041482870") return;
    msg.delete()
})

client.login(config.token)