const { SlashCommandBuilder, EmbedBuilder, Colors } = require(`discord.js`);
const fs = require("fs")
const cooldown = new Set();

const cooldownEmbed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setDescription("**Beklemelisin!** Bir daha Roblox hesabı alabilmen için 10 dakika beklemen gerekiyor.");

const noStockEmbed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setDescription("**Stokta Hesap Bulunmamaktadır!** Şu anda Roblox hesabı bulunmamaktadır.");

const succesSent = new EmbedBuilder()
    .setColor(Colors.Green)
    .setDescription("**Başarılı!** Başarıyla 1 adet Roblox hesabını sana DM üzerinden teslim ettim.");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblox')
        .setDescription(`Sizlere stokdan bir Roblox hesabı verir.`),
    async execute(client, interaction) {
        if (cooldown.has(interaction.user.id)) {
            return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true })
        } else {
            fs.readFile('./accounts/roblox.txt', 'utf8', function(err, data) {
                if (err) throw err;

                data = data + '';
                var lines = data.split('\n');

                if (lines.length == null) {
                    return interaction.reply({ embeds: [noStockEmbed], ephemeral: true });
                }

                let account = lines[Math.floor(Math.random() * 1)];

                if (account.length == 0) {
                    return interaction.reply({ embeds: [noStockEmbed], ephemeral: true });
                }

                fs.writeFile('./accounts/roblox.txt', lines.slice(1).join('\n'), function(err) {
                    if(err) throw err;
                });

                const embed = new EmbedBuilder()
                    .setTitle("Üretim Başarılı | Roblox Hesap")
                    .setDescription("Üretilen bazı hesaplar çalışmayabilirler.")
                    .addFields(
                        { name: 'Destek Sunucumuz', value: `https://discord.gg/j8vv5abDef`},
                        { name: 'Hesabın', value: "`" + `${account}` + "`"},
                    )
                    .setFooter({ text: 'Flash Generator', iconURL: client.user.displayAvatarURL() })

                    .setTimestamp();

                interaction.user.send({ embeds: [embed] });
                interaction.reply({ embeds: [succesSent], ephemeral: true })

                cooldown.add(interaction.user.id);
                setTimeout(() => {
                    cooldown.delete(interaction.user.id);
                }, 10 * 60 * 1000);
            });
        }
    },
};
