const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js');

const background = ''; //url background
const defaultColor = '#36ffff';
const width = 1000;
const height = 300;
const margin = 32;
const padding = 35;
const avRadius = 90;
const barRadius = 35;
const gainedXp = 50;
const requiredXp = 100;

const level = '53';
const position = '#14';

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

let user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;

if (background) {
    const img = await loadImage(background);

    const imgHeight = img.height * (width / img.width);

    ctx.drawImage(img, 0, (canvas.height / 2) - (imgHeight / 2), width, imgHeight);
} else {
    ctx.fillStyle = '#23272a';
    ctx.fillRect(0, 0, width, height);
};

const defaultBgColor = '#090a0b';

const bgColor = background ?
    'rgba(0, 0, 0, 0.6)' :
    defaultBgColor;

ctx.fillStyle = bgColor;
ctx.fillRect(margin, margin, width - (margin * 2), height - (margin * 2));

const avatar = await loadImage(user.displayAvatarURL({ format: 'png', size: 1024 }));

ctx.lineWidth = 8;

const avX = (height / 2);

fillRectWithImage(avatar, avX, height / 2, avRadius);

const member = message.guild.member(user);
const role = member.highestRole;

let color = role.hexColor;

if (!role.color)
    color = defaultColor;

ctx.strokeStyle = color;
ctx.beginPath();
ctx.arc(avX, height / 2, avRadius + (ctx.lineWidth / 2) - 1, 0, 2 * Math.PI);
ctx.stroke();
ctx.closePath();

ctx.font = '48px Arial';

const name = user.username

const nameX = (margin * 2) + padding + (avRadius * 2);
const nameW = ctx.measureText(name).width;

const barWidth = ((width - (margin * 2) - nameX) - padding) + 5;
const progress = (gainedXp / requiredXp) * 100 * (barWidth / 100);

ctx.lineWidth = barRadius;
ctx.lineCap = 'round';

ctx.strokeStyle = '#484b4e';

const barX = nameX + 8;
const barY = ((height - (margin + padding)) - (barRadius / 2));

const drawBar = (end) => {
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + end, barY);
    ctx.stroke();
};

drawBar(barWidth);

ctx.strokeStyle = color;

drawBar(progress);

const nameY = barY - (barRadius / 2) - 15;

ctx.fillStyle = 'white';
ctx.fillText(name, nameX, nameY);

const smallerTextColor = '#676a6e';

ctx.font = '28px Arial';
ctx.fillStyle = smallerTextColor;
ctx.fillText('#' + user.discriminator, (nameX + nameW) + 5, nameY);

ctx.textAlign = 'end';
ctx.fillStyle = color;
ctx.font = '65px Arial';

const measure = (text) => (ctx.measureText(text).width) + 10;

let startX = barX + barWidth + 10;
let startY = margin + 45 + padding;

let measured = 0;

const addText = (text, font, hex = color) => {
    ctx.fillStyle = hex;
    ctx.font = font;

    ctx.fillText(text, startX - measured, startY);

    measured += measure(text);
};

const bigTextFont = '65px Arial';
const smallTextFont = '25px Arial';
const smallTextColor = '#eee';

addText(level, bigTextFont);
addText('NÍVEL', smallTextFont, smallTextColor);
addText(position, bigTextFont);
addText('POSIÇÃO', smallTextFont, smallTextColor);

measured = 0;

startX -= 5;
startY = nameY;

const xpFont = '28px Arial';

addText(`/ ${requiredXp} XP`, xpFont, smallerTextColor);
addText(gainedXp, xpFont, smallTextColor);

function fillRectWithImage(img, x, y, r) {
    const canvas2 = createCanvas(r * 2, r * 2);
    const ctx2 = canvas2.getContext('2d');

    ctx2.drawImage(img, 0, 0, r * 2, r * 2);
    ctx2.globalCompositeOperation = 'destination-in';

    ctx2.arc(r, r, r, 0, 2 * Math.PI);
    ctx2.fill();

    ctx.drawImage(canvas2, x - r, y - r);
}

const status = {
    online() { },
    offline(x, y) {
        ctx.fillStyle = defaultBgColor;
        ctx.beginPath();
        ctx.arc(x, y, statusRadius - 16, 0, 2 * Math.PI);
        ctx.fill();
    },
    dnd(x, y) {
        const size = 11;

        ctx.strokeStyle = defaultBgColor;
        ctx.lineWidth = 12;

        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.stroke();
    },
    idle(x, y) {
        ctx.fillStyle = defaultBgColor;
        ctx.beginPath();
        ctx.arc(x - 10, y - 10, statusRadius - 15.5, 0, 2 * Math.PI);
        ctx.fill();
    }
};

const statusMargin = 65;
const statusRadius = 30;

const drawStatus = (x, y) => {
    const draw = status[user.presence.status];

    ctx.fillStyle = defaultBgColor;
    ctx.beginPath();
    ctx.arc(x, y, statusRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, statusRadius - 7, 0, 2 * Math.PI);
    ctx.fill();

    draw(x, y);
};

drawStatus(avX + statusMargin, (height / 2) + statusMargin);

const rank = new MessageAttachment(canvas.toBuffer(), 'rank.png');
message.channel.send(rank);
