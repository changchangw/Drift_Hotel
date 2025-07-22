const scenes = {
  1: { image: 'assets/chapter1/start.png', action: () => goToScene(2) },
  2: { image: 'assets/chapter1/prologue.png', action: () => goToScene(3) },
  3: { image: 'assets/chapter1/cover.png', action: () => goToScene(4) },
  4: {
    image: 'assets/chapter1/rooms.png',
    hotspots: [
      {
        left: '141px', top: '172px', width: '230px', height: '460px', // Ms. Bell
        action: () => goToScene(5)
      },
      {
        left: '525px', top: '172px', width: '230px', height: '460px', // Mr. Alder
        action: () => goToScene(10) // placeholder
      },
      {
        left: '909px', top: '172px', width: '230px', height: '460px', // Mr. Eliot
        action: () => goToScene(15) // placeholder
      }
    ]
  },
  5: {
    image: 'assets/chapter1/room1.png',
    hotspots: [
      {
        left: '141px', top: '172px', width: '230px', height: '460px', // door
        action: () => goToScene(4)
      },
      {
        left: '1216px', top: '340px', width: '40px', height: '40px', // arrow →
        action: () => goToScene(6)
      }
    ]
  },
  6: {
    image: 'assets/chapter1/room11.png',
    hotspots: [
      {
        left: '24px', top: '340px', width: '40px', height: '40px', // arrow ←
        action: () => goToScene(5)
      }
    ]
  }
};

let currentScene = 1;
const sceneImage = document.getElementById('scene-image');
const hotspotContainer = document.getElementById('hotspot-container');

function goToScene(index) {
  const overlay = document.getElementById('fade-overlay');
  overlay.style.opacity = 1; // 开始变黑

  setTimeout(() => {
    currentScene = index;
    sceneImage.src = scenes[index].image;
    updateHotspots();

    // 等待一帧后再淡入
    setTimeout(() => {
      overlay.style.opacity = 0; // 变亮
    }, 50);
  }, 600); // 等待黑屏完成后切换
}

function updateHotspots() {
  hotspotContainer.innerHTML = '';
  const data = scenes[currentScene];

  if (data.hotspots) {
    data.hotspots.forEach(h => {
      const div = document.createElement('div');
      div.className = 'hotspot';
      div.style.left = h.left;
      div.style.top = h.top;
      div.style.width = h.width;
      div.style.height = h.height;
      div.onclick = h.action;
      hotspotContainer.appendChild(div);
    });
  }
}

// 点击整个屏幕切换早期场景（1~3）
window.addEventListener('click', () => {
  const scene = scenes[currentScene];
  if (scene && scene.action && !scene.hotspots) {
    scene.action();
  }
});

goToScene(1);
