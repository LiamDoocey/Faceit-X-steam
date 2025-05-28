function animateStats(root) {
  root.querySelectorAll('.stat-bar__fill').forEach(fill => {
    fill.style.width = '0%';
    // Force reflow
    void fill.offsetWidth;
    const val = parseInt(fill.dataset.value, 10);
    if (!isNaN(val)) {
      let current = 0;
      function step() {
        if (current <= val) {
          fill.style.width = current + '%';
          // Dynamically set color
          if (current > 75) fill.className = 'stat-bar__fill green';
          else if (current > 50) fill.className = 'stat-bar__fill orange';
          else fill.className = 'stat-bar__fill red';
          current += 0.225; // speed of animation
          requestAnimationFrame(step);
        } else {
          fill.style.width = val + '%';
        }
      }
      requestAnimationFrame(step);
    } else {
      fill.style.width = '0%';
      fill.className = 'stat-bar__fill red';
    }
  });
}

function showFaceitPopup(target, content, mouseX, mouseY) {
    let popup = document.createElement('div');
    popup.className = 'faceit-popup';
    popup.innerHTML = content;
    popup.style.position = 'absolute';
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    popup.style.top = (mouseY + scrollY + 10) + 'px';
    popup.style.left = (mouseX + scrollX + 10) + 'px';
    popup.style.background = '#171d25';
    popup.style.color = '#fff';
    popup.style.padding = '8px 12px';
    popup.style.borderRadius = '6px';
    popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    popup.style.zIndex = 10000;
    popup.id = 'faceit-popup';
    document.body.appendChild(popup);

    animateStats(popup);

    // Make last five rows clickable (example: alert or open a link)
    popup.querySelectorAll('.last-five-row').forEach(row => {
        row.addEventListener('click', () => {
            const roomId = row.getAttribute('data-room-id');
            if (roomId) {
                const gameUrl = `https://leetify.com/app/match-details/${roomId}/overview`;
                window.open(gameUrl, '_blank');
            }
        });
    });

    const card = popup.querySelector('.card.faceit-hover-card');
    if (card) {
        card.addEventListener('click', function () {
            if (card.classList.contains('no-matches')) {
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 500);
            } else {
                card.classList.toggle('flipped');
            }
        });
    }

    function movePopup(ev) {
        popup.style.top = (ev.clientY + 10) + 'px';
        popup.style.left = (ev.clientX + 10) + 'px';
    }
    target.addEventListener('mousemove', movePopup);

    // Lock popup position on scroll when mouse is over the card
    function lockPopupOnScroll() {
        window.removeEventListener('scroll', movePopupOnScroll, true);
    }
    function unlockPopupOnScroll() {
        window.addEventListener('scroll', movePopupOnScroll, true);
    }
    function movePopupOnScroll() {
        
        if (!overPopup) {
            
        }
    }

    // Track if mouse is over target or popup
    let overTarget = true;
    let overPopup = false;

    function tryRemovePopup() {
        if (!overTarget && !overPopup) {
            popup.remove();
            target.removeEventListener('mousemove', movePopup);
            target.removeEventListener('mouseleave', onTargetLeave);
            target.removeEventListener('mouseenter', onTargetEnter);
            popup.removeEventListener('mouseenter', onPopupEnter);
            popup.removeEventListener('mouseleave', onPopupLeave);
        }
    }

    function onTargetEnter() {
        overTarget = true;
    }
    function onTargetLeave() {
        overTarget = false;
        setTimeout(tryRemovePopup, 60); // slight delay for mouse to reach popup
    }
    function onPopupEnter() {
        overPopup = true;
        lockPopupOnScroll();
    }
    function onPopupLeave() {
        overPopup = false;
        unlockPopupOnScroll();
        setTimeout(tryRemovePopup, 10); // slight delay for mouse to leave popup
    }

    target.addEventListener('mouseenter', onTargetEnter);
    target.addEventListener('mouseleave', onTargetLeave);
    popup.addEventListener('mouseenter', onPopupEnter);
    popup.addEventListener('mouseleave', onPopupLeave);

    // Optionally, enable scroll lock initially
    unlockPopupOnScroll();
}

const leetifyLogo = chrome.runtime.getURL('images/leetify-logo-primary-white.svg');

// popup.js
function getCardHtml(elo, aim, util, pos, lastFive) {
    const display = v => (typeof v === 'number' && !isNaN(v) ? Math.round(v) : 0);

    const statLine = (label, value) => {
      const val = display(value);
      let colorClass = 'red';
      if (val > 75) colorClass = 'green';
      else if (val > 50) colorClass = 'orange';
      return `
      <li class="stat-item">
        <span>${label}</span>
        <div class="stat-bar" style="--val:${val}%">
          <div class="stat-bar__fill ${colorClass}" data-value="${val}"></div>
          <div class="stat-bar__value">${val}</div>
        </div>
      </li>`;
    };

    const noMatches = !lastFive || lastFive.length === 0;

    return `
    <div class="card faceit-hover-card${noMatches ? ' no-matches' : ''}" id="myCard">
      <div class="card__inner">
        <div class="card__face card__face--front">
          <img src="${leetifyLogo}" alt="Leetify" style="height: 15px; margin-right: 10px;">
          <ul>
            <li style="font-weight:bold; margin-bottom:4px;">Faceit ELO: ${elo}</li>
            ${statLine('Aim', aim)}
            ${statLine('Utility', util)}
            ${statLine('Positioning', pos)}
          </ul>
          <div style="margin-top:8px;">${noMatches ? 'No recent matches found on Leetify' : 'Click to flip for more info'}</div>
        </div>
        <div class="card__face card__face--back">
          <img src="${leetifyLogo}" alt="Leetify" style="height: 15px; margin-right: 10px;">
          <div>
            <strong>Last 5 games</strong>
            ${
              noMatches
                ? '<div style="margin-top:12px;">No recent matches found.</div>'
                : `<table class="last-five-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Date</th>
                        <th>Map</th>
                        <th>Result</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${lastFive.map((game, i) => {
                        const resultClass = game.result === 'win' ? 'result-win' : 'result-loss';
                        const resultText = game.result.charAt(0).toUpperCase() + game.result.slice(1);
                        const sourceIcon = game.source === 'faceit'
                          ? `<img src="${chrome.runtime.getURL('images/faceit.svg')}" alt="Faceit" style="height:18px;">`
                          : `<img src="${chrome.runtime.getURL('images/Counter-Strike_2.svg')}" alt="CS2" style="height:18px;">`;
                        return `
                          <tr class="last-five-row" data-index="${i}" data-room-id="${game.room_id}" style="cursor:pointer;">
                            <td>${sourceIcon}</td>
                            <td>${game.date}</td>
                            <td>${game.map}</td>
                            <td><span class="${resultClass}">${resultText}</span></td>
                            <td>${game.score[0] + ":" + game.score[1]}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>`
            }
          </div>
        </div>
      </div>
    </div>
    `;
}