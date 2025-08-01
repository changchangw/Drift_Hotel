// script.js

const memoryCollected = {
  room1: false,
  room2: false,
  room3: false
};

const memoryCount = {
  room1: 0,
  room2: 0,
  room3: 0
};

const markData = {
  room1: {
    left: '141px',
    top: '172px',
    image: 'assets/chapter1/mark_room1.png'
  },
  room2: {
    left: '525px',
    top: '172px',
    image: 'assets/chapter1/mark_room2.png'
  },
  room3: {
    left: '909px',
    top: '172px',
    image: 'assets/chapter1/mark_room3.png'
  }
};

const hintImage = document.getElementById('hint-image');

const scenes = {
  1: { 
    image: 'assets/chapter1/start.png', 
    action: () => goToScene(2),
    customSetup: () => setupHotelScene()
  },
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
        action: () => goToScene(19)
      },
      {
        left: '909px', top: '172px', width: '230px', height: '460px', // Mr. Eliot
        action: () => goToScene(35)
      }
    ]
  },

  // room 1
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
  10: {
    image: 'assets/chapter1/room1/1-4.png',
    action: () => {
      memoryCount.room1 += 1;
      if (memoryCount.room1 >= 3) {
        memoryCollected.room1 = true;
      }
      goToScene(5);
    }
  },

  11: { image: 'assets/chapter1/room1/2-1.png', action: () => goToSceneInstant(12) },
  12: { image: 'assets/chapter1/room1/2-2.png', action: () => goToSceneInstant(13) },
  13: { image: 'assets/chapter1/room1/2-3.png', action: () => goToSceneInstant(14) },
  14: {
    image: 'assets/chapter1/room1/2-4.png',
    action: () => {
      memoryCount.room1 += 1;
      if (memoryCount.room1 >= 3) {
        memoryCollected.room1 = true;
      }
      goToScene(6);
    }
  },

  15: { image: 'assets/chapter1/room1/3-1.png', action: () => goToSceneInstant(16) },
  16: { image: 'assets/chapter1/room1/3-2.png', action: () => goToSceneInstant(17) },
  17: { image: 'assets/chapter1/room1/3-3.png', action: () => goToSceneInstant(18) },
  18: {
    image: 'assets/chapter1/room1/3-4.png',
    action: () => {
      memoryCount.room1 += 1;
      if (memoryCount.room1 >= 3) {
        memoryCollected.room1 = true;
      }
      goToScene(6);
    }
  },

  // room 2
  19: {
    image: 'assets/chapter1/room2.png',
    hotspots: [
      {
        left: '141px', top: '172px', width: '230px', height: '460px', // door
        action: () => goToScene(4)
      },
      {
        left: '1216px', top: '340px', width: '40px', height: '40px', // arrow →
        action: () => goToScene(20)
      },
      {
        left: '547px', top: '221px', width: '200px', height: '450px', // The Starry Night
        action: () => goToScene(21)
      }
    ]
  },
  20: {
    image: 'assets/chapter1/room22.png',
    hotspots: [
      {
        left: '24px', top: '340px', width: '40px', height: '40px', // arrow ←
        action: () => goToScene(19)
      },
      {
        left: '668px', top: '624px', width: '60px', height: '60px', // Termination
        action: () => goToScene(26)
      },
      {
        left: '850px', top: '164px', width: '272px', height: '500px', // The Mirror
        action: () => goToScene(31)
      }
    ]
  },
  21: { image: 'assets/chapter1/room2/1-1.png', action: () => goToSceneInstant(22) },
  22: { image: 'assets/chapter1/room2/1-2.png', action: () => goToSceneInstant(23) },
  23: { image: 'assets/chapter1/room2/1-3.png', action: () => goToSceneInstant(24) },
  24: { image: 'assets/chapter1/room2/1-4.png', action: () => goToSceneInstant(25) },
  25: {
    image: 'assets/chapter1/room2/1-5.png',
    action: () => {
      memoryCount.room2 += 1;
      if (memoryCount.room2 >= 3) {
        memoryCollected.room2 = true;
      }
      goToScene(19);
    }
  },

  26: { image: 'assets/chapter1/room2/2-1.png', action: () => goToSceneInstant(27) },
  27: { image: 'assets/chapter1/room2/2-2.png', action: () => goToSceneInstant(28) },
  28: { image: 'assets/chapter1/room2/2-3.png', action: () => goToSceneInstant(29) },
  29: { image: 'assets/chapter1/room2/2-4.png', action: () => goToSceneInstant(30) },
  30: {
    image: 'assets/chapter1/room2/2-5.png',
    action: () => {
      memoryCount.room2 += 1;
      if (memoryCount.room2 >= 3) {
        memoryCollected.room2 = true;
      }
      goToScene(20);
    }
  },

  31: { image: 'assets/chapter1/room2/3-1.png', action: () => goToSceneInstant(32) },
  32: { image: 'assets/chapter1/room2/3-2.png', action: () => goToSceneInstant(33) },
  33: { image: 'assets/chapter1/room2/3-3.png', action: () => goToSceneInstant(34) },
  34: {
    image: 'assets/chapter1/room2/3-4.png',
    action: () => {
      memoryCount.room2 += 1;
      if (memoryCount.room2 >= 3) {
        memoryCollected.room2 = true;
      }
      goToScene(20);
    }
  },

  // room 3
  35: {
    image: 'assets/chapter1/room3.png',
    hotspots: [
      {
        left: '141px', top: '172px', width: '230px', height: '460px', // door
        action: () => goToScene(4)
      },
      {
        left: '1216px', top: '340px', width: '40px', height: '40px', // arrow →
        action: () => goToScene(36)
      },
      {
        left: '830px', top: '239px', width: '212px', height: '161px', // An Outstanding Programmer
        action: () => goToScene(37)
      }
    ]
  },
  36: {
    image: 'assets/chapter1/room33.png',
    hotspots: [
      {
        left: '24px', top: '340px', width: '40px', height: '40px', // arrow ←
        action: () => goToScene(35)
      },
      {
        left: '148px', top: '89px', width: '175px', height: '263px', // Game Enthusiast
        action: () => goToScene(42)
      },
      {
        left: '563px', top: '413px', width: '720px', height: '300px', // Sleep No More
        action: () => goToScene(46)
      }
    ]
  },
  37: { image: 'assets/chapter1/room3/1-1.png', action: () => goToSceneInstant(38) },
  38: { image: 'assets/chapter1/room3/1-2.png', action: () => goToSceneInstant(39) },
  39: { image: 'assets/chapter1/room3/1-3.png', action: () => goToSceneInstant(41) },
  // 40: { image: 'assets/chapter1/room3/1-4.png', action: () => goToSceneInstant(41) },
  41: {
    image: 'assets/chapter1/room3/1-5.png',
    action: () => {
      memoryCount.room3 += 1;
      if (memoryCount.room3 >= 3) {
        memoryCollected.room3 = true;
      }
      goToScene(35);
    }
  },

  42: { image: 'assets/chapter1/room3/2-1.png', action: () => goToSceneInstant(43) },
  43: { image: 'assets/chapter1/room3/2-2.png', action: () => goToSceneInstant(44) },
  44: { image: 'assets/chapter1/room3/2-3.png', action: () => goToSceneInstant(45) },
  45: {
    image: 'assets/chapter1/room3/2-4.png',
    action: () => {
      memoryCount.room3 += 1;
      if (memoryCount.room3 >= 3) {
        memoryCollected.room3 = true;
      }
      goToScene(36);
    }
  },

  46: { image: 'assets/chapter1/room3/3-1.png', action: () => goToSceneInstant(47) },
  47: { image: 'assets/chapter1/room3/3-2.png', action: () => goToSceneInstant(48) },
  48: { image: 'assets/chapter1/room3/3-3.png', action: () => goToSceneInstant(49) },
  49: { image: 'assets/chapter1/room3/3-4.png', action: () => goToSceneInstant(50) },
  50: {
    image: 'assets/chapter1/room3/3-5.png',
    action: () => {
      memoryCount.room3 += 1;
      if (memoryCount.room3 >= 3) {
        memoryCollected.room3 = true;
      }
      goToScene(36);
    }
  },

  51: { image: 'assets/chapter2/prologue.png', action: () => goToScene(52) },
  // 跳转到数据可视化页面
  52: {
    image: 'assets/chapter2/cover.png',
    action: () => {
      const overlay = document.getElementById("fade-overlay");
      overlay.style.opacity = 1;
  
      setTimeout(() => {
        document.getElementById('scene-container').style.display = 'none';
        document.getElementById('datavis-container').style.display = 'block';
        initChart(0);
  
        setTimeout(() => {
          overlay.style.opacity = 0;
        }, 50);
      }, 600); // 与其他场景切换节奏一致
    }
  },
  
  // Chapter 3 scenes
  53: { image: 'assets/chapter3/cover.png', action: () => goToScene(54) },
  54: { image: 'assets/chapter3/prologue.png', action: () => goToScene(55) },
  55: { image: 'assets/chapter3/1.png', action: () => goToScene(56) },
  56: { image: 'assets/chapter3/2.png', action: () => goToScene(57) },
  57: { image: 'assets/chapter3/3.png', action: () => goToScene(58) },
  58: { image: 'assets/chapter3/4.png', action: () => goToScene(59) },
  59: { image: 'assets/chapter3/5.png', action: () => goToScene(60) },
  60: { image: 'assets/chapter3/6.png', action: () => goToScene(61) },
  61: { image: 'assets/chapter3/7.png', action: () => {} }// 最后一页，点击无动作
};

let currentScene = 1;
const sceneImage = document.getElementById('scene-image');
const hotspotContainer = document.getElementById('hotspot-container');

// 音乐控制变量
let isMusicPlaying = false;
const musicControl = document.getElementById('music-control');
const musicIcon = document.getElementById('music-icon');
const musicControlDatavis = document.getElementById('music-control-datavis');
const musicIconDatavis = document.getElementById('music-icon-datavis');
const backgroundMusic = document.getElementById('background-music');

function goToScene(index) {
  const overlay = document.getElementById('fade-overlay');
  overlay.style.opacity = 1; // 开始变黑

  setTimeout(() => {
    currentScene = index;
    sceneImage.src = scenes[index].image;

    updateHotspots();
    renderMarks(); 
    
    // 处理自定义设置
    if (scenes[index].customSetup) {
      scenes[index].customSetup();
    } else {
      // 如果不是场景1，隐藏酒店图片和闪烁文字
      const hotelContainer = document.getElementById('hotel-container');
      const blinkingText = document.getElementById('blinking-text');
      const sceneContainer = document.getElementById('scene-container');
      
      if (hotelContainer) hotelContainer.style.display = 'none';
      if (blinkingText) blinkingText.style.display = 'none';
      if (sceneContainer) sceneContainer.style.backgroundColor = '';
    }
    
    // 音乐控制逻辑
    // 在所有prologue、cover和特定页面不显示音乐按钮
    const isPrologueOrCover = index === 2 || index === 3 || index === 51 || index === 53 || index === 54;
    const isSpecialScene = index === 52 || index === 61 || index === 62;
    
    if (isPrologueOrCover || isSpecialScene) {
      // 在prologue、cover和特定页面隐藏音乐按钮
      musicControl.style.display = 'none';
      musicControlDatavis.style.display = 'none';
    } else {
      // 显示音乐控制按钮
      musicControl.style.display = 'block';
      musicControlDatavis.style.display = 'none'; // scene部分显示，datavis部分隐藏
      
      // 如果音乐还没开始播放，自动开始播放
      if (!isMusicPlaying) {
        startMusic();
      }
    }

    if (index === 4) {
      // if it is the first entry
      if (
        !memoryCollected.room1 &&
        !memoryCollected.room2 &&
        !memoryCollected.room3
      ) {
        hintImage.src = 'assets/chapter1/hint_start.png';
        hintImage.style.display = 'block';
      }
    
      // if the memories have been collected
      else if (
        memoryCollected.room1 &&
        memoryCollected.room2 &&
        memoryCollected.room3
      ) {
        hintImage.src = 'assets/chapter1/hint_complete.png';
        hintImage.style.display = 'block';
      } else {
        hintImage.style.display = 'none';
      }
    } else {
      hintImage.style.display = 'none';
    }

    setTimeout(() => {
      overlay.style.opacity = 0;
    }, 50);
    
    // 处理最后一页音乐停止
    handleLastScene();
  }, 600);
}

// 酒店场景设置函数
function setupHotelScene() {
  // 设置黑色背景
  const sceneContainer = document.getElementById('scene-container');
  sceneContainer.style.backgroundColor = 'black';
  
  // 显示酒店图片和闪烁文字
  const hotelContainer = document.getElementById('hotel-container');
  const blinkingText = document.getElementById('blinking-text');
  
  hotelContainer.style.display = 'block';
  blinkingText.style.display = 'block';
  
  // 设置酒店图片的鼠标悬停效果
  const hotelImage = document.getElementById('hotel-image');
  
  // 移除之前的事件监听器（如果存在）
  hotelImage.removeEventListener('mouseenter', hotelImage._mouseenterHandler);
  hotelImage.removeEventListener('mouseleave', hotelImage._mouseleaveHandler);
  hotelContainer.removeEventListener('click', hotelContainer._clickHandler);
  
  // 创建事件处理函数
  hotelImage._mouseenterHandler = function() {
    this.src = 'assets/chapter1/hotel-light.png';
  };
  
  hotelImage._mouseleaveHandler = function() {
    this.src = 'assets/chapter1/hotel.png';
  };
  
  hotelContainer._clickHandler = function(e) {
    e.stopPropagation(); // 阻止事件冒泡
    goToScene(2);
  };
  
  // 添加新的事件监听器
  hotelImage.addEventListener('mouseenter', hotelImage._mouseenterHandler);
  hotelImage.addEventListener('mouseleave', hotelImage._mouseleaveHandler);
  hotelContainer.addEventListener('click', hotelContainer._clickHandler);
}


function goToSceneInstant(index) {
  currentScene = index;
  sceneImage.src = scenes[index].image;
  updateHotspots();
}


function renderMarks() {
  const container = document.getElementById('mark-container');
  container.innerHTML = '';

  if (currentScene !== 4) return;

  for (const room in memoryCollected) {
    if (memoryCollected[room]) {
      const mark = markData[room];
      const img = document.createElement('img');
      img.src = mark.image;
      img.className = 'mark';
      img.style.left = mark.left;
      img.style.top = mark.top;
      container.appendChild(img);
    }
  }
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
  // ✅ 如果已经进入数据可视化阶段，不再处理点击跳转
  const datavisVisible = document.getElementById('datavis-container').style.display === 'block';
  if (datavisVisible) return; // ⛔ 阻止点击触发任何跳转
  
  const scene = scenes[currentScene];
  if (scene && scene.action && !scene.hotspots) {
    scene.action();
  }

  // 如果在 scene 4 且三段记忆都已完成，点击后跳转
  if (
    currentScene === 4 &&
    memoryCollected.room1 &&
    memoryCollected.room2 &&
    memoryCollected.room3
  ) {
    goToScene(51); //接下一章
    return;
  }

  // 隐藏提示图像
  hintImage.style.display = 'none';
});

// 音乐控制函数
function startMusic() {
  console.log('尝试播放音乐...');
  backgroundMusic.play().then(() => {
    console.log('音乐播放成功');
    isMusicPlaying = true;
    musicIcon.src = 'assets/icons/music.png';
    musicIconDatavis.src = 'assets/icons/music.png';
  }).catch(error => {
    console.log('音乐播放失败:', error);
    // 尝试用户交互后播放
    document.addEventListener('click', function playMusicOnClick() {
      backgroundMusic.play().then(() => {
        console.log('用户交互后音乐播放成功');
        isMusicPlaying = true;
        musicIcon.src = 'assets/icons/music.png';
        musicIconDatavis.src = 'assets/icons/music.png';
      }).catch(err => {
        console.log('用户交互后音乐播放仍然失败:', err);
      });
      document.removeEventListener('click', playMusicOnClick);
    }, { once: true });
  });
}

function stopMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  isMusicPlaying = false;
  musicIcon.src = 'assets/icons/music_off.png';
  musicIconDatavis.src = 'assets/icons/music_off.png';
}

function toggleMusic() {
  if (isMusicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
}

// 音乐按钮点击事件
musicControl.addEventListener('click', (e) => {
  e.stopPropagation(); // 阻止事件冒泡，避免触发屏幕点击事件
  toggleMusic();
});

// datavis部分的音乐按钮点击事件
musicControlDatavis.addEventListener('click', (e) => {
  e.stopPropagation(); // 阻止事件冒泡，避免触发屏幕点击事件
  toggleMusic();
});

// 处理最后一页音乐停止
function handleLastScene() {
  if (currentScene === 62) {
    stopMusic();
    musicControl.style.display = 'none';
    musicControlDatavis.style.display = 'none';
  }
}

//goToScene(52); //测试用，正式应为1

// Chapter 3 启动函数
window.startChapter3 = function() {
  const overlay = document.getElementById("fade-overlay");
  
  // 先渐变变黑
  overlay.style.opacity = 1;
  
  // 等待变黑完成后，再切换场景
  setTimeout(() => {
    document.getElementById('datavis-container').style.display = 'none';
    document.getElementById('scene-container').style.display = 'block';
    currentScene = 53;
    
    // 设置新场景图片
    sceneImage.src = scenes[53].image;
    updateHotspots();
    renderMarks();
    
    // 显示音乐按钮（Chapter 3的场景）
    const musicControl = document.getElementById('music-control');
    const musicControlDatavis = document.getElementById('music-control-datavis');
    musicControl.style.display = 'block';
    musicControlDatavis.style.display = 'none';
    
    // 渐变显示新场景
    setTimeout(() => {
      overlay.style.opacity = 0;
    }, 50);
  }, 1000); // 从600ms增加到1000ms
};

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化场景1
  if (currentScene === 1) {
    setupHotelScene();
  }
});


