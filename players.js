const head = document.getElementById('head');


const skinViewer = new skinview3d.SkinViewer({
    canvas,
    width: canvas.width,
    height: canvas.height,
    skin: "https://minotar.net/skin/notch"
});

window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    skinViewer.setSize(canvas.width, canvas.height);
})

let cape = null;
let skin = null;
let playerName = null;

let control = skinview3d.createOrbitControls(skinViewer);
control.enableRotate = true;
control.enableZoom = true;
control.enablePan = false;

let idle = skinViewer.animations.add(skinview3d.IdleAnimation);
let walkAnimation = null;
let runAnimation = null;
let flyAnimation = null;


head.addEventListener("click", () => {
    const link = document.createElement('a');
    link.download = "skin.png";
    link.href = `https://api.sverben.nl/safeImage?url=${skin}`;
    link.click();
})

async function loadPlayer(name) {
    const res = await fetch(`https://mc-heads.net/minecraft/profile/${name}`);
    const json = await res.json();

    const textures = json.properties.find(p => p.name === "textures");
    const decoded = atob(textures.value);
    const texture = JSON.parse(decoded);
    head.src = `https://mc-heads.net/avatar/${name}`;

    if (texture.textures.SKIN) {
        skinViewer.loadEars(null);
        skinViewer.loadSkin(`https://api.sverben.nl/safeImage?url=${texture.textures.SKIN.url}`, {
            ears: texture.profileName === "deadmau5"
        });
        skin = texture.textures.SKIN.url;
    }
    if (texture.textures.CAPE) {
        skinViewer.loadCape(`https://api.sverben.nl/safeImage?url=${texture.textures.CAPE.url}`);
        cape = texture.textures.CAPE.url;
    } else {
        skinViewer.loadCape(null);
        cape = null;
    }

    uuid.innerText = json.id;

    history.innerHTML = "";
    for (let i in json.name_history) {
        const data = json.name_history[i];
        const e = document.createElement("div");
        e.classList.add("data");

        const key = document.createElement("b");
        key.innerText = data.name;
        e.appendChild(key);

        if (data.changedToAt) {
            const val = document.createElement("div");
            const date = new Date(data.changedToAt);
            val.innerText = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
            e.appendChild(val);
        }

        history.prepend(e);
    }

    player.innerText = texture.profileName;
    playerName = texture.profileName;
    if (texture.profileName === "Dinnerbone" || texture.profileName === "Grumm") {
        skinViewer.playerObject.rotation.z = Math.PI;
    } else {
        skinViewer.playerObject.rotation.z = 0;
    }

    rank.innerText = ranks[json.id] !== undefined ? details[ranks[json.id]].name : mojang.includes(playerName) ? details[1].name : "Player";
    rank.style.color = ranks[json.id] !== undefined && details[ranks[json.id]].color ? details[ranks[json.id]].color : mojang.includes(playerName) ? details[1].color : "white";

    const classes = rank.classList.value.split(" ");
    for (let i of classes) {
        rank.classList.remove(i);
    }

    rank.classList.add("value");
    rarity();
    if (ranks[json.id] !== undefined && details[ranks[json.id]].type) {
        rank.classList.add(details[ranks[json.id]].type);
    }
}


