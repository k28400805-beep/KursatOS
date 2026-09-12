/* =========================================================
   KÜRSATOS — SCRIPT.JS
========================================================= */

"use strict";

/* =========================================================
   STATE
========================================================= */

const defaultState = {
    xp: 0,
    level: 1,

    kingdom: {
        gold: 100,
        wood: 100,
        army: 10,
        level: 1
    },

    achievements: [],

    stats: {
        gamesPlayed: 0,
        clicks: 0,
        commands: 0,
        mysterySolved: false,
        dontPress: false
    }
};

let state = loadState();

let activeApp = null;
let zIndex = 30;

let clickGame = {
    running: false,
    clicks: 0,
    time: 10,
    timer: null
};

let reflexGame = {
    running: false,
    ready: false,
    startTime: 0,
    timeout: null
};

let numberGame = {
    number: 0,
    attempts: 0
};


/* =========================================================
   APP INFORMATION
========================================================= */

const apps = {
    games: {
        name: "Oyunlar",
        icon: "🎮"
    },

    quiz: {
        name: "Test Merkezi",
        icon: "🧠"
    },

    kingdom: {
        name: "Kuzeyyaka",
        icon: "👑"
    },

    mystery: {
        name: "Gizem Dosyaları",
        icon: "🕵️"
    },

    weird: {
        name: "Garip İnternet",
        icon: "👁️"
    },

    terminal: {
        name: "Terminal",
        icon: "⌨️"
    },

    files: {
        name: "Dosyalarım",
        icon: "📁"
    },

    achievements: {
        name: "Başarımlar",
        icon: "🏆"
    }
};


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadState() {
    try {
        const saved = localStorage.getItem("KursatOS_State");

        if (!saved) {
            return structuredClone(defaultState);
        }

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(defaultState),
            ...parsed,
            kingdom: {
                ...defaultState.kingdom,
                ...(parsed.kingdom || {})
            },
            stats: {
                ...defaultState.stats,
                ...(parsed.stats || {})
            }
        };

    } catch (error) {
        console.warn("KürşatOS kayıt okunamadı:", error);
        return structuredClone(defaultState);
    }
}


function saveState() {
    localStorage.setItem(
        "KursatOS_State",
        JSON.stringify(state)
    );
}


/* =========================================================
   BOOT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    startBoot();

    updateXP();

    updateKingdom();

    renderAchievements();

    updateClock();

    setInterval(updateClock, 1000);

    setupTerminal();

    setupKeyboard();

    setupWindowFocus();

});


function startBoot() {

    const progress = document.getElementById("bootProgress");
    const bootScreen = document.getElementById("bootScreen");

    if (!progress || !bootScreen) return;

    let value = 0;

    const interval = setInterval(() => {

        value += Math.floor(Math.random() * 12) + 5;

        if (value >= 100) {
            value = 100;
            clearInterval(interval);

            setTimeout(() => {
                bootScreen.classList.add("hidden");

                notify(
                    "KürşatOS hazır",
                    "Sistem başarıyla başlatıldı.",
                    "🖥️"
                );

            }, 500);
        }

        progress.style.width = `${value}%`;

    }, 120);

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const clock = document.getElementById("taskbarTime");

    if (!clock) return;

    const now = new Date();

    clock.textContent =
        now.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit"
        });
}


/* =========================================================
   APP WINDOWS
========================================================= */

function openApp(appName) {

    const windowElement =
        document.getElementById(`window-${appName}`);

    if (!windowElement) return;

    closeStartMenu();

    windowElement.classList.add("active");
    windowElement.classList.remove("minimized");

    bringToFront(windowElement);

    activeApp = appName;

    updateTaskbar();

    if (appName === "quiz") {
        loadQuiz();
    }

    if (appName === "achievements") {
        renderAchievements();
    }

    if (appName === "kingdom") {
        updateKingdom();
    }

    if (appName === "terminal") {
        setTimeout(() => {
            document.getElementById("terminalInput")?.focus();
        }, 100);
    }
}


function closeApp(appName) {

    const windowElement =
        document.getElementById(`window-${appName}`);

    if (!windowElement) return;

    windowElement.classList.remove(
        "active",
        "maximized",
        "minimized"
    );

    if (activeApp === appName) {
        activeApp = null;
    }

    updateTaskbar();
}


function minimizeApp(appName) {

    const windowElement =
        document.getElementById(`window-${appName}`);

    if (!windowElement) return;

    windowElement.classList.remove("active");
    windowElement.classList.add("minimized");

    updateTaskbar();
}


function maximizeApp(appName) {

    const windowElement =
        document.getElementById(`window-${appName}`);

    if (!windowElement) return;

    windowElement.classList.toggle("maximized");

    bringToFront(windowElement);
}


function bringToFront(windowElement) {

    zIndex++;

    windowElement.style.zIndex = zIndex;

    document
        .querySelectorAll(".app-window")
        .forEach(window => {
            window.classList.remove("focused");
        });

    windowElement.classList.add("focused");
}


function setupWindowFocus() {

    document
        .querySelectorAll(".app-window")
        .forEach(windowElement => {

            windowElement.addEventListener("mousedown", () => {
                bringToFront(windowElement);
            });

        });
}


/* =========================================================
   TASKBAR
========================================================= */

function updateTaskbar() {

    const taskbar =
        document.getElementById("taskbarApps");

    if (!taskbar) return;

    taskbar.innerHTML = "";

    Object.keys(apps).forEach(appName => {

        const windowElement =
            document.getElementById(`window-${appName}`);

        if (
            windowElement &&
            (
                windowElement.classList.contains("active") ||
                windowElement.classList.contains("minimized")
            )
        ) {

            const button =
                document.createElement("button");

            button.className = "taskbar-app";

            button.title = apps[appName].name;

            button.textContent = apps[appName].icon;

            button.onclick = () => {

                if (
                    windowElement.classList.contains("active")
                ) {
                    minimizeApp(appName);
                } else {
                    openApp(appName);
                }

            };

            taskbar.appendChild(button);
        }

    });
}


/* =========================================================
   START MENU
========================================================= */

function toggleStartMenu() {

    const menu =
        document.getElementById("startMenu");

    if (!menu) return;

    menu.classList.toggle("open");
}


function closeStartMenu() {

    document
        .getElementById("startMenu")
        ?.classList.remove("open");
}


function searchApps() {

    const input =
        document.getElementById("appSearch");

    const query =
        input.value.toLowerCase().trim();

    document
        .querySelectorAll("#startApps button")
        .forEach(button => {

            button.style.display =
                button.textContent
                    .toLowerCase()
                    .includes(query)
                    ? ""
                    : "none";

        });
}


/* =========================================================
   XP SYSTEM
========================================================= */

function addXP(amount, reason = "") {

    if (!Number.isFinite(amount)) return;

    state.xp += amount;

    let leveledUp = false;

    while (state.xp >= getXPNeeded()) {

        state.xp -= getXPNeeded();

        state.level++;

        leveledUp = true;
    }

    saveState();

    updateXP();

    if (reason) {
        notify(
            `+${amount} XP`,
            reason,
            "⭐"
        );
    }

    if (leveledUp) {

        notify(
            "SEVİYE ATLADIN!",
            `Artık Seviye ${state.level} oldun.`,
            "🚀"
        );

        unlockAchievement(
            "level_" + state.level
        );
    }
}


function getXPNeeded() {

    return 100 + ((state.level - 1) * 50);
}


function updateXP() {

    const needed = getXPNeeded();

    const progress =
        Math.min(
            100,
            (state.xp / needed) * 100
        );

    const progressElement =
        document.getElementById("xpProgress");

    const textElement =
        document.getElementById("xpText");

    const levelText =
        document.getElementById("levelText");

    if (progressElement) {
        progressElement.style.width =
            `${progress}%`;
    }

    if (textElement) {
        textElement.textContent =
            `${state.xp} / ${needed}`;
    }

    if (levelText) {
        levelText.textContent =
            `Seviye ${state.level}`;
    }
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

let notificationTimer = null;

function notify(title, text, icon = "🔔") {

    const notification =
        document.getElementById("notification");

    if (!notification) return;

    document.getElementById(
        "notificationTitle"
    ).textContent = title;

    document.getElementById(
        "notificationText"
    ).textContent = text;

    document.getElementById(
        "notificationIcon"
    ).textContent = icon;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer =
        setTimeout(() => {
            notification.classList.remove("show");
        }, 3500);
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const achievementDefinitions = {

    first_game: {
        icon: "🎮",
        title: "Oyuncu",
        description: "İlk oyununu oyna."
    },

    click_50: {
        icon: "⚡",
        title: "Hızlı Parmaklar",
        description: "Toplam 50 kez tıkla."
    },

    click_100: {
        icon: "🔥",
        title: "Tıklama Makinesi",
        description: "Toplam 100 kez tıkla."
    },

    mystery: {
        icon: "🕵️",
        title: "Dedektif",
        description: "Gizli dosyayı çöz."
    },

    kingdom: {
        icon: "👑",
        title: "Hükümdar",
        description: "Kuzeyyaka Krallığını geliştir."
    },

    terminal: {
        icon: "⌨️",
        title: "Hacker Değil Ama...",
        description: "Terminali kullan."
    },

    dont_press: {
        icon: "⚠️",
        title: "Meraklı",
        description: "Basmaman gereken şeye bas."
    },

    level_2: {
        icon: "⭐",
        title: "Seviye 2",
        description: "Seviye 2'ye ulaş."
    },

    level_5: {
        icon: "🚀",
        title: "Usta Kullanıcı",
        description: "Seviye 5'e ulaş."
    }

};


function unlockAchievement(id) {

    if (state.achievements.includes(id)) {
        return;
    }

    if (!achievementDefinitions[id]) {
        return;
    }

    state.achievements.push(id);

    saveState();

    const achievement =
        achievementDefinitions[id];

    notify(
        "Başarım açıldı!",
        achievement.title,
        achievement.icon
    );

    renderAchievements();
}


function renderAchievements() {

    const container =
        document.getElementById("achievementList");

    if (!container) return;

    container.innerHTML = "";

    Object.entries(
        achievementDefinitions
    ).forEach(([id, achievement]) => {

        const unlocked =
            state.achievements.includes(id);

        const element =
            document.createElement("div");

        element.className =
            `achievement ${unlocked ? "" : "locked"}`;

        element.innerHTML = `
            <div class="achievement-icon">
                ${achievement.icon}
            </div>

            <div>
                <strong>
                    ${achievement.title}
                </strong>

                <small>
                    ${achievement.description}
                </small>
            </div>
        `;

        container.appendChild(element);
    });
}


/* =========================================================
   GAME SYSTEM
========================================================= */

function startGame(type) {

    openApp("games");

    state.stats.gamesPlayed++;

    saveState();

    unlockAchievement("first_game");

    const container =
        document.getElementById("gameContainer");

    if (!container) return;

    if (type === "click") {
        startClickGame();
    }

    if (type === "reflex") {
        startReflexGame();
    }

    if (type === "number") {
        startNumberGame();
    }
}


/* =========================================================
   CLICK GAME
========================================================= */

function startClickGame() {

    const container =
        document.getElementById("gameContainer");

    clickGame.running = false;

    clearInterval(clickGame.timer);

    clickGame.clicks = 0;
    clickGame.time = 10;

    container.innerHTML = `
        <div class="game-play">

            <h3>⚡ Tıklama Yarışı</h3>

            <div class="game-score">
                <span id="clickTime">10</span>s
                •
                <span id="clickScore">0</span> tıklama
            </div>

            <button id="clickButton">
                BAŞLA
            </button>

        </div>
    `;

    const button =
        document.getElementById("clickButton");

    button.onclick = () => {

        if (!clickGame.running) {

            clickGame.running = true;

            button.textContent = "TIKLA!";

            clickGame.timer =
                setInterval(() => {

                    clickGame.time--;

                    document.getElementById(
                        "clickTime"
                    ).textContent =
                        clickGame.time;

                    if (clickGame.time <= 0) {
                        finishClickGame();
                    }

                }, 1000);

            return;
        }

        clickGame.clicks++;

        state.stats.clicks++;

        document.getElementById(
            "clickScore"
        ).textContent =
            clickGame.clicks;

        if (state.stats.clicks >= 50) {
            unlockAchievement("click_50");
        }

        if (state.stats.clicks >= 100) {
            unlockAchievement("click_100");
        }
    };
}


function finishClickGame() {

    clearInterval(clickGame.timer);

    clickGame.running = false;

    const score =
        clickGame.clicks;

    const xp =
        Math.min(
            50,
            10 + Math.floor(score / 2)
        );

    addXP(
        xp,
        `${score} tıklama yaptın!`
    );

    document.getElementById(
        "clickButton"
    ).textContent =
        "Tekrar Oyna";

    document.getElementById(
        "clickButton"
    ).onclick =
        () => startClickGame();

    notify(
        "Oyun bitti",
        `${score} tıklama yaptın.`,
        "⚡"
    );
}


/* =========================================================
   REFLEX GAME
========================================================= */

function startReflexGame() {

    const container =
        document.getElementById("gameContainer");

    clearTimeout(reflexGame.timeout);

    reflexGame.running = true;
    reflexGame.ready = false;

    container.innerHTML = `
        <div class="game-play">

            <h3>🎯 Refleks Testi</h3>

            <p class="muted">
                Yeşil olduğunda hemen tıkla!
            </p>

            <div
                id="reflexTarget"
                class="reflex-target"
            >
                BEKLE...
            </div>

            <div id="reflexResult">
                Hazır ol.
            </div>

        </div>
    `;

    const target =
        document.getElementById("reflexTarget");

    const delay =
        1500 + Math.random() * 3500;

    reflexGame.timeout =
        setTimeout(() => {

            if (!reflexGame.running) return;

            reflexGame.ready = true;

            reflexGame.startTime =
                performance.now();

            target.classList.add("ready");

            target.textContent =
                "TIKLA!";

        }, delay);


    target.onclick = () => {

        if (!reflexGame.running) {
            return;
        }

        if (!reflexGame.ready) {

            clearTimeout(reflexGame.timeout);

            reflexGame.running = false;

            target.textContent =
                "ÇOK ERKEN!";

            document.getElementById(
                "reflexResult"
            ).textContent =
                "Biraz daha sabırlı ol 😄";

            return;
        }

        const reaction =
            Math.round(
                performance.now() -
                reflexGame.startTime
            );

        reflexGame.running = false;

        target.textContent =
            `${reaction} ms`;

        document.getElementById(
            "reflexResult"
        ).textContent =
            getReactionMessage(reaction);

        let xp = 10;

        if (reaction < 300) xp = 40;
        else if (reaction < 450) xp = 30;
        else if (reaction < 600) xp = 20;

        addXP(
            xp,
            `Refleksin ${reaction} ms!`
        );
    };
}


function getReactionMessage(ms) {

    if (ms < 300) {
        return "🔥 İnanılmaz refleks!";
    }

    if (ms < 450) {
        return "⚡ Çok iyi!";
    }

    if (ms < 600) {
        return "👍 Fena değil!";
    }

    return "🐢 Biraz yavaş kaldın.";
}


/* =========================================================
   NUMBER GAME
========================================================= */

function startNumberGame() {

    const container =
        document.getElementById("gameContainer");

    numberGame.number =
        Math.floor(
            Math.random() * 100
        ) + 1;

    numberGame.attempts = 0;

    container.innerHTML = `
        <div class="game-play">

            <h3>🔢 Sayı Tahmini</h3>

            <p class="muted">
                1 ile 100 arasında bir sayı tuttum.
            </p>

            <div class="game-score">
                Deneme:
                <span id="numberAttempts">0</span>
            </div>

            <input
                id="numberInput"
                class="number-input"
                type="number"
                min="1"
                max="100"
                placeholder="1 - 100"
            >

            <br>

            <button id="numberButton">
                Tahmin Et
            </button>

            <div id="numberResult">
                İyi şanslar!
            </div>

        </div>
    `;

    const input =
        document.getElementById("numberInput");

    const button =
        document.getElementById("numberButton");

    button.onclick =
        checkNumberGuess;

    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                checkNumberGuess();
            }

        }
    );

    input.focus();
}


function checkNumberGuess() {

    const input =
        document.getElementById("numberInput");

    const result =
        document.getElementById("numberResult");

    const value =
        Number(input.value);

    if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > 100
    ) {

        result.textContent =
            "1 ile 100 arasında sayı gir.";

        return;
    }

    numberGame.attempts++;

    document.getElementById(
        "numberAttempts"
    ).textContent =
        numberGame.attempts;

    if (value === numberGame.number) {

        const xp =
            Math.max(
                10,
                50 - (
                    numberGame.attempts * 5
                )
            );

        result.innerHTML =
            `<span class="success-text">
                🎉 Doğru! Sayı ${value} idi.
            </span>`;

        addXP(
            xp,
            `${numberGame.attempts} denemede bildin!`
        );

        document.getElementById(
            "numberButton"
        ).textContent =
            "Yeni Oyun";

        document.getElementById(
            "numberButton"
        ).onclick =
            startNumberGame;

        return;
    }

    if (value < numberGame.number) {
        result.textContent =
            "📈 Daha büyük bir sayı dene.";
    } else {
        result.textContent =
            "📉 Daha küçük bir sayı dene.";
    }
}


/* =========================================================
   QUIZ
========================================================= */

const quizQuestions = [
    {
        question: "Türkiye'nin başkenti neresidir?",
        answers: [
            "İstanbul",
            "Ankara",
            "Bursa",
            "İzmir"
        ],
        correct: 1
    },

    {
        question: "HTML ne için kullanılır?",
        answers: [
            "Web sayfasının yapısı",
            "Sadece oyun yapmak",
            "Virüs temizlemek",
            "İşletim sistemi kurmak"
        ],
        correct: 0
    },

    {
        question: "JavaScript genellikle ne sağlar?",
        answers: [
            "Web sitesine etkileşim",
            "Bilgisayarın ekranını büyütme",
            "İnternet bağlantısı",
            "RAM artırma"
        ],
        correct: 0
    },

    {
        question: "2 + 2 kaçtır?",
        answers: [
            "3",
            "4",
            "5",
            "22"
        ],
        correct: 1
    },

    {
        question: "CSS'in temel görevi nedir?",
        answers: [
            "Tasarım ve görünüm",
            "Dosya silmek",
            "İnternet sağlamak",
            "Bilgisayarı kapatmak"
        ],
        correct: 0
    }
];

let quizIndex = 0;
let quizScore = 0;


function loadQuiz() {

    quizIndex = 0;
    quizScore = 0;

    renderQuizQuestion();
}


function renderQuizQuestion() {

    const container =
        document.getElementById("quizContainer");

    if (!container) return;

    if (
        quizIndex >= quizQuestions.length
    ) {
        finishQuiz();
        return;
    }

    const question =
        quizQuestions[quizIndex];

    container.innerHTML = `

        <div class="quiz-question">

            <div class="muted">
                Soru ${quizIndex + 1}
                /
                ${quizQuestions.length}
            </div>

            <h3 style="margin: 15px 0;">
                ${question.question}
            </h3>

            <div class="quiz-answers">

                ${question.answers
                    .map((answer, index) => `
                        <button
                            onclick="answerQuiz(${index})"
                            style="
                                display:block;
                                width:100%;
                                padding:12px;
                                margin:8px 0;
                                text-align:left;
                                border-radius:10px;
                                background:rgba(255,255,255,.06);
                                border:1px solid rgba(255,255,255,.1);
                                color:white;
                                cursor:pointer;
                            "
                        >
                            ${String.fromCharCode(65 + index)})
                            ${answer}
                        </button>
                    `)
                    .join("")}

            </div>

        </div>
    `;
}


function answerQuiz(answerIndex) {

    const question =
        quizQuestions[quizIndex];

    if (
        answerIndex === question.correct
    ) {
        quizScore++;
    }

    quizIndex++;

    renderQuizQuestion();
}


function finishQuiz() {

    const container =
        document.getElementById("quizContainer");

    const percentage =
        Math.round(
            (quizScore / quizQuestions.length) *
            100
        );

    let xp =
        quizScore * 10;

    container.innerHTML = `

        <div style="text-align:center;padding:30px;">

            <div style="font-size:50px;">
                ${percentage >= 80 ? "🏆" : "🧠"}
            </div>

            <h2>
                Test tamamlandı!
            </h2>

            <p style="margin:12px 0;">
                ${quizScore}
                /
                ${quizQuestions.length}
                doğru
            </p>

            <p class="muted">
                Başarı:
                %${percentage}
            </p>

            <button
                onclick="loadQuiz()"
                style="
                    margin-top:20px;
                    padding:12px 20px;
                    border-radius:10px;
                    background:#7c5cff;
                    color:white;
                    font-weight:bold;
                "
            >
                Tekrar Dene
            </button>

        </div>
    `;

    if (xp > 0) {
        addXP(
            xp,
            `${quizScore} doğru cevap verdin.`
        );
    }
}


/* =========================================================
   KINGDOM
========================================================= */

function updateKingdom() {

    const kingdom =
        state.kingdom;

    const gold =
        document.getElementById("gold");

    const wood =
        document.getElementById("wood");

    const army =
        document.getElementById("army");

    const level =
        document.getElementById("kingdomLevel");

    if (gold) gold.textContent = kingdom.gold;
    if (wood) wood.textContent = kingdom.wood;
    if (army) army.textContent = kingdom.army;
    if (level) level.textContent = kingdom.level;
}


function kingdomAction(action) {

    const kingdom =
        state.kingdom;

    const log =
        document.getElementById("kingdomLog");

    switch (action) {

        case "tax":

            kingdom.gold += 25;

            log.textContent =
                "💰 Halktan 25 altın vergi toplandı.";

            addXP(5, "Krallık vergisi topladın.");

            break;


        case "wood":

            kingdom.wood += 20;

            log.textContent =
                "🪵 Ormandan 20 odun toplandı.";

            addXP(5, "Odun topladın.");

            break;


        case "army":

            if (kingdom.gold < 20) {

                log.textContent =
                    "❌ Asker eğitmek için 20 altın gerekiyor.";

                notify(
                    "Yetersiz altın",
                    "Asker eğitmek için daha fazla altın lazım.",
                    "💰"
                );

                return;
            }

            kingdom.gold -= 20;

            kingdom.army += 5;

            log.textContent =
                "⚔️ 5 yeni asker eğitildi.";

            addXP(
                8,
                "Yeni askerler eğittin."
            );

            break;


        case "upgrade":

            if (
                kingdom.gold < 100 ||
                kingdom.wood < 100
            ) {

                log.textContent =
                    "❌ Geliştirme için 100 altın ve 100 odun gerekiyor.";

                return;
            }

            kingdom.gold -= 100;
            kingdom.wood -= 100;

            kingdom.level++;

            log.textContent =
                `🏰 Krallık seviye ${kingdom.level} oldu!`;

            addXP(
                50,
                "Kuzeyyaka Krallığını geliştirdin."
            );

            unlockAchievement("kingdom");

            break;
    }

    saveState();

    updateKingdom();
}


/* =========================================================
   MYSTERY
========================================================= */

function checkMystery() {

    const input =
        document.getElementById("mysteryCode");

    const result =
        document.getElementById("mysteryResult");

    if (!input || !result) return;

    const code =
        input.value.trim();

    if (code === "731") {

        result.innerHTML = `
            <div class="success-text">
                🔓 DOSYA AÇILDI
                <br><br>
                Tebrikler dedektif.
                KürşatOS'un gizli dosyasını buldun.
                <br><br>
                <strong>
                    "Her şey göründüğü gibi değildir."
                </strong>
            </div>
        `;

        state.stats.mysterySolved = true;

        saveState();

        unlockAchievement("mystery");

        addXP(
            50,
            "Gizli dosyayı çözdün."
        );

        return;
    }

    result.innerHTML = `
        <span class="error-text">
            ❌ Yanlış kod.
        </span>
    `;

    input.classList.add("shake");

    setTimeout(() => {
        input.classList.remove("shake");
    }, 400);
}


/* =========================================================
   WEIRD INTERNET
========================================================= */

const weirdMessages = [

    "Saat 03:17'de bilgisayarına bakma.",

    "Bu mesajı okuyan kişi bugün gizli bir şey keşfedecek.",

    "KürşatOS seni izlemiyor. Muhtemelen.",

    "Dosyalarım klasöründeki her dosya gerçek olmayabilir.",

    "Bir gün bu butonun ne işe yaradığını gerçekten öğreneceksin.",

    "Terminalde 'secret' yazmayı denedin mi?",

    "Ekranın köşesinde bir şey hareket etti mi?",

    "731 sayısını unutma.",

    "Sistem normal çalışıyor... şimdilik.",

    "Buraya neden baktığını ben de bilmiyorum."

];


function randomWeird() {

    const result =
        document.getElementById("weirdResult");

    if (!result) return;

    const random =
        weirdMessages[
            Math.floor(
                Math.random() *
                weirdMessages.length
            )
        ];

    result.textContent =
        random;

    addXP(
        3,
        "Garip İnternet'i araştırdın."
    );
}


function dontPress() {

    const result =
        document.getElementById("weirdResult");

    state.stats.dontPress = true;

    saveState();

    unlockAchievement("dont_press");

    if (result) {

        result.innerHTML = `
            <span class="error-text">
                ⚠️ BEN SANA BASMA DEMİŞTİM!
            </span>
        `;

        result.classList.add("shake");

        setTimeout(() => {
            result.classList.remove("shake");
        }, 400);
    }

    notify(
        "UYARI",
        "Merak bazen başına iş açar.",
        "⚠️"
    );
}


/* =========================================================
   TERMINAL
========================================================= */

function setupTerminal() {

    const input =
        document.getElementById("terminalInput");

    if (!input) return;

    input.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Enter") {
                return;
            }

            const command =
                input.value.trim();

            input.value = "";

            if (!command) return;

            runCommand(command);
        }
    );
}


function terminalPrint(text) {

    const output =
        document.getElementById("terminalOutput");

    if (!output) return;

    const line =
        document.createElement("div");

    line.innerHTML = text;

    output.appendChild(line);

    const terminal =
        document.querySelector(
            ".terminal-content"
        );

    if (terminal) {
        terminal.scrollTop =
            terminal.scrollHeight;
    }
}


function runCommand(rawCommand) {

    const command =
        rawCommand.toLowerCase().trim();

    terminalPrint(
        `<span style="color:#67f59d">
            &gt; ${escapeHTML(rawCommand)}
        </span>`
    );

    state.stats.commands++;

    saveState();

    unlockAchievement("terminal");

    switch (command) {

        case "help":

            terminalPrint(`
                <br>
                Kullanılabilir komutlar:<br>
                ─────────────────────<br>
                help<br>
                clear<br>
                about<br>
                date<br>
                whoami<br>
                status<br>
                kingdom<br>
                xp<br>
                secret<br>
                matrix<br>
            `);

            break;


        case "clear":

            document.getElementById(
                "terminalOutput"
            ).innerHTML = "";

            break;


        case "about":

            terminalPrint(`
                <br>
                KürşatOS v1.0<br>
                Eğlence amaçlı interaktif web işletim sistemi.<br>
                Geliştirici: Kürşat
            `);

            break;


        case "date":

            terminalPrint(
                new Date().toLocaleString(
                    "tr-TR"
                )
            );

            break;


        case "whoami":

            terminalPrint(`
                <span style="color:#7c5cff">
                    Kürşat
                </span>
                — KürşatOS kullanıcısı
            `);

            break;


        case "status":

            terminalPrint(`
                Sistem: ONLINE<br>
                Seviye: ${state.level}<br>
                XP: ${state.xp}<br>
                Krallık: Kuzeyyaka<br>
                Krallık seviyesi: ${state.kingdom.level}
            `);

            break;


        case "kingdom":

            terminalPrint(`
                👑 Kuzeyyaka Krallığı<br>
                💰 Altın: ${state.kingdom.gold}<br>
                🪵 Odun: ${state.kingdom.wood}<br>
                ⚔️ Asker: ${state.kingdom.army}<br>
                🏰 Seviye: ${state.kingdom.level}
            `);

            break;


        case "xp":

            terminalPrint(`
                ⭐ Seviye ${state.level}<br>
                XP: ${state.xp}/${getXPNeeded()}
            `);

            break;


        case "secret":

            terminalPrint(`
                <span style="color:#ff4d6d">
                    ACCESSING SECRET FILE...
                </span>
            `);

            setTimeout(() => {

                terminalPrint(`
                    🔐 Gizli dosyanın kodu:
                    <strong>731</strong>
                `);

            }, 600);

            break;


        case "matrix":

            terminalPrint(`
                <span style="color:#67f59d">
                    01001011 01110101 01110010 01110011 01100001 01110100
                    <br>
                    SYSTEM BREACH... şaka yaptım 😄
                </span>
            `);

            addXP(
                10,
                "Terminalde gizli komut kullandın."
            );

            break;


        default:

            terminalPrint(
                `Komut bulunamadı: <b>${escapeHTML(command)}</b>`
            );

            break;
    }
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================================
   KEYBOARD
========================================================= */

function setupKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {
                closeStartMenu();
            }

            if (
                event.ctrlKey &&
                event.altKey &&
                event.key.toLowerCase() === "t"
            ) {

                event.preventDefault();

                openApp("terminal");
            }

        }
    );
}


/* =========================================================
   KONAMI STYLE SECRET
========================================================= */

const secretSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight"
];

let keySequence = [];

document.addEventListener(
    "keydown",
    event => {

        keySequence.push(event.key);

        if (
            keySequence.length >
            secretSequence.length
        ) {
            keySequence.shift();
        }

        const match =
            keySequence.every(
                (key, index) =>
                    key === secretSequence[index]
            );

        if (
            match &&
            keySequence.length ===
            secretSequence.length
        ) {

            activateSecretMode();

            keySequence = [];
        }
    }
);


function activateSecretMode() {

    addXP(
        100,
        "Gizli kombinasyonu buldun!"
    );

    notify(
        "GİZLİ MOD",
        "KürşatOS seni fark etti.",
        "👁️"
    );

    document
        .querySelector(".desktop")
        ?.classList.add("secret-mode");

    setTimeout(() => {

        document
            .querySelector(".desktop")
            ?.classList.remove("secret-mode");

    }, 5000);
}


/* =========================================================
   SECRET MODE STYLE
========================================================= */

const secretStyle =
    document.createElement("style");

secretStyle.textContent = `

.secret-mode {
    animation:
        secretGlitch .12s infinite alternate;
}

@keyframes secretGlitch {

    from {
        filter:
            hue-rotate(0deg)
            contrast(1);
    }

    to {
        filter:
            hue-rotate(35deg)
            contrast(1.15);
    }
}

`;

document.head.appendChild(secretStyle);


/* =========================================================
   RESET
========================================================= */

function resetKursatOS() {

    const confirmReset =
        confirm(
            "KürşatOS kayıtlarını tamamen silmek istediğine emin misin?"
        );

    if (!confirmReset) return;

    localStorage.removeItem(
        "KursatOS_State"
    );

    location.reload();
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openApp = openApp;
window.closeApp = closeApp;
window.minimizeApp = minimizeApp;
window.maximizeApp = maximizeApp;

window.toggleStartMenu = toggleStartMenu;
window.searchApps = searchApps;

window.startGame = startGame;

window.answerQuiz = answerQuiz;
window.loadQuiz = loadQuiz;

window.kingdomAction = kingdomAction;

window.checkMystery = checkMystery;

window.randomWeird = randomWeird;
window.dontPress = dontPress;

window.resetKursatOS = resetKursatOS;
