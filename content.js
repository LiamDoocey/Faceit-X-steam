window.onload = () => {
    const API_KEY = 'a7d52a5c-208d-4833-9559-a1414a52f65b';
    const headers = {
        "Authorization": `Bearer ${API_KEY}`
    }

    let faceitProfile;

    const currentProfile = window.location.href + "?xml=1";

    if(window.location.href.includes("friends")){
        let friendBlock = document.querySelectorAll('.selectable.friend_block_v2');

        friendBlock.forEach(friend => {
            let profile = friend.querySelector('a')?.href + "?xml=1"

            if(profile){
                console.log(`Checking: ${profile}`)

                processProfile(profile)
            }
        });
    } else {
        processProfile(currentProfile)
    }

    function processProfile(profileURL){
        fetch(profileURL)
            .then(res => res.text())
            .then(xmlString => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlString, "text/xml");
                const steamIDelement = xml.querySelector('steamID64');
                const steamID = steamIDelement.textContent;

                return steamID;
            })
            .then(steamID => getFaceitData(steamID))
        }

    function getFaceitData(ID){
        fetch(`https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${ID}`, { headers })
            .then(res => {
                if (!res.ok){
                    if (res.status === 404){
                        console.log(`Faceit account not found for player ${ID}`);
                    } else {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                }
                return res.json();
            })
            .then(data => {

                let targetElement;

                const faceitProfile = data.faceit_url.replace('{lang}', 'en');
                const faceitLevel = data.games.cs2.skill_level;
                const levelLogo = new Image(height = 36, width = 36);
                const link = document.createElement('a');

                levelLogo.src = chrome.runtime.getURL(`images/faceit${faceitLevel}.svg`);
                
                link.href = `${ faceitProfile }`;
                link.target = "_blank";

                if(window.location.href.includes("friends")){
                    targetElement = document.querySelector(`.friend_block_v2[data-steamid="${ID}"]`)

                    levelLogo.style = `
                        position: absolute;
                        top: 0;
                        right: 0;
                        margin: 5px;`;
                } 
                else {
                    targetElement = document.querySelector('.persona_name.persona_level');

                    levelLogo.style = `
                    margin-left: 5px;
                    vertical-align: middle;`;

                    const supernavContainer = document.querySelector('.supernav_container');
                    if (supernavContainer) {
                        const newMenuItem = document.createElement('a');
                        newMenuItem.className = "menuitem";
                        newMenuItem.href = `${ faceitProfile + "/stats/cs2" }`;
                        newMenuItem.target = "_blank";
                        newMenuItem.innerText = "Faceit Stats"
                        supernavContainer.appendChild(newMenuItem);
                    }

                }

                link.appendChild(levelLogo);
                targetElement.appendChild(link);
        })
        .catch(err => console.log(err));
    }
    
}
