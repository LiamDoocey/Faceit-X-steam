window.onload = () => {
    const API_KEY = 'a7d52a5c-208d-4833-9559-a1414a52f65b';
    const headers = {
        "Authorization": `Bearer ${API_KEY}`
    }

    const currentProfile = window.location.href + "?xml=1";

    fetch(currentProfile)
        .then(res => res.text())
        .then(xmlString => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlString, "text/xml");
            const steamIDelement = xml.querySelector('steamID64');
            const steamID = steamIDelement.textContent;

            return steamID;
        })
        .then(steamID => getFaceitData(steamID))

    function getFaceitData(ID){
        fetch(`https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${ID}`, { headers })
            .then(res => res.json())
            .then(data => {

                const profile = data.faceit_url.replace('{lang}', 'en');
                const faceitLevel = data.games.cs2.skill_level;
                const targetElement = document.querySelector('.persona_name.persona_level');
                const levelLogo = new Image(height = 36, width = 36);
                const link = document.createElement('a');

                levelLogo.src = chrome.runtime.getURL(`images/faceit${faceitLevel}.svg`);
                levelLogo.style = ```
                    margin-left: 5px;
                    vertical-align: middle;
                ```;

                link.href = `${ profile }`;
                link.target = "_blank";

                link.appendChild(levelLogo);
                targetElement.appendChild(link);
        })
        .catch(err => console.log(err));
    }
}
