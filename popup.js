function animateStats(root) {
  root.querySelectorAll('.stat-bar__fill').forEach(fill => {
    fill.style.width = '0%'; 
    // Force reflow
    void fill.offsetWidth;
    const val = fill.dataset.value;
    if (!isNaN(val)) {
      const pct = val + '%';
      requestAnimationFrame(() => {
        fill.style.width = pct;
      });
    } else {
      fill.style.width = '0%';
    }
  });
}

function showFaceitPopup(target, content, mouseX, mouseY) {
    let popup = document.createElement('div');
    popup.className = 'faceit-popup';
    popup.innerHTML = content;
    popup.style.position = 'fixed';
    popup.style.background = '#171d25';
    popup.style.color = '#fff';
    popup.style.padding = '8px 12px';
    popup.style.borderRadius = '6px';
    popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    popup.style.zIndex = 10000;
    popup.style.top = (mouseY + 10) + 'px';
    popup.style.left = (mouseX + 10) + 'px';
    popup.id = 'faceit-popup';
    document.body.appendChild(popup);

    animateStats(popup);

    function movePopup(ev) {
        popup.style.top = (ev.clientY + 10) + 'px';
        popup.style.left = (ev.clientX + 10) + 'px';
    }
    target.addEventListener('mousemove', movePopup);

    target.addEventListener('mouseleave', () => {
        popup.remove();
        target.removeEventListener('mousemove', movePopup);
    });
}

const leetifyLogo = chrome.runtime.getURL('images/leetify-logo-primary-white.svg');

// popup.js
function getCardHtml(elo, aim, util, pos) {
    const display = v => (typeof v === 'number' && !isNaN(v) ? Math.round(v) : 0);
    
    const statLine = (label, value) => {
      const val = display(value);
      let colorClass = 'red';
      if (val > 75) colorClass = 'green';
      else if (val > 50) colorClass = 'orange';
      // Remove debug styles, keep only the class
      return `
      <li class="stat-item">
        <span>${label}</span>
        <div class="stat-bar" style="--val:${val}%">
          <div class="stat-bar__fill ${colorClass}" data-value="${val}"></div>
          <div class="stat-bar__value">${val}</div>
        </div>
      </li>`;
    };

    return `
    <div class="card faceit-hover-card" id="myCard">
      <div>
        <div>
          <img src="${leetifyLogo}" alt="Leetify" style="height: 15px; margin-right: 10px;">
          <div class="card__content"></div>
        </div>
        <div class="card__face card__face--back" style="display: block;">
          <ul>
            Faceit ELO: ${elo}
            ${statLine('Aim', aim)}
            ${statLine('Utility', util)}
            ${statLine('Positioning', pos)}
          </ul>
        </div>
      </div>
    </div>
    `;
}