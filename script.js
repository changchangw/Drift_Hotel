const scenes = {
  1: { image: 'assets/chapter1/start.png', action: () => goToScene(2) },
  2: { image: 'assets/chapter1/cover.png', action: () => goToScene(3) },
  3: { image: 'assets/chapter1/prologue.png', action: () => goToScene(4) },
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
      },
      {
        left: '476px', top: '108px', width: '165px', height: '130px', // Graduation Photo
        action: () => goToScene(7)
      }
    ]
  },
  6: {
    image: 'assets/chapter1/room11.png',
    hotspots: [
      {
        left: '24px', top: '340px', width: '40px', height: '40px', // arrow ←
        action: () => goToScene(5)
      },
      {
        left: '117px', top: '102px', width: '486px', height: '278px', // Shakespeare's Sonnets
        action: () => goToScene(11)
      },
      {
        left: '756px', top: '353px', width: '350px', height: '126px', // Flawless
        action: () => goToScene(15)
      }
    ]
  },
  7: { image: 'assets/chapter1/room1/1-1.png', action: () => goToSceneInstant(8) },
  8: { image: 'assets/chapter1/room1/1-2.png', action: () => goToSceneInstant(9) },
  9: { image: 'assets/chapter1/room1/1-3.png', action: () => goToSceneInstant(10) },
  10: { image: 'assets/chapter1/room1/1-4.png', action: () => goToScene(5) },

  11: { image: 'assets/chapter1/room1/2-1.png', action: () => goToSceneInstant(12) },
  12: { image: 'assets/chapter1/room1/2-2.png', action: () => goToSceneInstant(13) },
  13: { image: 'assets/chapter1/room1/2-3.png', action: () => goToSceneInstant(14) },
  14: { image: 'assets/chapter1/room1/2-4.png', action: () => goToScene(6) },

  15: { image: 'assets/chapter1/room1/3-1.png', action: () => goToSceneInstant(16) },
  16: { image: 'assets/chapter1/room1/3-2.png', action: () => goToSceneInstant(17) },
  17: { image: 'assets/chapter1/room1/3-3.png', action: () => goToSceneInstant(18) },
  18: { image: 'assets/chapter1/room1/3-4.png', action: () => goToScene(6) },
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

function goToSceneInstant(index) {
  currentScene = index;
  sceneImage.src = scenes[index].image;
  updateHotspots();
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
