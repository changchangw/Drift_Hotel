// script.js

const memoryCollected = {
  room1: false,
  room2: false,
  room3: false
};

// 修改为跟踪每个房间收集的具体记忆
const roomMemories = {
  room1: new Set(), // 使用Set来存储收集的记忆ID，避免重复
  room2: new Set(),
  room3: new Set()
};

// 保留memoryCount用于兼容性，但不再使用
const memoryCount = {
  room1: 0,
  room2: 0,
  room3: 0
};

// 通用的记忆收集函数
function collectMemory(roomName, memoryId) {
  roomMemories[roomName].add(memoryId);
  
  // 如果收集了3个不同的记忆，标记房间为完成
  if (roomMemories[roomName].size >= 3) {
    memoryCollected[roomName] = true;
  }
  
  // 调试信息：显示当前收集状态
  console.log(`${roomName} 收集的记忆:`, Array.from(roomMemories[roomName]));
  console.log(`${roomName} 完成状态:`, memoryCollected[roomName]);
}

// 获取记忆收集状态的函数（用于调试）
function getMemoryStatus() {
  return {
    room1: {
      memories: Array.from(roomMemories.room1),
      completed: memoryCollected.room1,
      count: roomMemories.room1.size
    },
    room2: {
      memories: Array.from(roomMemories.room2),
      completed: memoryCollected.room2,
      count: roomMemories.room2.size
    },
    room3: {
      memories: Array.from(roomMemories.room3),
      completed: memoryCollected.room3,
      count: roomMemories.room3.size
    }
  };
}

// 将状态函数暴露到全局，方便调试
window.getMemoryStatus = getMemoryStatus;

// 将音乐控制函数暴露到全局
window.switchToChapter2Music = switchToChapter2Music;
window.isChapter2Music = () => isChapter2Music;

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
      collectMemory('room1', 'memory1'); // 第一个记忆：Graduation Photo
      goToScene(5);
    }
  },

  11: { image: 'assets/chapter1/room1/2-1.png', action: () => goToSceneInstant(12) },
  12: { image: 'assets/chapter1/room1/2-2.png', action: () => goToSceneInstant(13) },
  13: { image: 'assets/chapter1/room1/2-3.png', action: () => goToSceneInstant(14) },
  14: {
    image: 'assets/chapter1/room1/2-4.png',
    action: () => {
      collectMemory('room1', 'memory2'); // 第二个记忆：Shakespeare's Sonnets
      goToScene(6);
    }
  },

  15: { image: 'assets/chapter1/room1/3-1.png', action: () => goToSceneInstant(16) },
  16: { image: 'assets/chapter1/room1/3-2.png', action: () => goToSceneInstant(17) },
  17: { image: 'assets/chapter1/room1/3-3.png', action: () => goToSceneInstant(18) },
  18: {
    image: 'assets/chapter1/room1/3-4.png',
    action: () => {
      collectMemory('room1', 'memory3'); // 第三个记忆：Flawless
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
      collectMemory('room2', 'memory1'); // 第一个记忆：The Starry Night
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
      collectMemory('room2', 'memory2'); // 第二个记忆：Termination
      goToScene(20);
    }
  },

  31: { image: 'assets/chapter1/room2/3-1.png', action: () => goToSceneInstant(32) },
  32: { image: 'assets/chapter1/room2/3-2.png', action: () => goToSceneInstant(33) },
  33: { image: 'assets/chapter1/room2/3-3.png', action: () => goToSceneInstant(34) },
  34: {
    image: 'assets/chapter1/room2/3-4.png',
    action: () => {
      collectMemory('room2', 'memory3'); // 第三个记忆：The Mirror
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
      collectMemory('room3', 'memory1'); // 第一个记忆：An Outstanding Programmer
      goToScene(35);
    }
  },

  42: { image: 'assets/chapter1/room3/2-1.png', action: () => goToSceneInstant(43) },
  43: { image: 'assets/chapter1/room3/2-2.png', action: () => goToSceneInstant(44) },
  44: { image: 'assets/chapter1/room3/2-3.png', action: () => goToSceneInstant(45) },
  45: {
    image: 'assets/chapter1/room3/2-4.png',
    action: () => {
      collectMemory('room3', 'memory2'); // 第二个记忆：Game Enthusiast
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
      collectMemory('room3', 'memory3'); // 第三个记忆：Sleep No More
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
let userManuallyStoppedMusic = false; // 添加用户手动关闭音乐的标志
let isChapter2Music = false; // 跟踪是否已经切换到第二章音乐
const musicControl = document.getElementById('music-control');
const musicIcon = document.getElementById('music-icon');
const musicControlDatavis = document.getElementById('music-control-datavis');
const musicIconDatavis = document.getElementById('music-icon-datavis');
const backgroundMusic = document.getElementById('background-music');

// 音乐淡出函数
function fadeOutMusic(duration = 2000) {
  if (!isMusicPlaying) return;
  
  const startVolume = backgroundMusic.volume;
  const steps = 20;
  const stepDuration = duration / steps;
  const volumeStep = startVolume / steps;
  
  const fadeInterval = setInterval(() => {
    if (backgroundMusic.volume > volumeStep) {
      backgroundMusic.volume -= volumeStep;
    } else {
      backgroundMusic.pause();
      backgroundMusic.volume = startVolume; // 恢复原始音量
      isMusicPlaying = false;
      musicIcon.src = 'assets/icons/music_off.png';
      musicIconDatavis.src = 'assets/icons/music_off.png';
      musicIcon.classList.remove('floating');
      musicIconDatavis.classList.remove('floating');
      clearInterval(fadeInterval);
    }
  }, stepDuration);
}

// 切换到第二章音乐
function switchToChapter2Music() {
  if (isChapter2Music) return; // 如果已经是第二章音乐，不重复切换
  
  // 切换到肖邦音乐
  backgroundMusic.src = 'assets/chopin-nocturne-op-9-no-2-relaxing-piano-music-345085.mp3';
  isChapter2Music = true;
  
  // 如果音乐正在播放，重新开始播放新音乐
  if (isMusicPlaying) {
    backgroundMusic.play().then(() => {
      console.log('第二章音乐播放成功');
      backgroundMusic.volume = 1.0; // 肖邦音乐正常音量
    }).catch(error => {
      console.log('第二章音乐播放失败:', error);
    });
  }
}

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
    const isPrologueOrCover = index === 2 || index === 3 || index === 51 || index === 52 || index === 53 || index === 54;
    const isSpecialScene = index === 60 || index === 61;
    
    // 特殊音乐处理
    if (index === 51) {
      // 场景51：音乐淡出
      fadeOutMusic(4000); // 4秒淡出
      musicControl.style.display = 'none';
      musicControlDatavis.style.display = 'none';
    } else if (index === 52) {
      // 场景52：切换到第二章音乐并开始播放
      switchToChapter2Music();
      if (!userManuallyStoppedMusic) {
        startMusic();
      }
      musicControl.style.display = 'none';
      musicControlDatavis.style.display = 'none';
    } else if (isPrologueOrCover || isSpecialScene) {
      // 在prologue、cover和特定页面隐藏音乐按钮
      musicControl.style.display = 'none';
      musicControlDatavis.style.display = 'none';
    } else {
      // 显示音乐控制按钮
      musicControl.style.display = 'block';
      musicControlDatavis.style.display = 'none'; // scene部分显示，datavis部分隐藏
      
      // 如果音乐还没开始播放且用户没有手动关闭，自动开始播放
      if (!isMusicPlaying && !userManuallyStoppedMusic) {
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
  
  // 如果是第二章音乐且还没有切换，先切换
  if (currentScene >= 52 && !isChapter2Music) {
    switchToChapter2Music();
  }
  
  backgroundMusic.play().then(() => {
    console.log('音乐播放成功');
    isMusicPlaying = true;
    userManuallyStoppedMusic = false; // 清除用户手动关闭标志
    
    // 设置音量：第一阶段音量较小，第二阶段音量正常
    if (isChapter2Music) {
      backgroundMusic.volume = 1.0; // 肖邦音乐正常音量
    } else {
      backgroundMusic.volume = 0.6; // Halloween音乐较小音量
    }
    
    musicIcon.src = 'assets/icons/music.png';
    musicIconDatavis.src = 'assets/icons/music.png';
    
    // 添加漂浮动画类
    musicIcon.classList.add('floating');
    musicIconDatavis.classList.add('floating');
  }).catch(error => {
    console.log('音乐播放失败:', error);
    // 尝试用户交互后播放
    document.addEventListener('click', function playMusicOnClick() {
      backgroundMusic.play().then(() => {
        console.log('用户交互后音乐播放成功');
        isMusicPlaying = true;
        userManuallyStoppedMusic = false; // 清除用户手动关闭标志
        
        // 设置音量：第一阶段音量较小，第二阶段音量正常
        if (isChapter2Music) {
          backgroundMusic.volume = 1.0; // 肖邦音乐正常音量
        } else {
          backgroundMusic.volume = 0.6; // Halloween音乐较小音量
        }
        
        musicIcon.src = 'assets/icons/music.png';
        musicIconDatavis.src = 'assets/icons/music.png';
        
        // 添加漂浮动画类
        musicIcon.classList.add('floating');
        musicIconDatavis.classList.add('floating');
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
  userManuallyStoppedMusic = true; // 设置用户手动关闭标志
  musicIcon.src = 'assets/icons/music_off.png';
  musicIconDatavis.src = 'assets/icons/music_off.png';
  
  // 移除漂浮动画类
  musicIcon.classList.remove('floating');
  musicIconDatavis.classList.remove('floating');
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
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isMusicPlaying = false;
    // 不设置userManuallyStoppedMusic，因为这是自动停止，不是用户手动关闭
    musicIcon.src = 'assets/icons/music_off.png';
    musicIconDatavis.src = 'assets/icons/music_off.png';
    
    // 移除漂浮动画类
    musicIcon.classList.remove('floating');
    musicIconDatavis.classList.remove('floating');
    
    musicControl.style.display = 'none';
    musicControlDatavis.style.display = 'none';
  }
}

goToScene(52); //测试用，正式应为1

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
  
  // 初始化音乐图标状态
  if (!isMusicPlaying) {
    musicIcon.classList.remove('floating');
    musicIconDatavis.classList.remove('floating');
  }
  
  // 初始化用户手动关闭标志
  userManuallyStoppedMusic = false;
  
  // 初始化第二章音乐标志
  isChapter2Music = false;
  
  // 设置初始音量
  backgroundMusic.volume = 0.6; // 第一阶段较小音量
});


