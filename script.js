// script.js

const memoryCollected = {
  room1: false,
  room2: false,
  room3: false
};

// Modified to track specific memories collected in each room
const roomMemories = {
  room1: new Set(), // Use Set to store collected memory IDs, avoid duplicates
  room2: new Set(),
  room3: new Set()
};

// Keep memoryCount for compatibility, but no longer used
const memoryCount = {
  room1: 0,
  room2: 0,
  room3: 0
};

// Universal memory collection function
function collectMemory(roomName, memoryId) {
  roomMemories[roomName].add(memoryId);
  
  // If 3 different memories are collected, mark room as complete
  if (roomMemories[roomName].size >= 3) {
    memoryCollected[roomName] = true;
  }
  
  // Debug info: show current collection status
  console.log(`${roomName} collected memories:`, Array.from(roomMemories[roomName]));
  console.log(`${roomName} completion status:`, memoryCollected[roomName]);
}

// Function to get memory collection status (for debugging)
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

// Expose status function to global scope for debugging
window.getMemoryStatus = getMemoryStatus;

// Expose music control functions to global scope
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
      collectMemory('room1', 'memory1'); // First memory: Graduation Photo
      goToScene(5);
    }
  },

  11: { image: 'assets/chapter1/room1/2-1.png', action: () => goToSceneInstant(12) },
  12: { image: 'assets/chapter1/room1/2-2.png', action: () => goToSceneInstant(13) },
  13: { image: 'assets/chapter1/room1/2-3.png', action: () => goToSceneInstant(14) },
  14: {
    image: 'assets/chapter1/room1/2-4.png',
    action: () => {
      collectMemory('room1', 'memory2'); // Second memory: Shakespeare's Sonnets
      goToScene(6);
    }
  },

  15: { image: 'assets/chapter1/room1/3-1.png', action: () => goToSceneInstant(16) },
  16: { image: 'assets/chapter1/room1/3-2.png', action: () => goToSceneInstant(17) },
  17: { image: 'assets/chapter1/room1/3-3.png', action: () => goToSceneInstant(18) },
  18: {
    image: 'assets/chapter1/room1/3-4.png',
    action: () => {
      collectMemory('room1', 'memory3'); // Third memory: Flawless
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
      collectMemory('room2', 'memory1'); // First memory: The Starry Night
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
      collectMemory('room2', 'memory2'); // Second memory: Termination
      goToScene(20);
    }
  },

  31: { image: 'assets/chapter1/room2/3-1.png', action: () => goToSceneInstant(32) },
  32: { image: 'assets/chapter1/room2/3-2.png', action: () => goToSceneInstant(33) },
  33: { image: 'assets/chapter1/room2/3-3.png', action: () => goToSceneInstant(34) },
  34: {
    image: 'assets/chapter1/room2/3-4.png',
    action: () => {
      collectMemory('room2', 'memory3'); // Third memory: The Mirror
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
      collectMemory('room3', 'memory1'); // First memory: An Outstanding Programmer
      goToScene(35);
    }
  },

  42: { image: 'assets/chapter1/room3/2-1.png', action: () => goToSceneInstant(43) },
  43: { image: 'assets/chapter1/room3/2-2.png', action: () => goToSceneInstant(44) },
  44: { image: 'assets/chapter1/room3/2-3.png', action: () => goToSceneInstant(45) },
  45: {
    image: 'assets/chapter1/room3/2-4.png',
    action: () => {
      collectMemory('room3', 'memory2'); // Second memory: Game Enthusiast
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
      collectMemory('room3', 'memory3'); // Third memory: Sleep No More
      goToScene(36);
    }
  },

  51: { image: 'assets/chapter2/prologue.png', action: () => goToScene(52) },
  // Jump to data visualization page
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
        }, 100);
      }, 800); // Unify with other scene transition timing
    }
  },
  
  // Chapter 3 scenes
  53: { image: 'assets/chapter3/cover.png', action: () => goToScene(54) },
  54: { image: 'assets/chapter3/prologue.png', action: () => goToScene(55) },
  55: { 
    image: 'assets/chapter3/1.png', 
    action: () => {
      // Automatically jump to next scene after 3.5 seconds
      setTimeout(() => goToScene(56), 3500);
    },
    autoPlay: true
  },
  56: { 
    image: 'assets/chapter3/2.png', 
    action: () => {
      // Automatically jump to next scene after 3.5 seconds
      setTimeout(() => goToScene(57), 3500);
    },
    autoPlay: true
  },
  57: { 
    image: 'assets/chapter3/3.png', 
    action: () => {
      // Automatically jump to next scene after 3.5 seconds
      setTimeout(() => goToScene(58), 3500);
    },
    autoPlay: true
  },
  58: { 
    image: 'assets/chapter3/4.png', 
    action: () => {
      // Automatically jump to next scene after 3.5 seconds
      setTimeout(() => goToScene(59), 3500);
    },
    autoPlay: true
  },
  59: { 
    image: 'assets/chapter3/5.png', 
    action: () => {
      // Automatically jump to next scene after 3.5 seconds
      setTimeout(() => goToScene(60), 3500);
    },
    autoPlay: true
  },
  60: { 
    image: 'assets/chapter3/6.png', 
    action: () => {
      // Automatically jump to next scene after 3.5 seconds
      setTimeout(() => goToScene(61), 3500);
    },
    autoPlay: true
  },
  61: { 
    image: 'assets/chapter3/7.png', 
    action: () => {} // Last page, no action on click
  }
};

let currentScene = 1;
const sceneImage = document.getElementById('scene-image');
const hotspotContainer = document.getElementById('hotspot-container');

// Music control variables
let isMusicPlaying = false;
let userManuallyStoppedMusic = false; // Add flag for user manually stopping music
let isChapter2Music = false; // Track if already switched to chapter 2 music
const musicControl = document.getElementById('music-control');
const musicIcon = document.getElementById('music-icon');
const musicControlDatavis = document.getElementById('music-control-datavis');
const musicIconDatavis = document.getElementById('music-icon-datavis');
const backgroundMusic = document.getElementById('background-music');

// Music fade out function
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
      backgroundMusic.volume = startVolume; // Restore original volume
      isMusicPlaying = false;
      musicIcon.src = 'assets/icons/music_off.png';
      musicIconDatavis.src = 'assets/icons/music_off.png';
      musicIcon.classList.remove('floating');
      musicIconDatavis.classList.remove('floating');
      clearInterval(fadeInterval);
    }
  }, stepDuration);
}

// Switch to chapter 2 music
function switchToChapter2Music() {
  if (isChapter2Music) return; // If already chapter 2 music, don't switch again
  
  // Switch to Chopin music
  backgroundMusic.src = 'assets/chopin-nocturne-op-9-no-2-relaxing-piano-music-345085.mp3';
  isChapter2Music = true;
  
  // If music is playing, restart with new music
  if (isMusicPlaying) {
    backgroundMusic.play().then(() => {
      console.log('Chapter 2 music playback successful');
      backgroundMusic.volume = 1.0; // Chopin music normal volume
    }).catch(error => {
      console.log('Chapter 2 music playback failed:', error);
    });
  }
}

function goToScene(index) {
  const overlay = document.getElementById('fade-overlay');
  overlay.style.opacity = 1; // Start fading to black

  setTimeout(() => {
    currentScene = index;
    sceneImage.src = scenes[index].image;

    updateHotspots();
    renderMarks(); 
    
    // Handle custom settings
    if (scenes[index].customSetup) {
      scenes[index].customSetup();
    } else {
      // If not scene 1, hide hotel image and blinking text
      const hotelContainer = document.getElementById('hotel-container');
      const blinkingText = document.getElementById('blinking-text');
      const sceneContainer = document.getElementById('scene-container');
      
      if (hotelContainer) hotelContainer.style.display = 'none';
      if (blinkingText) blinkingText.style.display = 'none';
      if (sceneContainer) sceneContainer.style.backgroundColor = '';
    }
    
    // Music control logic
    // Don't show music button on prologue, cover and specific pages
    const isPrologueOrCover = index === 2 || index === 3 || index === 51 || index === 52 || index === 53 || index === 54;
    const isSpecialScene = index === 60 || index === 61;
    
    // Special music handling
    if (index === 51) {
      // Scene 51: music fade out
      fadeOutMusic(4000); // 4 second fade out
      musicControl.style.display = 'none';
      musicControlDatavis.style.display = 'none';
    } else if (index === 52) {
      // Scene 52: switch to chapter 2 music and start playing
      switchToChapter2Music();
      if (!userManuallyStoppedMusic) {
        startMusic();
      }
      musicControl.style.display = 'none';
      musicControlDatavis.style.display = 'none';
    } else if (isPrologueOrCover || isSpecialScene) {
      // Hide music button on prologue, cover and specific pages
      musicControl.style.display = 'none';
      musicControlDatavis.style.display = 'none';
    } else {
      // Show music control button
      musicControl.style.display = 'block';
      musicControlDatavis.style.display = 'none'; // Show in scene section, hide in datavis section
      
      // If music hasn't started and user hasn't manually stopped, auto-start
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
      
      // If auto-play scene, start auto-play after fade-in completes
      if (scenes[index].autoPlay && scenes[index].action) {
        scenes[index].action();
      }
    }, 100);
    
    // Handle last page music stop
    handleLastScene();
  }, 800);
}

// Hotel scene setup function
function setupHotelScene() {
  // Set black background
  const sceneContainer = document.getElementById('scene-container');
  sceneContainer.style.backgroundColor = 'black';
  
  // Show hotel image and blinking text
  const hotelContainer = document.getElementById('hotel-container');
  const blinkingText = document.getElementById('blinking-text');
  
  hotelContainer.style.display = 'block';
  blinkingText.style.display = 'block';
  
  // Set hotel image mouse hover effect
  const hotelImage = document.getElementById('hotel-image');
  
  // Remove previous event listeners (if exist)
  hotelImage.removeEventListener('mouseenter', hotelImage._mouseenterHandler);
  hotelImage.removeEventListener('mouseleave', hotelImage._mouseleaveHandler);
  hotelContainer.removeEventListener('click', hotelContainer._clickHandler);
  
  // Create event handler function
  hotelImage._mouseenterHandler = function() {
    this.src = 'assets/chapter1/hotel-light.png';
  };
  
  hotelImage._mouseleaveHandler = function() {
    this.src = 'assets/chapter1/hotel.png';
  };
  
  hotelContainer._clickHandler = function(e) {
    e.stopPropagation(); // Prevent event bubbling
    goToScene(2);
  };
  
  // Add new event listeners
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

// Click entire screen to switch early scenes (1~3)
window.addEventListener('click', () => {
  // ✅ If already in data visualization stage, no longer handle click navigation
  const datavisVisible = document.getElementById('datavis-container').style.display === 'block';
  if (datavisVisible) return; // ⛔ Prevent click from triggering any navigation
  
  // If in auto-play scenes (55-61), click is invalid
  if (currentScene >= 55 && currentScene <= 61) {
    return;
  }
  
  const scene = scenes[currentScene];
  if (scene && scene.action && !scene.hotspots) {
    scene.action();
  }

  // If in scene 4 and all three memories are completed, jump after click
  if (
    currentScene === 4 &&
    memoryCollected.room1 &&
    memoryCollected.room2 &&
    memoryCollected.room3
  ) {
    goToScene(51); // Go to next chapter
    return;
  }

  // Hide hint image
  hintImage.style.display = 'none';
});

// Music control functions
function startMusic() {
  console.log('Trying to play music...');
  
  // If it's chapter 2 music and hasn't switched yet, switch first
  if (currentScene >= 52 && !isChapter2Music) {
    switchToChapter2Music();
  }
  
  backgroundMusic.play().then(() => {
    console.log('Music playback successful');
    isMusicPlaying = true;
    userManuallyStoppedMusic = false; // Clear user manual stop flag
    
    // Set volume: first stage smaller volume, second stage normal volume
    if (isChapter2Music) {
      backgroundMusic.volume = 1.0; // Chopin music normal volume
    } else {
      backgroundMusic.volume = 0.6; // Halloween music smaller volume
    }
    
    musicIcon.src = 'assets/icons/music.png';
    musicIconDatavis.src = 'assets/icons/music.png';
    
    // Add floating animation class
    musicIcon.classList.add('floating');
    musicIconDatavis.classList.add('floating');
  }).catch(error => {
    console.log('Music playback failed:', error);
    // Try to play after user interaction
    document.addEventListener('click', function playMusicOnClick() {
              backgroundMusic.play().then(() => {
          console.log('Music playback successful after user interaction');
          isMusicPlaying = true;
          userManuallyStoppedMusic = false; // Clear user manual stop flag
          
          // Set volume: first stage smaller volume, second stage normal volume
          if (isChapter2Music) {
            backgroundMusic.volume = 1.0; // Chopin music normal volume
          } else {
            backgroundMusic.volume = 0.6; // Halloween music smaller volume
          }
          
          musicIcon.src = 'assets/icons/music.png';
          musicIconDatavis.src = 'assets/icons/music.png';
          
          // Add floating animation class
        musicIcon.classList.add('floating');
        musicIconDatavis.classList.add('floating');
      }).catch(err => {
        console.log('Music playback still failed after user interaction:', err);
      });
      document.removeEventListener('click', playMusicOnClick);
    }, { once: true });
  });
}

function stopMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  isMusicPlaying = false;
  userManuallyStoppedMusic = true; // Set user manual stop flag
  musicIcon.src = 'assets/icons/music_off.png';
  musicIconDatavis.src = 'assets/icons/music_off.png';
  
  // Remove floating animation class
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

// Music button click event
musicControl.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent event bubbling, avoid triggering screen click event
  toggleMusic();
});

// Datavis section music button click event
musicControlDatavis.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent event bubbling, avoid triggering screen click event
  toggleMusic();
});

// Handle last page music stop
function handleLastScene() {
  if (currentScene === 62) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isMusicPlaying = false;
    // Don't set userManuallyStoppedMusic, because this is auto-stop, not user manual stop
    musicIcon.src = 'assets/icons/music_off.png';
    musicIconDatavis.src = 'assets/icons/music_off.png';
    
    // Remove floating animation class
    musicIcon.classList.remove('floating');
    musicIconDatavis.classList.remove('floating');
    
    musicControl.style.display = 'none';
    musicControlDatavis.style.display = 'none';
  }
}

//goToScene(52); // For testing, should be 1 in production

// Chapter 3 startup function
window.startChapter3 = function() {
  const overlay = document.getElementById("fade-overlay");
  
  // First fade to black
  overlay.style.opacity = 1;
  
  // Wait for fade to black to complete, then switch scene
  setTimeout(() => {
    document.getElementById('datavis-container').style.display = 'none';
    document.getElementById('scene-container').style.display = 'block';
    currentScene = 53;
    
    // Set new scene image
    sceneImage.src = scenes[53].image;
    updateHotspots();
    renderMarks();
    
    // Fade in new scene
    setTimeout(() => {
      overlay.style.opacity = 0;
    }, 100);
  }, 800); // Unify with other scene transition timing
};

// Initialize after page load completes
document.addEventListener('DOMContentLoaded', function() {
  // Initialize scene 1
  if (currentScene === 1) {
    setupHotelScene();
  }
  
  // Initialize music icon state
  if (!isMusicPlaying) {
    musicIcon.classList.remove('floating');
    musicIconDatavis.classList.remove('floating');
  }
  
  // Initialize user manual stop flag
  userManuallyStoppedMusic = false;
  
  // Initialize chapter 2 music flag
  isChapter2Music = false;
  
  // Set initial volume
  backgroundMusic.volume = 0.6; // First stage smaller volume
});


