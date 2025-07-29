// human_ai_relation.js

if (!window.chapter2HumanAI) {
  window.chapter2HumanAI = {};
}

// 当前幻灯片编号
let currentHASSlide = 0;

// 幻灯片路径列表（根据你的文件结构调整）
const hasSlides = [
  "assets/chapter2/prologue2.png",
  "assets/chapter2/HAS.png",
  "assets/chapter2/prologue3.png"
];

function showHASSlide(index) {
  const container = document.getElementById("datavis-container");
  const bg = document.getElementById("datavis-bg");
  const title = document.getElementById("datavis-title");
  const chartArea = document.getElementById("datavis-chart-area");
  const tabs = document.getElementById("datavis-tabs");
  const genderTabs = document.getElementById("gender-tabs");

  container.style.opacity = 0;
  setTimeout(() => {
    bg.src = hasSlides[index];
    title.textContent = ""; // 清空标题
    chartArea.innerHTML = ""; // 清空图表区域
    tabs.style.display = "none";
    genderTabs.style.display = "none";

    container.style.display = "block";
    setTimeout(() => {
      container.style.opacity = 1;
    }, 50);
  }, 300);
}

function initHASFlow() {
  const container = document.getElementById("datavis-container");
  const rightArrow = document.querySelector(".arrow-right");

  showHASSlide(currentHASSlide);

  function advanceSlide() {
    currentHASSlide++;

    if (currentHASSlide < hasSlides.length) {
      showHASSlide(currentHASSlide);
    } else {
      // 返回章节入口房间
      container.style.opacity = 0;
      setTimeout(() => {
        container.style.display = "none";
        document.getElementById("scene-container").style.display = "block";
        document.getElementById("scene-image").src = "assets/chapter2/room.png"; // 你的房间图路径
      }, 400);
    }
  }

  container.addEventListener("click", advanceSlide);
  if (rightArrow) {
    rightArrow.addEventListener("click", () => {
      initHASFlow();
    }, { once: true });
  }
}

window.chapter2HumanAI.init = initHASFlow;
