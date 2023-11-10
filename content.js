window.onload = () => {
    const API_KEY = ''; //Enter your faceit API key here
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
                console.log(data);

                const profile = data.faceit_url.replace('{lang}', 'en');
                const faceitLevel = data.games.cs2.skill_level;
                const targetElement = document.querySelector('.profile_header_summary');
                const levelLogo = new Image();
                const link = document.createElement('a');

                levelLogo.src = chrome.runtime.getURL(`images/faceit${faceitLevel}.svg`);
                levelLogo.style = "margin-left: 5px; position: absolute; top: 13px; left: 750px; height: 36px; width: 36px;";

                link.href = `${ profile }`;
                link.target = "_blank";

                link.appendChild(levelLogo);
                targetElement.appendChild(link);
        })
        .catch(err => console.log(err));
    }
}
