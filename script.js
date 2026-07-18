/* =========================================================
   VELORA — COMPLETE APP JAVASCRIPT
   UPDATED VERSION
========================================================= */

"use strict";

/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, parent = document) => parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const STORAGE_KEY = "veloraAppData";


/* =========================================================
   DATE HELPERS
========================================================= */

function todayKey() {
    return localDateKey(new Date());
}


function localDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseDateKey(key) {

    if (!key) {
        return new Date();
    }

    const [
        year,
        month,
        day
    ] = key
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


function addDays(date, amount) {

    const result =
        new Date(date);

    result.setDate(
        result.getDate() + amount
    );

    return result;
}


function getDayDifference(
    startDate,
    endDate
) {

    const start =
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        );

    const end =
        new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
        );

    return Math.floor(
        (end - start)
        / 86400000
    );
}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


function formatShortDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );
}


function uid() {

    if (
        typeof crypto !== "undefined"
        && crypto.randomUUID
    ) {
        return crypto.randomUUID();
    }

    return `${
        Date.now()
    }-${
        Math.random()
            .toString(36)
            .slice(2, 9)
    }`;
}


function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );
}


function escapeHTML(value = "") {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   SAFE CLONE
========================================================= */

function cloneData(data) {

    if (
        typeof structuredClone
        === "function"
    ) {

        return structuredClone(
            data
        );
    }

    return JSON.parse(
        JSON.stringify(data)
    );
}


/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultData = {

    account: {

        name: "",

        email: "",

        password: "",

        created: false,

        onboarded: false,

        signedIn: false
    },


    profile: {

        goal: "",

        focusCategories: []
    },


    habits: [],


    completions: {},


    photos: [],


    focusSessions: [],


    growth: {

        planLength: 7,

        startDate: null
    },


    xp: 0,


    preferences: {

        theme: "light",

        animations: true,

        motivation: true,

        focusSounds: false
    }
};


/* =========================================================
   LOAD / SAVE
========================================================= */

function loadData() {

    try {

        const rawData =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!rawData) {

            return cloneData(
                defaultData
            );
        }


        const saved =
            JSON.parse(
                rawData
            );


        return {

            ...cloneData(
                defaultData
            ),

            ...saved,


            account: {

                ...defaultData.account,

                ...(
                    saved.account
                    || {}
                )
            },


            profile: {

                ...defaultData.profile,

                ...(
                    saved.profile
                    || {}
                ),

                focusCategories:
                    Array.isArray(
                        saved.profile
                            ?.focusCategories
                    )

                        ? saved.profile
                            .focusCategories

                        : []
            },


            growth: {

                ...defaultData.growth,

                ...(
                    saved.growth
                    || {}
                )
            },


            preferences: {

                ...defaultData.preferences,

                ...(
                    saved.preferences
                    || {}
                )
            },


            habits:

                Array.isArray(
                    saved.habits
                )

                    ? saved.habits

                    : [],


            completions:

                saved.completions
                &&
                typeof saved.completions
                    === "object"

                    ? saved.completions

                    : {},


            photos:

                Array.isArray(
                    saved.photos
                )

                    ? saved.photos

                    : [],


            focusSessions:

                Array.isArray(
                    saved.focusSessions
                )

                    ? saved.focusSessions

                    : [],


            xp:

                Number.isFinite(
                    Number(
                        saved.xp
                    )
                )

                    ? Number(
                        saved.xp
                    )

                    : 0
        };


    } catch (error) {

        console.error(
            "Could not load Velora data:",
            error
        );


        return cloneData(
            defaultData
        );
    }
}


let appData =
    loadData();


function saveData() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                appData
            )
        );

        return true;


    } catch (error) {

        console.error(
            "Could not save Velora data:",
            error
        );


        showToast(
            "Unable to save your data."
        );

        return false;
    }
}


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentRoute =
    "dashboard";


let onboardingStep =
    1;


let selectedStarterHabits =
    [];


let trackerWindowOffset =
    0;


let analyticsDays =
    30;


let historyDate =
    new Date();


let selectedHistoryDate =
    todayKey();


let confirmationCallback =
    null;


/* =========================================================
   CHART STATE
========================================================= */

let dashboardChart =
    null;


let analyticsTrendChart =
    null;


let analyticsCategoryChart =
    null;


let analyticsWeekdayChart =
    null;


/* =========================================================
   FOCUS TIMER STATE
========================================================= */

let focusSelectedMinutes =
    25;


let focusRemainingSeconds =
    focusSelectedMinutes * 60;


let focusTimerInterval =
    null;


let focusRunning =
    false;


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const container =
        $("#toastContainer");


    if (!container) {

        console.log(
            "Velora:",
            message
        );

        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "toast";


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateX(25px)";

        },
        2600
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3100
    );
}


/* =========================================================
   ENTRY VIEW
========================================================= */

function showEntryView(viewId) {

    $$(".entry-view")
        .forEach(
            view => {

                view.classList.remove(
                    "active"
                );
            }
        );


    $("#appShell")
        ?.classList
        .remove(
            "active"
        );


    const targetView =
        $(`#${viewId}`);


    if (!targetView) {

        console.warn(
            `Entry view "${viewId}" not found.`
        );

        return;
    }


    targetView.classList.add(
        "active"
    );


    window.scrollTo({

        top: 0,

        behavior:
            appData.preferences
                .animations

                ? "smooth"

                : "auto"
    });
}


function enterApp(
    route = "dashboard"
) {

    $$(".entry-view")
        .forEach(
            view => {

                view.classList.remove(
                    "active"
                );
            }
        );


    $("#appShell")
        ?.classList
        .add(
            "active"
        );


    navigate(
        route
    );
}


/* =========================================================
   LANDING PAGE
========================================================= */

function openSignup() {

    showEntryView(
        "authView"
    );


    switchAuthTab(
        "signup"
    );
}


function openSignin() {

    showEntryView(
        "authView"
    );


    switchAuthTab(
        "signin"
    );
}


$("#startJourneyBtn")
    ?.addEventListener(
        "click",
        openSignup
    );


$("#landingBottomStartBtn")
    ?.addEventListener(
        "click",
        openSignup
    );


$("#landingSignInBtn")
    ?.addEventListener(
        "click",
        openSignin
    );


$("#authBackBtn")
    ?.addEventListener(
        "click",
        () => {

            showEntryView(
                "landingView"
            );
        }
    );


/* =========================================================
   AUTH TABS
========================================================= */

function switchAuthTab(
    tabName
) {

    $$(".auth-tab")
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset.authTab
                    === tabName
                );
            }
        );


    $$(".auth-form")
        .forEach(
            form => {

                form.classList.remove(
                    "active"
                );
            }
        );


    const targetForm =
        tabName === "signup"

            ? $("#signupForm")

            : $("#signinForm");


    targetForm
        ?.classList
        .add(
            "active"
        );
}


$$(".auth-tab")
    .forEach(
        button => {

            button.addEventListener(

                "click",

                () => {

                    switchAuthTab(
                        button.dataset
                            .authTab
                    );
                }
            );
        }
    );


/* =========================================================
   SIGN UP
========================================================= */

$("#signupForm")
    ?.addEventListener(

        "submit",

        event => {

            event.preventDefault();


            const name =
                $("#signupName")
                    ?.value
                    .trim();


            const email =
                $("#signupEmail")
                    ?.value
                    .trim()
                    .toLowerCase();


            const password =
                $("#signupPassword")
                    ?.value;


            const confirmPassword =
                $("#signupConfirmPassword")
                    ?.value;


            if (
                !name
                || !email
                || !password
                || !confirmPassword
            ) {

                showToast(
                    "Please complete all fields."
                );

                return;
            }


            if (
                password.length < 6
            ) {

                showToast(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (
                password
                !== confirmPassword
            ) {

                showToast(
                    "Passwords do not match."
                );

                return;
            }


            appData.account = {

                name,

                email,

                password,

                created: true,

                onboarded: false,

                signedIn: true
            };


            saveData();


            const onboardingName =
                $("#onboardingName");


            if (onboardingName) {

                onboardingName.value =
                    name;
            }


            onboardingStep =
                1;


            selectedStarterHabits =
                [];


            $(
                "[data-focus-category].selected"
            );


            $$(
                "[data-focus-category], [data-starter-habit]"
            )
            .forEach(
                card => {

                    card.classList.remove(
                        "selected"
                    );
                }
            );


            showEntryView(
                "onboardingView"
            );


            renderOnboarding();
        }
    );


/* =========================================================
   SIGN IN
========================================================= */

$("#signinForm")
    ?.addEventListener(

        "submit",

        event => {

            event.preventDefault();


            const email =
                $("#signinEmail")
                    ?.value
                    .trim()
                    .toLowerCase();


            const password =
                $("#signinPassword")
                    ?.value;


            if (
                !email
                || !password
            ) {

                showToast(
                    "Enter your email and password."
                );

                return;
            }


            if (
                !appData.account.created
            ) {

                showToast(
                    "No Velora account found on this device."
                );

                return;
            }


            if (
                email
                    !==
                    String(
                        appData.account.email
                    )
                    .toLowerCase()

                ||

                password
                    !==
                    appData.account.password
            ) {

                showToast(
                    "Email or password is incorrect."
                );

                return;
            }


            appData.account.signedIn =
                true;


            saveData();


            if (
                appData.account
                    .onboarded
            ) {

                enterApp(
                    "dashboard"
                );

            } else {

                onboardingStep =
                    1;


                showEntryView(
                    "onboardingView"
                );


                renderOnboarding();
            }
        }
    );


/* =========================================================
   FORGOT PASSWORD
========================================================= */

$("#forgotPasswordBtn")
    ?.addEventListener(

        "click",

        () => {

            if (
                !appData.account.created
            ) {

                showToast(
                    "No local account found."
                );

                return;
            }


            showToast(
                "This demo account is stored locally on this device."
            );
        }
    );
    /* =========================================================
   ONBOARDING
========================================================= */

function renderOnboarding() {

    $$(".onboarding-step")
        .forEach(step => {

            const stepNumber =
                Number(
                    step.dataset
                        .onboardingStep
                );

            step.classList.toggle(
                "active",
                stepNumber === onboardingStep
            );
        });


    const stepText =
        $("#onboardingStepText");

    if (stepText) {

        stepText.textContent =
            `Step ${onboardingStep} of 4`;
    }


    const progressFill =
        $("#onboardingProgressFill");

    if (progressFill) {

        progressFill.style.width =
            `${onboardingStep * 25}%`;
    }


    const backButton =
        $("#onboardingBackBtn");

    if (backButton) {

        backButton.style.visibility =
            onboardingStep === 1
                ? "hidden"
                : "visible";
    }


    const nextButton =
        $("#onboardingNextBtn");

    if (nextButton) {

        nextButton.textContent =
            onboardingStep === 4
                ? "Enter Velora"
                : "Continue";
    }
}


/* =========================================================
   ONBOARDING SELECTIONS
========================================================= */

$$("[data-focus-category]")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                card.classList.toggle(
                    "selected"
                );
            }
        );
    });


$$("[data-starter-habit]")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                card.classList.toggle(
                    "selected"
                );
            }
        );
    });


/* =========================================================
   ONBOARDING BACK
========================================================= */

$("#onboardingBackBtn")
    ?.addEventListener(
        "click",
        () => {

            if (
                onboardingStep <= 1
            ) {
                return;
            }


            onboardingStep--;


            renderOnboarding();
        }
    );


/* =========================================================
   ONBOARDING NEXT
========================================================= */

$("#onboardingNextBtn")
    ?.addEventListener(
        "click",
        () => {

            /* =========================
               STEP 1 — NAME
            ========================= */

            if (
                onboardingStep === 1
            ) {

                const name =
                    $("#onboardingName")
                        ?.value
                        .trim();


                if (!name) {

                    showToast(
                        "Enter your name to continue."
                    );

                    return;
                }


                appData.account.name =
                    name;
            }


            /* =========================
               STEP 2 — FOCUS AREAS
            ========================= */

            if (
                onboardingStep === 2
            ) {

                const selectedCategories =
                    $$(
                        "[data-focus-category].selected"
                    );


                appData.profile
                    .focusCategories =
                    selectedCategories
                        .map(
                            card =>
                                card.dataset
                                    .focusCategory
                        )
                        .filter(Boolean);
            }


            /* =========================
               STEP 3 — STARTER HABITS
            ========================= */

            if (
                onboardingStep === 3
            ) {

                selectedStarterHabits =
                    $$(
                        "[data-starter-habit].selected"
                    )
                    .map(card => ({

                        id:
                            uid(),

                        name:
                            card.dataset
                                .starterHabit
                            || "New Habit",

                        category:
                            card.dataset
                                .category
                            || "Lifestyle",

                        icon:
                            card.dataset
                                .icon
                            || "fa-seedling",

                        priority:
                            "Important",

                        goal:
                            "",

                        createdDate:
                            todayKey()
                    }));


                selectedStarterHabits
                    .forEach(
                        newHabit => {

                            const exists =
                                appData.habits
                                    .some(
                                        habit =>
                                            habit.name
                                                .trim()
                                                .toLowerCase()
                                            ===
                                            newHabit.name
                                                .trim()
                                                .toLowerCase()
                                    );


                            if (!exists) {

                                appData.habits.push(
                                    newHabit
                                );
                            }
                        }
                    );
            }


            /* =========================
               STEP 4 — GOAL + FINISH
            ========================= */

            if (
                onboardingStep === 4
            ) {

                appData.profile.goal =
                    $("#firstGoal")
                        ?.value
                        .trim()
                    || "";


                appData.account
                    .onboarded =
                    true;


                appData.account
                    .signedIn =
                    true;


                saveData();


                enterApp(
                    "dashboard"
                );


                showToast(
                    "Welcome to Velora."
                );


                return;
            }


            /* =========================
               MOVE NEXT
            ========================= */

            onboardingStep =
                clamp(
                    onboardingStep + 1,
                    1,
                    4
                );


            saveData();


            renderOnboarding();
        }
    );


/* =========================================================
   ROUTING
========================================================= */

function navigate(route) {

    let targetRoute =
        route;


    const targetPage =
        $(
            `[data-page="${targetRoute}"]`
        );


    if (!targetPage) {

        targetRoute =
            "dashboard";
    }


    currentRoute =
        targetRoute;


    /* Hide all pages */

    $$(".app-page")
        .forEach(
            page => {

                page.classList.remove(
                    "active"
                );
            }
        );


    /* Show selected page */

    const activePage =
        $(
            `[data-page="${currentRoute}"]`
        );


    activePage
        ?.classList
        .add(
            "active"
        );


    /* Update sidebar navigation */

    $$(".nav-item")
        .forEach(
            item => {

                item.classList.toggle(

                    "active",

                    item.dataset.route
                    === currentRoute
                );
            }
        );


    /* Close mobile sidebar */

    $("#sidebar")
        ?.classList
        .remove(
            "mobile-open"
        );


    /* Render page */

    renderCurrentPage();


    /* Scroll page to top */

    window.scrollTo({

        top: 0,

        behavior:
            appData.preferences
                .animations

                ? "smooth"

                : "auto"
    });
}


/* =========================================================
   ROUTE BUTTONS
========================================================= */

$$("[data-route]")
    .forEach(
        element => {

            element.addEventListener(

                "click",

                event => {

                    event.preventDefault();


                    const route =
                        element.dataset
                            .route;


                    if (!route) {

                        return;
                    }


                    navigate(
                        route
                    );
                }
            );
        }
    );


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

$("#mobileMenuBtn")
    ?.addEventListener(
        "click",
        () => {

            $("#sidebar")
                ?.classList
                .toggle(
                    "mobile-open"
                );
        }
    );


/* Close mobile sidebar when clicking outside */

document.addEventListener(
    "click",
    event => {

        const sidebar =
            $("#sidebar");


        const menuButton =
            $("#mobileMenuBtn");


        if (
            !sidebar
            ||
            !sidebar.classList
                .contains(
                    "mobile-open"
                )
        ) {

            return;
        }


        const clickedInsideSidebar =
            sidebar.contains(
                event.target
            );


        const clickedMenuButton =
            menuButton
                ?.contains(
                    event.target
                );


        if (
            !clickedInsideSidebar
            &&
            !clickedMenuButton
        ) {

            sidebar.classList.remove(
                "mobile-open"
            );
        }
    }
);


/* =========================================================
   USER UI
========================================================= */

function updateUserUI() {

    const name =
        appData.account.name
        ?.trim()
        ||
        "Velora User";


    const email =
        appData.account.email
        ?.trim()
        ||
        "No email";


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase()
        ||
        "V";


    /* Sidebar name */

    const sidebarName =
        $("#sidebarUserName");

    if (sidebarName) {

        sidebarName.textContent =
            name;
    }


    /* Sidebar avatar */

    const sidebarAvatar =
        $("#sidebarAvatar");

    if (sidebarAvatar) {

        sidebarAvatar.textContent =
            firstLetter;
    }


    /* Settings avatar */

    const settingsAvatar =
        $("#settingsProfileAvatar");

    if (settingsAvatar) {

        settingsAvatar.textContent =
            firstLetter;
    }


    /* Settings preview name */

    const settingsName =
        $("#settingsProfilePreviewName");

    if (settingsName) {

        settingsName.textContent =
            name;
    }


    /* Settings preview email */

    const settingsEmail =
        $("#settingsProfilePreviewEmail");

    if (settingsEmail) {

        settingsEmail.textContent =
            email;
    }


    /* Update XP */

    updateXPUI();
}


/* =========================================================
   XP / LEVEL SYSTEM
========================================================= */

function getLevelData() {

    const xp =
        Math.max(
            0,
            Number(
                appData.xp
            )
            || 0
        );


    const level =
        Math.floor(
            xp / 100
        )
        + 1;


    const current =
        xp % 100;


    const levelNames = [

        "Seed",

        "Sprout",

        "Growing",

        "Rooted",

        "Blooming",

        "Flourishing"
    ];


    const titleIndex =
        Math.min(

            level - 1,

            levelNames.length - 1
        );


    const title =
        levelNames[
            titleIndex
        ];


    return {

        level,

        current,

        title
    };
}


/* =========================================================
   UPDATE XP UI
========================================================= */

function updateXPUI() {

    const {

        level,

        current,

        title

    } = getLevelData();


    const levelText =
        $("#sidebarUserLevel");


    if (levelText) {

        levelText.textContent =
            `Level ${level} · ${title}`;
    }


    const xpText =
        $("#sidebarXpText");


    if (xpText) {

        xpText.textContent =
            `${current} / 100 XP`;
    }


    const xpFill =
        $("#sidebarXpFill");


    if (xpFill) {

        xpFill.style.width =
            `${current}%`;
    }
}


/* =========================================================
   HABIT HELPERS
========================================================= */

function getHabitCompletion(
    habitId,
    dateKey
) {

    if (
        !habitId
        ||
        !dateKey
    ) {

        return false;
    }


    return Boolean(

        appData
            .completions
            ?.[dateKey]
            ?.[habitId]
    );
}


/* =========================================================
   ENSURE DATE RECORD
========================================================= */

function ensureDateRecord(
    dateKey
) {

    if (!dateKey) {

        return;
    }


    if (
        !appData.completions
        ||
        typeof appData.completions
            !== "object"
    ) {

        appData.completions =
            {};
    }


    if (
        !appData.completions[
            dateKey
        ]
    ) {

        appData.completions[
            dateKey
        ] = {};
    }
}


/* =========================================================
   CHECK IF HABIT EXISTS
========================================================= */

function getHabitById(
    habitId
) {

    return appData.habits
        .find(
            habit =>
                habit.id
                === habitId
        )
        || null;
}


/* =========================================================
   COMPLETE HABIT
========================================================= */

function completeHabit(
    habitId,
    dateKey = todayKey()
) {

    /*
       RULES

       1. Only today's habit can be completed.
       2. Once completed, it cannot be unticked.
       3. Completion gives 10 XP.
       4. Duplicate clicks cannot give extra XP.
    */


    if (!habitId) {

        return;
    }


    const habit =
        getHabitById(
            habitId
        );


    if (!habit) {

        showToast(
            "Habit could not be found."
        );

        return;
    }


    /* Only today can be completed */

    if (
        dateKey !== todayKey()
    ) {

        showToast(
            "Only today's habits can be completed."
        );

        return;
    }


    /* Prevent duplicate completion */

    if (
        getHabitCompletion(
            habitId,
            dateKey
        )
    ) {

        return;
    }


    ensureDateRecord(
        dateKey
    );


    /* Save completion */

    appData.completions[
        dateKey
    ][habitId] =
        true;


    /* Add XP */

    appData.xp =
        Math.max(
            0,
            Number(
                appData.xp
            )
            || 0
        )
        + 10;


    saveData();


    renderAll();


    showToast(
        "+10 XP · Habit completed."
    );
}


/* =========================================================
   JOURNEY START DATE
========================================================= */

function getJourneyStartDate() {

    const habitDates =
        appData.habits

            .map(
                habit =>
                    habit.createdDate
            )

            .filter(Boolean)

            .sort();


    /*
       If user has no habits yet,
       journey starts today.
    */

    if (
        !habitDates.length
    ) {

        return parseDateKey(
            todayKey()
        );
    }


    return parseDateKey(
        habitDates[0]
    );
}


/* =========================================================
   CURRENT JOURNEY DAY
========================================================= */

function getCurrentJourneyDay() {

    const startDate =
        getJourneyStartDate();


    const today =
        parseDateKey(
            todayKey()
        );


    const difference =
        getDayDifference(
            startDate,
            today
        );


    return Math.max(

        1,

        difference + 1
    );
}


/* =========================================================
   TRACKER 30-DAY WINDOW
========================================================= */

function getTrackerWindow() {

    const currentDay =
        getCurrentJourneyDay();


    /*
       Example:

       Current Day 1:
       Day 1 — Day 30

       Current Day 30:
       Day 1 — Day 30

       Current Day 31:
       Day 2 — Day 31

       Current Day 32:
       Day 3 — Day 32

       Previous button moves backward
       through old journey history.
    */


    const latestStart =
        Math.max(

            1,

            currentDay - 29
        );


    const requestedStart =
        latestStart
        +
        trackerWindowOffset * 30;


    const startDay =
        Math.max(

            1,

            requestedStart
        );


    const endDay =
        startDay + 29;


    return {

        startDay,

        endDay,

        latestStart,

        currentDay
    };
}
/* =========================================================
   MY HABITS TRACKER
========================================================= */

function renderHabitTracker() {

    const head =
        $("#dailyTrackerHead");

    const body =
        $("#dailyTrackerBody");


    if (
        !head
        ||
        !body
    ) {

        return;
    }


    const {

        startDay,

        endDay,

        latestStart

    } = getTrackerWindow();


    /* =========================
       TRACKER WINDOW LABEL
    ========================= */

    const windowLabel =
        $("#trackerWindowLabel");


    if (windowLabel) {

        windowLabel.textContent =
            `Day ${startDay} — Day ${endDay}`;
    }


    const journeyStart =
        getJourneyStartDate();


    /* =========================
       TABLE HEADER
    ========================= */

    let headerHTML =
        `
            <tr>
                <th class="tracker-habit-column">
                    Habits
                </th>
        `;


    for (
        let day = startDay;
        day <= endDay;
        day++
    ) {

        const date =
            addDays(
                journeyStart,
                day - 1
            );


        headerHTML += `
            <th
                title="${formatDate(date)}"
            >
                Day ${day}
            </th>
        `;
    }


    headerHTML +=
        "</tr>";


    head.innerHTML =
        headerHTML;


    /* =========================
       EMPTY STATE
    ========================= */

    if (
        !appData.habits.length
    ) {

        body.innerHTML = `
            <tr>
                <td colspan="31">
                    Add your first habit to begin your journey.
                </td>
            </tr>
        `;


        updateTrackerNavigation(
            startDay,
            latestStart
        );


        return;
    }


    /* =========================
       HABIT ROWS
    ========================= */

    body.innerHTML =
        appData.habits
            .map(
                habit => {

                    let row = `
                        <tr>

                            <td
                                class="tracker-habit-name"
                            >
                                <div>
                                    <i
                                        class="fa-solid ${
                                            escapeHTML(
                                                habit.icon
                                                || "fa-seedling"
                                            )
                                        }"
                                    ></i>

                                    <strong>
                                        ${
                                            escapeHTML(
                                                habit.name
                                            )
                                        }
                                    </strong>
                                </div>
                            </td>
                    `;


                    for (
                        let day = startDay;
                        day <= endDay;
                        day++
                    ) {

                        const date =
                            addDays(
                                journeyStart,
                                day - 1
                            );


                        const dateKey =
                            localDateKey(
                                date
                            );


                        const currentToday =
                            todayKey();


                        const completed =
                            getHabitCompletion(
                                habit.id,
                                dateKey
                            );


                        const isToday =
                            dateKey
                            === currentToday;


                        const isPast =
                            dateKey
                            < currentToday;


                        const isFuture =
                            dateKey
                            > currentToday;


                        const habitCreatedDate =
                            habit.createdDate
                            ||
                            localDateKey(
                                journeyStart
                            );


                        const beforeHabitCreation =
                            dateKey
                            < habitCreatedDate;


                        let content =
                            "";


                        /* =========================
                           HABIT DID NOT EXIST YET
                        ========================= */

                        if (
                            beforeHabitCreation
                        ) {

                            content = `
                                <span
                                    class="tracker-unavailable"
                                    title="Habit not created yet"
                                >
                                    —
                                </span>
                            `;
                        }


                        /* =========================
                           COMPLETED
                        ========================= */

                        else if (
                            completed
                        ) {

                            content = `
                                <button
                                    class="tracker-check completed"
                                    type="button"
                                    disabled
                                    aria-label="Completed"
                                    title="Completed"
                                >
                                    ✓
                                </button>
                            `;
                        }


                        /* =========================
                           TODAY — CAN COMPLETE
                        ========================= */

                        else if (
                            isToday
                        ) {

                            content = `
                                <button
                                    class="tracker-check"
                                    type="button"
                                    data-complete-habit="${
                                        habit.id
                                    }"
                                    aria-label="Complete ${
                                        escapeHTML(
                                            habit.name
                                        )
                                    }"
                                    title="Complete today"
                                >
                                </button>
                            `;
                        }


                        /* =========================
                           MISSED PAST DAY
                        ========================= */

                        else if (
                            isPast
                        ) {

                            content = `
                                <span
                                    class="missed"
                                    title="Missed"
                                >
                                    ✕
                                </span>
                            `;
                        }


                        /* =========================
                           FUTURE DAY
                        ========================= */

                        else if (
                            isFuture
                        ) {

                            content = `
                                <span
                                    class="tracker-future"
                                    title="Future day"
                                >
                                    ·
                                </span>
                            `;
                        }


                        row += `
                            <td
                                class="${
                                    isToday
                                        ? "today-cell"
                                        : ""
                                }"
                                title="${
                                    formatDate(
                                        date
                                    )
                                }"
                            >
                                ${content}
                            </td>
                        `;
                    }


                    row +=
                        "</tr>";


                    return row;
                }
            )
            .join("");


    /* =========================
       COMPLETION BUTTON EVENTS
    ========================= */

    $$(
        "[data-complete-habit]",
        body
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const habitId =
                        button.dataset
                            .completeHabit;


                    if (!habitId) {

                        return;
                    }


                    completeHabit(
                        habitId
                    );
                }
            );
        }
    );


    /* =========================
       NAVIGATION BUTTON STATE
    ========================= */

    updateTrackerNavigation(
        startDay,
        latestStart
    );
}


/* =========================================================
   TRACKER NAVIGATION STATE
========================================================= */

function updateTrackerNavigation(
    startDay,
    latestStart
) {

    const previousButton =
        $("#previousTrackerWindowBtn");


    const nextButton =
        $("#nextTrackerWindowBtn");


    const latestButton =
        $("#latestTrackerWindowBtn");


    if (previousButton) {

        previousButton.disabled =
            startDay <= 1;
    }


    if (nextButton) {

        nextButton.disabled =
            trackerWindowOffset >= 0
            ||
            startDay >= latestStart;
    }


    if (latestButton) {

        latestButton.disabled =
            trackerWindowOffset === 0;
    }
}


/* =========================================================
   TRACKER — PREVIOUS 30 DAYS
========================================================= */

$("#previousTrackerWindowBtn")
    ?.addEventListener(
        "click",
        () => {

            const {

                startDay

            } = getTrackerWindow();


            if (
                startDay <= 1
            ) {

                return;
            }


            trackerWindowOffset--;


            renderHabitTracker();
        }
    );


/* =========================================================
   TRACKER — NEXT 30 DAYS
========================================================= */

$("#nextTrackerWindowBtn")
    ?.addEventListener(
        "click",
        () => {

            if (
                trackerWindowOffset >= 0
            ) {

                return;
            }


            trackerWindowOffset++;


            renderHabitTracker();
        }
    );


/* =========================================================
   TRACKER — RETURN TO LATEST
========================================================= */

$("#latestTrackerWindowBtn")
    ?.addEventListener(
        "click",
        () => {

            trackerWindowOffset =
                0;


            renderHabitTracker();
        }
    );


/* =========================================================
   HABIT DATE STATS
========================================================= */

function getDateCompletionStats(
    dateKey
) {

    if (!dateKey) {

        return {

            total: 0,

            completed: 0,

            percentage: 0
        };
    }


    const availableHabits =
        appData.habits
            .filter(
                habit => {

                    const createdDate =
                        habit.createdDate
                        || dateKey;


                    return (
                        createdDate
                        <= dateKey
                    );
                }
            );


    const total =
        availableHabits.length;


    const completed =
        availableHabits
            .filter(
                habit =>
                    getHabitCompletion(
                        habit.id,
                        dateKey
                    )
            )
            .length;


    const percentage =
        total > 0

            ? Math.round(

                (
                    completed
                    /
                    total
                )
                * 100
            )

            : 0;


    return {

        total,

        completed,

        percentage
    };
}


/* =========================================================
   CURRENT PERFECT-DAY STREAK
========================================================= */

function calculateCurrentStreak() {

    if (
        !appData.habits.length
    ) {

        return 0;
    }


    let streak =
        0;


    let cursor =
        parseDateKey(
            todayKey()
        );


    /*
       If today is incomplete,
       check from yesterday.

       This prevents the streak
       from showing 0 during the day
       before the user finishes
       today's habits.
    */

    const todayStats =
        getDateCompletionStats(
            todayKey()
        );


    if (
        todayStats.total > 0
        &&
        todayStats.completed
        !== todayStats.total
    ) {

        cursor =
            addDays(
                cursor,
                -1
            );
    }


    while (true) {

        const key =
            localDateKey(
                cursor
            );


        const stats =
            getDateCompletionStats(
                key
            );


        if (
            stats.total > 0
            &&
            stats.completed
            === stats.total
        ) {

            streak++;


            cursor =
                addDays(
                    cursor,
                    -1
                );

        } else {

            break;
        }
    }


    return streak;
}


/* =========================================================
   30-DAY AVERAGE
========================================================= */

function calculateThirtyDayAverage() {

    let totalPercentage =
        0;


    let countedDays =
        0;


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const dateKey =
            localDateKey(
                date
            );


        const stats =
            getDateCompletionStats(
                dateKey
            );


        if (
            stats.total > 0
        ) {

            totalPercentage +=
                stats.percentage;


            countedDays++;
        }
    }


    return countedDays > 0

        ? Math.round(
            totalPercentage
            /
            countedDays
        )

        : 0;
}


/* =========================================================
   HABITS PAGE
========================================================= */

function renderHabitsPage() {

    const today =
        parseDateKey(
            todayKey()
        );


    /* =========================
       TODAY DATE
    ========================= */

    const todayDate =
        $("#habitTrackerTodayDate");


    if (todayDate) {

        todayDate.textContent =
            formatDate(
                today
            );
    }


    /* =========================
       CALCULATE STATS
    ========================= */

    const stats =
        getDateCompletionStats(
            todayKey()
        );


    const streak =
        calculateCurrentStreak();


    const consistency =
        calculateThirtyDayAverage();


    /* =========================
       TODAY RATIO
    ========================= */

    const ratio =
        $("#habitTodayRatio");


    if (ratio) {

        ratio.textContent =
            `${stats.percentage}%`;
    }


    /* =========================
       TOTAL HABITS
    ========================= */

    const totalCount =
        $("#habitTotalCount");


    if (totalCount) {

        totalCount.textContent =
            appData.habits.length;
    }


    /* =========================
       CURRENT STREAK
    ========================= */

    const streakElement =
        $("#habitBestStreak");


    if (streakElement) {

        streakElement.textContent =
            `${streak} Days`;
    }


    /* =========================
       CONSISTENCY
    ========================= */

    const weeklyCompletion =
        $("#habitWeeklyCompletion");


    if (weeklyCompletion) {

        weeklyCompletion.textContent =
            `${consistency}%`;
    }


    /* =========================
       TODAY STATUS
    ========================= */

    const todayStatus =
        $("#habitTrackerTodayStatus");


    if (todayStatus) {

        if (
            !stats.total
        ) {

            todayStatus.textContent =
                "Add your first habit to begin.";

        } else if (
            stats.completed
            === stats.total
        ) {

            todayStatus.textContent =
                `All ${stats.total} habits completed today.`;

        } else {

            todayStatus.textContent =
                `${stats.completed} of ${stats.total} habits completed today.`;
        }
    }


    /* =========================
       RENDER HABIT COMPONENTS
    ========================= */

    renderHabitTracker();

    renderHabitTodayStats();

    renderThirtyDayBars();

    renderHabitQuickInsights();
}


/* =========================================================
   TODAY HABIT STATS
========================================================= */

function renderHabitTodayStats() {

    const container =
        $("#habitTodayStats");


    if (!container) {

        return;
    }


    const stats =
        getDateCompletionStats(
            todayKey()
        );


    const remaining =
        Math.max(

            0,

            stats.total
            -
            stats.completed
        );


    container.innerHTML = `
        <div class="insight-grid">

            <div>

                <strong>
                    ${stats.completed}
                </strong>

                <p>
                    Completed today
                </p>

            </div>


            <div>

                <strong>
                    ${remaining}
                </strong>

                <p>
                    Remaining today
                </p>

            </div>


            <div>

                <strong>
                    ${stats.percentage}%
                </strong>

                <p>
                    Daily completion
                </p>

            </div>

        </div>
    `;
}


/* =========================================================
   30-DAY COMPLETION BARS
========================================================= */

function renderThirtyDayBars() {

    const container =
        $("#habitThirtyDayChart");


    if (!container) {

        return;
    }


    let html =
        "";


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 29;
        i >= 0;
        i--
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const stats =
            getDateCompletionStats(

                localDateKey(
                    date
                )
            );


        const barHeight =
            stats.total > 0

                ? Math.max(
                    5,
                    stats.percentage
                )

                : 5;


        html += `
            <span
                title="${
                    formatShortDate(
                        date
                    )
                } · ${
                    stats.percentage
                }%"
                style="
                    display:inline-block;
                    width:8px;
                    height:${barHeight}px;
                    max-height:100px;
                    margin:2px;
                    border-radius:5px;
                    background:var(--primary);
                    opacity:${
                        stats.total > 0
                            ? 1
                            : 0.15
                    };
                    vertical-align:bottom;
                "
            ></span>
        `;
    }


    container.innerHTML =
        html;
}


/* =========================================================
   HABIT QUICK INSIGHTS
========================================================= */

function renderHabitQuickInsights() {

    const container =
        $("#habitQuickInsights");


    if (!container) {

        return;
    }


    const consistency =
        calculateThirtyDayAverage();


    const streak =
        calculateCurrentStreak();


    let consistencyMessage =
        "Your habit journey is just beginning.";


    if (
        consistency >= 80
    ) {

        consistencyMessage =
            "Your consistency is excellent.";

    } else if (
        consistency >= 50
    ) {

        consistencyMessage =
            "You are building steady momentum.";

    } else if (
        consistency > 0
    ) {

        consistencyMessage =
            "Keep showing up and your consistency will grow.";
    }


    container.innerHTML = `
        <div class="insight-grid">

            <div>

                <strong>
                    ${consistency}% consistency
                </strong>

                <p>
                    ${consistencyMessage}
                </p>

            </div>


            <div>

                <strong>
                    ${streak} day streak
                </strong>

                <p>
                    Your current perfect-day momentum.
                </p>

            </div>

        </div>
    `;
}


/* =========================================================
   OPEN NEW HABIT MODAL
========================================================= */

$("#openNewHabitBtn")
    ?.addEventListener(
        "click",
        () => {

            openModal(
                "newHabitModal"
            );
        }
    );


/* =========================================================
   ADD NEW HABIT
========================================================= */

$("#newHabitForm")
    ?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                $("#newHabitName")
                    ?.value
                    .trim();


            if (!name) {

                showToast(
                    "Enter a habit name."
                );

                return;
            }


            /* =========================
               PREVENT DUPLICATE HABIT
            ========================= */

            const alreadyExists =
                appData.habits
                    .some(
                        habit =>
                            habit.name
                                .trim()
                                .toLowerCase()
                            ===
                            name
                                .toLowerCase()
                    );


            if (
                alreadyExists
            ) {

                showToast(
                    "This habit already exists."
                );

                return;
            }


            /* =========================
               CREATE HABIT
            ========================= */

            const newHabit = {

                id:
                    uid(),

                name,

                category:
                    $("#newHabitCategory")
                        ?.value
                    ||
                    "Lifestyle",

                priority:
                    $("#newHabitPriority")
                        ?.value
                    ||
                    "Important",

                icon:
                    $("#newHabitIcon")
                        ?.value
                    ||
                    "fa-seedling",

                goal:
                    $("#newHabitGoal")
                        ?.value
                        .trim()
                    ||
                    "",

                createdDate:
                    todayKey()
            };


            appData.habits.push(
                newHabit
            );


            saveData();


            /* =========================
               RESET FORM
            ========================= */

            event.target.reset();


            /* =========================
               CLOSE MODAL
            ========================= */

            closeModal(
                "newHabitModal"
            );


            /* =========================
               UPDATE APP
            ========================= */

            renderAll();


            showToast(
                "Habit added to your journey."
            );
        }
    );
    /* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const now =
        new Date();


    const hour =
        now.getHours();


    let greeting =
        "Good Evening";


    if (
        hour < 12
    ) {

        greeting =
            "Good Morning";

    } else if (
        hour < 17
    ) {

        greeting =
            "Good Afternoon";
    }


    /* =========================
       DASHBOARD GREETING
    ========================= */

    const greetingElement =
        $("#dashboardGreeting");


    if (greetingElement) {

        greetingElement.textContent =
            `${greeting}, ${
                appData.account.name
                || "Explorer"
            }.`;
    }


    /* =========================
       CURRENT DATE
    ========================= */

    const dateElement =
        $("#dashboardDate");


    if (dateElement) {

        dateElement.textContent =
            formatDate(
                now
            );
    }


    /* =========================
       TODAY STATS
    ========================= */

    const stats =
        getDateCompletionStats(
            todayKey()
        );


    const streak =
        calculateCurrentStreak();


    const {
        level
    } =
        getLevelData();


    /* =========================
       PRODUCTIVITY SCORE
    ========================= */

    const productivityScore =
        $("#dashboardProductivityScore");


    if (
        productivityScore
    ) {

        productivityScore.textContent =
            `${stats.percentage}%`;
    }


    /* =========================
       CURRENT STREAK
    ========================= */

    const currentStreak =
        $("#dashboardCurrentStreak");


    if (
        currentStreak
    ) {

        currentStreak.textContent =
            `${streak} Days`;
    }


    /* =========================
       TOTAL XP
    ========================= */

    const xpEarned =
        $("#dashboardXpEarned");


    if (
        xpEarned
    ) {

        xpEarned.textContent =
            `${appData.xp || 0} XP`;
    }


    /* =========================
       CURRENT LEVEL
    ========================= */

    const currentLevel =
        $("#dashboardCurrentLevel");


    if (
        currentLevel
    ) {

        currentLevel.textContent =
            level;
    }


    /* =========================
       COMPLETED TODAY
    ========================= */

    const completedToday =
        $("#dashboardCompletedToday");


    if (
        completedToday
    ) {

        completedToday.textContent =
            `${stats.completed} / ${stats.total}`;
    }


    /* =========================
       PROGRESS PERCENTAGE
    ========================= */

    const progressPercentage =
        $("#dashboardProgressPercentage");


    if (
        progressPercentage
    ) {

        progressPercentage.textContent =
            `${stats.percentage}%`;
    }


    /* =========================
       PROGRESS RING
    ========================= */

    const progressRing =
        $("#dashboardProgressRing");


    if (
        progressRing
    ) {

        progressRing.style.background = `
            conic-gradient(
                var(--primary)
                0%
                ${stats.percentage}%,

                var(--surface-deep)
                ${stats.percentage}%
                100%
            )
        `;
    }


    /* =========================
       PROGRESS MESSAGE
    ========================= */

    const progressMessage =
        $("#dashboardProgressMessage");


    if (
        progressMessage
    ) {

        let message =
            "Start with one small action.";


        if (
            stats.total === 0
        ) {

            message =
                "Add your first habit to begin your journey.";

        } else if (
            stats.percentage === 100
        ) {

            message =
                "You showed up completely today.";

        } else if (
            stats.percentage >= 70
        ) {

            message =
                "Almost there. Finish strong.";

        } else if (
            stats.percentage > 0
        ) {

            message =
                "Keep the momentum going.";
        }


        progressMessage.textContent =
            message;
    }


    /* =========================
       DASHBOARD COMPONENTS
    ========================= */

    renderDashboardHabits();

    renderDashboardChart();

    renderDashboardHeatmap();

    renderDashboardInsights();
}


/* =========================================================
   DASHBOARD — TODAY HABITS
========================================================= */

function renderDashboardHabits() {

    const container =
        $("#dashboardTodayHabits");


    if (
        !container
    ) {

        return;
    }


    /* =========================
       EMPTY HABIT STATE
    ========================= */

    if (
        !appData.habits.length
    ) {

        container.innerHTML = `
            <div
                style="
                    padding:25px 0;
                    text-align:center;
                "
            >

                <p>
                    Add your first habit to begin.
                </p>

            </div>
        `;


        return;
    }


    /* =========================
       HABIT LIST
    ========================= */

    container.innerHTML =
        appData.habits
            .map(
                habit => {

                    const completed =
                        getHabitCompletion(
                            habit.id,
                            todayKey()
                        );


                    return `
                        <div
                            class="dashboard-habit-item"
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:space-between;
                                gap:15px;
                                padding:15px 0;
                                border-bottom:
                                    1px solid
                                    var(--border);
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                    gap:13px;
                                "
                            >

                                <div
                                    style="
                                        width:40px;
                                        height:40px;
                                        display:grid;
                                        place-items:center;
                                        flex-shrink:0;
                                        border-radius:12px;
                                        background:
                                            var(--primary-soft);
                                        color:
                                            var(--primary);
                                    "
                                >

                                    <i
                                        class="fa-solid ${
                                            escapeHTML(
                                                habit.icon
                                                || "fa-seedling"
                                            )
                                        }"
                                    ></i>

                                </div>


                                <div>

                                    <strong>
                                        ${
                                            escapeHTML(
                                                habit.name
                                            )
                                        }
                                    </strong>


                                    <p
                                        style="
                                            margin-top:2px;
                                            font-size:12px;
                                        "
                                    >
                                        ${
                                            escapeHTML(
                                                habit.category
                                                || "Lifestyle"
                                            )
                                        }
                                    </p>

                                </div>

                            </div>


                            ${
                                completed

                                    ? `
                                        <button
                                            class="
                                                tracker-check
                                                completed
                                            "
                                            type="button"
                                            disabled
                                            title="Completed"
                                            aria-label="Completed"
                                        >
                                            ✓
                                        </button>
                                    `

                                    : `
                                        <button
                                            class="tracker-check"
                                            type="button"
                                            data-dashboard-complete="${
                                                habit.id
                                            }"
                                            title="Complete habit"
                                            aria-label="Complete ${
                                                escapeHTML(
                                                    habit.name
                                                )
                                            }"
                                        >
                                        </button>
                                    `
                            }

                        </div>
                    `;
                }
            )
            .join("");


    /* =========================
       HABIT COMPLETE EVENTS
    ========================= */

    $$(
        "[data-dashboard-complete]",
        container
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const habitId =
                        button.dataset
                            .dashboardComplete;


                    if (
                        !habitId
                    ) {

                        return;
                    }


                    completeHabit(
                        habitId
                    );
                }
            );
        }
    );
}


/* =========================================================
   DASHBOARD — WEEKLY CHART
========================================================= */

function renderDashboardChart() {

    const canvas =
        $("#dashboardWeeklyChart");


    if (
        !canvas
        ||
        typeof Chart
        === "undefined"
    ) {

        return;
    }


    const labels =
        [];


    const values =
        [];


    const today =
        parseDateKey(
            todayKey()
        );


    /* =========================
       LAST 7 DAYS
    ========================= */

    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const dateKey =
            localDateKey(
                date
            );


        labels.push(

            date.toLocaleDateString(
                "en-IN",
                {
                    weekday:
                        "short"
                }
            )
        );


        values.push(

            getDateCompletionStats(
                dateKey
            ).percentage
        );
    }


    /* =========================
       DESTROY OLD CHART
    ========================= */

    if (
        dashboardChart
    ) {

        dashboardChart.destroy();

        dashboardChart =
            null;
    }


    /* =========================
       GET THEME COLOR
    ========================= */

    const primaryColor =
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(
            "--primary"
        )
        .trim();


    const textColor =
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(
            "--text-soft"
        )
        .trim();


    const borderColor =
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(
            "--border"
        )
        .trim();


    /* =========================
       CREATE CHART
    ========================= */

    dashboardChart =
        new Chart(
            canvas,
            {

                type:
                    "line",


                data: {

                    labels,


                    datasets: [

                        {

                            label:
                                "Completion",


                            data:
                                values,


                            borderColor:
                                primaryColor,


                            backgroundColor:
                                primaryColor,


                            borderWidth:
                                2.5,


                            pointRadius:
                                4,


                            pointHoverRadius:
                                6,


                            pointBackgroundColor:
                                primaryColor,


                            tension:
                                0.4,


                            fill:
                                false
                        }
                    ]
                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    interaction: {

                        intersect:
                            false,


                        mode:
                            "index"
                    },


                    plugins: {

                        legend: {

                            display:
                                false
                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        `${context.raw}% completed`
                            }
                        }
                    },


                    scales: {

                        x: {

                            grid: {

                                display:
                                    false
                            },


                            ticks: {

                                color:
                                    textColor
                            }
                        },


                        y: {

                            beginAtZero:
                                true,


                            max:
                                100,


                            ticks: {

                                stepSize:
                                    25,


                                color:
                                    textColor,


                                callback:
                                    value =>
                                        `${value}%`
                            },


                            grid: {

                                color:
                                    borderColor
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   DASHBOARD — ACTIVITY HEATMAP
========================================================= */

function renderDashboardHeatmap() {

    const container =
        $("#dashboardActivityHeatmap");


    if (
        !container
    ) {

        return;
    }


    let html =
        "";


    const today =
        parseDateKey(
            todayKey()
        );


    /* =========================
       LAST 60 DAYS
    ========================= */

    for (
        let i = 59;
        i >= 0;
        i--
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const dateKey =
            localDateKey(
                date
            );


        const stats =
            getDateCompletionStats(
                dateKey
            );


        let opacity =
            0.08;


        if (
            stats.total > 0
        ) {

            opacity =
                Math.max(

                    0.15,

                    stats.percentage
                    /
                    100
                );
        }


        html += `
            <span
                title="${
                    formatDate(
                        date
                    )
                } · ${
                    stats.percentage
                }%"
                style="
                    background:
                        var(--primary);

                    opacity:
                        ${opacity};
                "
            ></span>
        `;
    }


    container.innerHTML =
        html;
}


/* =========================================================
   DASHBOARD — INTELLIGENCE INSIGHTS
========================================================= */

function renderDashboardInsights() {

    const container =
        $("#dashboardIntelligence");


    if (
        !container
    ) {

        return;
    }


    const consistency =
        calculateThirtyDayAverage();


    const streak =
        calculateCurrentStreak();


    const todayStats =
        getDateCompletionStats(
            todayKey()
        );


    const totalCompletions =
        countAllCompletions();


    let consistencyTitle =
        "Your journey is beginning";


    let consistencyMessage =
        "Build momentum by completing one small habit at a time.";


    if (
        consistency >= 80
    ) {

        consistencyTitle =
            "Excellent consistency";


        consistencyMessage =
            `Your recent 30-day average is ${consistency}%. Keep protecting this rhythm.`;

    } else if (
        consistency >= 60
    ) {

        consistencyTitle =
            "Strong consistency";


        consistencyMessage =
            `Your recent 30-day average is ${consistency}%. Your routine is becoming more stable.`;

    } else if (
        consistency >= 30
    ) {

        consistencyTitle =
            "Momentum is developing";


        consistencyMessage =
            `Your recent 30-day average is ${consistency}%. Repetition will strengthen your routine.`;

    } else if (
        consistency > 0
    ) {

        consistencyTitle =
            "Consistency is still building";


        consistencyMessage =
            `Your recent 30-day average is ${consistency}%. Focus on showing up regularly.`;
    }


    /* =========================
       TODAY MESSAGE
    ========================= */

    let todayTitle =
        "Start today's journey";


    let todayMessage =
        "Complete your first habit today and create momentum.";


    if (
        todayStats.total === 0
    ) {

        todayTitle =
            "Create your first habit";


        todayMessage =
            "Add a habit to begin tracking your personal growth.";

    } else if (
        todayStats.percentage === 100
    ) {

        todayTitle =
            "Perfect day completed";


        todayMessage =
            "Every active habit has been completed today.";

    } else if (
        todayStats.percentage >= 50
    ) {

        todayTitle =
            "You're over halfway there";


        todayMessage =
            `${todayStats.completed} of ${todayStats.total} habits are complete today.`;

    } else if (
        todayStats.completed > 0
    ) {

        todayTitle =
            "Momentum has started";


        todayMessage =
            `${todayStats.completed} of ${todayStats.total} habits are complete today.`;
    }


    /* =========================
       RENDER INSIGHTS
    ========================= */

    container.innerHTML = `

        <div>

            <strong>
                ${consistencyTitle}
            </strong>

            <p>
                ${consistencyMessage}
            </p>

        </div>


        <div>

            <strong>
                ${streak} day current streak
            </strong>

            <p>
                ${
                    streak > 0

                        ? "Keep completing every active habit to protect your streak."

                        : "Complete every active habit in a day to begin a perfect-day streak."
                }
            </p>

        </div>


        <div>

            <strong>
                ${todayTitle}
            </strong>

            <p>
                ${todayMessage}
            </p>

        </div>


        <div>

            <strong>
                ${totalCompletions} total actions
            </strong>

            <p>
                Every completed habit is another step in your growth journey.
            </p>

        </div>
    `;
}
/* =========================================================
   ANALYTICS RANGE SELECTOR
========================================================= */

$$("[data-analytics-days]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const days =
                    Number(
                        button.dataset.analyticsDays
                    );


                if (
                    !Number.isFinite(days)
                    ||
                    days <= 0
                ) {

                    return;
                }


                analyticsDays =
                    days;


                $$("[data-analytics-days]")
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    });


                renderAnalytics();
            }
        );
    });


/* =========================================================
   ANALYTICS MAIN RENDERER
========================================================= */

function renderAnalytics() {

    renderAnalyticsKPIs();

    renderAnalyticsCharts();

    renderAnalyticsRanking();

    renderAnalyticsHeatmap();

    renderAnalyticsInsights();
}


/* =========================================================
   ANALYTICS KPIs
========================================================= */

function renderAnalyticsKPIs() {

    const container =
        $("#analyticsKpiGrid");


    if (
        !container
    ) {

        return;
    }


    const consistency =
        calculateAverageForDays(
            analyticsDays
        );


    const completed =
        countCompletionsForDays(
            analyticsDays
        );


    const streak =
        calculateCurrentStreak();


    const bestDay =
        getBestDayForAnalytics(
            analyticsDays
        );


    container.innerHTML = `

        <article class="kpi-card">

            <small>
                CONSISTENCY
            </small>

            <strong>
                ${consistency}%
            </strong>

            <p>
                Last ${analyticsDays} days
            </p>

        </article>


        <article class="kpi-card">

            <small>
                COMPLETIONS
            </small>

            <strong>
                ${completed}
            </strong>

            <p>
                Total completed habits
            </p>

        </article>


        <article class="kpi-card">

            <small>
                CURRENT STREAK
            </small>

            <strong>
                ${streak} Days
            </strong>

            <p>
                Perfect-day momentum
            </p>

        </article>


        <article class="kpi-card">

            <small>
                BEST DAY
            </small>

            <strong>
                ${bestDay.percentage}%
            </strong>

            <p>
                ${
                    bestDay.date
                        ? formatShortDate(
                            bestDay.date
                        )
                        : "No activity yet"
                }
            </p>

        </article>
    `;
}


/* =========================================================
   ANALYTICS — AVERAGE COMPLETION
========================================================= */

function calculateAverageForDays(
    days
) {

    let total =
        0;


    let count =
        0;


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 0;
        i < days;
        i++
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const dateKey =
            localDateKey(
                date
            );


        const stats =
            getDateCompletionStats(
                dateKey
            );


        if (
            stats.total > 0
        ) {

            total +=
                stats.percentage;


            count++;
        }
    }


    return count > 0

        ? Math.round(
            total / count
        )

        : 0;
}


/* =========================================================
   ANALYTICS — COMPLETION COUNT
========================================================= */

function countCompletionsForDays(
    days
) {

    let total =
        0;


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 0;
        i < days;
        i++
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const dateKey =
            localDateKey(
                date
            );


        const completions =
            appData.completions[
                dateKey
            ]
            || {};


        total +=
            Object.values(
                completions
            )
            .filter(Boolean)
            .length;
    }


    return total;
}


/* =========================================================
   ANALYTICS — BEST DAY
========================================================= */

function getBestDayForAnalytics(
    days
) {

    let bestPercentage =
        0;


    let bestDate =
        null;


    let bestCompleted =
        0;


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 0;
        i < days;
        i++
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const stats =
            getDateCompletionStats(
                localDateKey(
                    date
                )
            );


        if (
            stats.total === 0
        ) {

            continue;
        }


        if (
            stats.percentage
                > bestPercentage

            ||

            (
                stats.percentage
                    === bestPercentage

                &&

                stats.completed
                    > bestCompleted
            )
        ) {

            bestPercentage =
                stats.percentage;


            bestCompleted =
                stats.completed;


            bestDate =
                date;
        }
    }


    return {

        percentage:
            bestPercentage,

        completed:
            bestCompleted,

        date:
            bestDate
    };
}


/* =========================================================
   ANALYTICS CHARTS
========================================================= */

function renderAnalyticsCharts() {

    if (
        typeof Chart
        === "undefined"
    ) {

        return;
    }


    renderAnalyticsTrendChart();

    renderCategoryChart();

    renderWeekdayChart();
}


/* =========================================================
   ANALYTICS — TREND CHART
========================================================= */

function renderAnalyticsTrendChart() {

    const canvas =
        $("#analyticsTrendChart");


    if (
        !canvas
    ) {

        return;
    }


    const labels =
        [];


    const values =
        [];


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = analyticsDays - 1;
        i >= 0;
        i--
    ) {

        const date =
            addDays(
                today,
                -i
            );


        labels.push(
            formatShortDate(
                date
            )
        );


        values.push(

            getDateCompletionStats(

                localDateKey(
                    date
                )

            ).percentage
        );
    }


    if (
        analyticsTrendChart
    ) {

        analyticsTrendChart.destroy();

        analyticsTrendChart =
            null;
    }


    const primaryColor =
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(
            "--primary"
        )
        .trim();


    const textColor =
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(
            "--text-soft"
        )
        .trim();


    const borderColor =
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(
            "--border"
        )
        .trim();


    analyticsTrendChart =
        new Chart(
            canvas,
            {

                type:
                    "line",


                data: {

                    labels,


                    datasets: [

                        {

                            label:
                                "Completion",


                            data:
                                values,


                            borderColor:
                                primaryColor,


                            backgroundColor:
                                primaryColor,


                            borderWidth:
                                2.5,


                            pointRadius:
                                analyticsDays <= 30
                                    ? 3
                                    : 0,


                            pointHoverRadius:
                                5,


                            tension:
                                0.35,


                            fill:
                                false
                        }
                    ]
                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    interaction: {

                        intersect:
                            false,


                        mode:
                            "index"
                    },


                    plugins: {

                        legend: {

                            display:
                                false
                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        `${context.raw}% completed`
                            }
                        }
                    },


                    scales: {

                        x: {

                            grid: {

                                display:
                                    false
                            },


                            ticks: {

                                color:
                                    textColor,


                                maxTicksLimit:
                                    analyticsDays <= 7
                                        ? 7
                                        : analyticsDays <= 30
                                            ? 10
                                            : 12
                            }
                        },


                        y: {

                            beginAtZero:
                                true,


                            max:
                                100,


                            ticks: {

                                stepSize:
                                    25,


                                color:
                                    textColor,


                                callback:
                                    value =>
                                        `${value}%`
                            },


                            grid: {

                                color:
                                    borderColor
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   ANALYTICS — CATEGORY PERFORMANCE
========================================================= */

function renderCategoryChart() {

    const canvas =
        $("#analyticsCategoryChart");


    if (
        !canvas
        ||
        typeof Chart
        === "undefined"
    ) {

        return;
    }


    const categories =
        {};


    const today =
        parseDateKey(
            todayKey()
        );


    appData.habits
        .forEach(
            habit => {

                const category =
                    habit.category
                    || "Lifestyle";


                if (
                    !categories[
                        category
                    ]
                ) {

                    categories[
                        category
                    ] = {

                        possible:
                            0,

                        completed:
                            0
                    };
                }


                for (
                    let i = 0;
                    i < analyticsDays;
                    i++
                ) {

                    const date =
                        addDays(
                            today,
                            -i
                        );


                    const dateKey =
                        localDateKey(
                            date
                        );


                    const createdDate =
                        habit.createdDate
                        || dateKey;


                    if (
                        createdDate
                        > dateKey
                    ) {

                        continue;
                    }


                    categories[
                        category
                    ].possible++;


                    if (
                        getHabitCompletion(
                            habit.id,
                            dateKey
                        )
                    ) {

                        categories[
                            category
                        ].completed++;
                    }
                }
            }
        );


    const labels =
        Object.keys(
            categories
        );


    const values =
        labels.map(
            category => {

                const data =
                    categories[
                        category
                    ];


                if (
                    !data.possible
                ) {

                    return 0;
                }


                return Math.round(

                    data.completed
                    /
                    data.possible
                    *
                    100
                );
            }
        );


    if (
        analyticsCategoryChart
    ) {

        analyticsCategoryChart.destroy();

        analyticsCategoryChart =
            null;
    }


    analyticsCategoryChart =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",


                data: {

                    labels,


                    datasets: [

                        {

                            data:
                                values,


                            borderWidth:
                                2
                        }
                    ]
                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    cutout:
                        "68%",


                    plugins: {

                        legend: {

                            position:
                                "bottom"
                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        `${context.label}: ${context.raw}%`
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   ANALYTICS — WEEKDAY PERFORMANCE
========================================================= */

function renderWeekdayChart() {

    const canvas =
        $("#analyticsWeekdayChart");


    if (
        !canvas
        ||
        typeof Chart
        === "undefined"
    ) {

        return;
    }


    const labels = [

        "Sun",

        "Mon",

        "Tue",

        "Wed",

        "Thu",

        "Fri",

        "Sat"
    ];


    const totals =
        Array(7)
            .fill(0);


    const counts =
        Array(7)
            .fill(0);


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 0;
        i < analyticsDays;
        i++
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const stats =
            getDateCompletionStats(

                localDateKey(
                    date
                )
            );


        if (
            stats.total === 0
        ) {

            continue;
        }


        const weekday =
            date.getDay();


        totals[
            weekday
        ] +=
            stats.percentage;


        counts[
            weekday
        ]++;
    }


    const values =
        totals.map(
            (
                total,
                index
            ) => {

                if (
                    counts[
                        index
                    ] === 0
                ) {

                    return 0;
                }


                return Math.round(

                    total
                    /
                    counts[
                        index
                    ]
                );
            }
        );


    if (
        analyticsWeekdayChart
    ) {

        analyticsWeekdayChart.destroy();

        analyticsWeekdayChart =
            null;
    }


    const primaryColor =
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(
            "--primary"
        )
        .trim();


    analyticsWeekdayChart =
        new Chart(
            canvas,
            {

                type:
                    "bar",


                data: {

                    labels,


                    datasets: [

                        {

                            data:
                                values,


                            backgroundColor:
                                primaryColor,


                            borderRadius:
                                8,


                            borderSkipped:
                                false
                        }
                    ]
                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false
                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        `${context.raw}% average`
                            }
                        }
                    },


                    scales: {

                        x: {

                            grid: {

                                display:
                                    false
                            }
                        },


                        y: {

                            beginAtZero:
                                true,


                            max:
                                100,


                            ticks: {

                                callback:
                                    value =>
                                        `${value}%`
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   ANALYTICS — HABIT RANKING
========================================================= */

function renderAnalyticsRanking() {

    const container =
        $("#analyticsHabitRanking");


    if (
        !container
    ) {

        return;
    }


    if (
        !appData.habits.length
    ) {

        container.innerHTML = `
            <p>
                No habits yet.
            </p>
        `;


        return;
    }


    const today =
        parseDateKey(
            todayKey()
        );


    const ranking =
        appData.habits
            .map(
                habit => {

                    let completed =
                        0;


                    let availableDays =
                        0;


                    for (
                        let i = 0;
                        i < analyticsDays;
                        i++
                    ) {

                        const date =
                            addDays(
                                today,
                                -i
                            );


                        const dateKey =
                            localDateKey(
                                date
                            );


                        const createdDate =
                            habit.createdDate
                            || dateKey;


                        if (
                            createdDate
                            > dateKey
                        ) {

                            continue;
                        }


                        availableDays++;


                        if (
                            getHabitCompletion(
                                habit.id,
                                dateKey
                            )
                        ) {

                            completed++;
                        }
                    }


                    const percentage =
                        availableDays > 0

                            ? Math.round(

                                completed
                                /
                                availableDays
                                *
                                100
                            )

                            : 0;


                    return {

                        habit,

                        completed,

                        availableDays,

                        percentage
                    };
                }
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        b.percentage
                        !==
                        a.percentage
                    ) {

                        return (
                            b.percentage
                            -
                            a.percentage
                        );
                    }


                    return (
                        b.completed
                        -
                        a.completed
                    );
                }
            );


    container.innerHTML =
        ranking
            .map(
                (
                    item,
                    index
                ) => `

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            gap:15px;
                            padding:15px 0;
                            border-bottom:
                                1px solid
                                var(--border);
                        "
                    >

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:12px;
                            "
                        >

                            <strong>
                                ${index + 1}.
                            </strong>


                            <div>

                                <strong>
                                    ${
                                        escapeHTML(
                                            item.habit.name
                                        )
                                    }
                                </strong>


                                <p
                                    style="
                                        font-size:12px;
                                    "
                                >
                                    ${
                                        item.completed
                                    }
                                    completions
                                </p>

                            </div>

                        </div>


                        <strong>
                            ${
                                item.percentage
                            }%
                        </strong>

                    </div>
                `
            )
            .join("");
}


/* =========================================================
   ANALYTICS — 90 DAY HEATMAP
========================================================= */

function renderAnalyticsHeatmap() {

    const container =
        $("#analyticsHeatmap");


    if (
        !container
    ) {

        return;
    }


    let html =
        "";


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 89;
        i >= 0;
        i--
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const stats =
            getDateCompletionStats(

                localDateKey(
                    date
                )
            );


        let opacity =
            0.08;


        if (
            stats.total > 0
        ) {

            opacity =
                Math.max(

                    0.15,

                    stats.percentage
                    /
                    100
                );
        }


        html += `
            <span
                title="${
                    formatDate(
                        date
                    )
                } · ${
                    stats.percentage
                }%"
                style="
                    background:
                        var(--primary);

                    opacity:
                        ${opacity};
                "
            ></span>
        `;
    }


    container.innerHTML =
        html;
}


/* =========================================================
   ANALYTICS — INSIGHTS
========================================================= */

function renderAnalyticsInsights() {

    const consistency =
        calculateAverageForDays(
            analyticsDays
        );


    const completed =
        countCompletionsForDays(
            analyticsDays
        );


    const bestDay =
        getBestDayForAnalytics(
            analyticsDays
        );


    const bestHabit =
        getBestAnalyticsHabit(
            analyticsDays
        );


    const patternContainer =
        $("#analyticsPatterns");


    const intelligenceContainer =
        $("#analyticsIntelligence");


    /* =========================
       PATTERN MESSAGE
    ========================= */

    let patternTitle =
        "Your journey is beginning";


    let patternMessage =
        "Complete your habits regularly to reveal meaningful performance patterns.";


    if (
        consistency >= 80
    ) {

        patternTitle =
            "Highly consistent period";


        patternMessage =
            `You maintained an average completion rate of ${consistency}% across the selected period.`;

    } else if (
        consistency >= 60
    ) {

        patternTitle =
            "Strong momentum";


        patternMessage =
            `Your ${consistency}% average shows that your routine is becoming increasingly stable.`;

    } else if (
        consistency >= 30
    ) {

        patternTitle =
            "Momentum is developing";


        patternMessage =
            `Your average completion is ${consistency}%. More repetition can create a stronger routine.`;

    } else if (
        consistency > 0
    ) {

        patternTitle =
            "More consistency needed";


        patternMessage =
            `Your average completion is ${consistency}%. Focus on fewer habits and repeat them consistently.`;
    }


    if (
        patternContainer
    ) {

        patternContainer.innerHTML = `

            <div>

                <strong>
                    ${patternTitle}
                </strong>

                <p>
                    ${patternMessage}
                </p>

            </div>


            <div>

                <strong>
                    ${completed} actions completed
                </strong>

                <p>
                    Across the last
                    ${analyticsDays}
                    days.
                </p>

            </div>


            ${
                bestDay.date

                    ? `
                        <div>

                            <strong>
                                Best day:
                                ${
                                    formatShortDate(
                                        bestDay.date
                                    )
                                }
                            </strong>

                            <p>
                                ${
                                    bestDay.percentage
                                }%
                                of active habits were completed.
                            </p>

                        </div>
                    `

                    : ""
            }

        `;
    }


    /* =========================
       INTELLIGENCE MESSAGE
    ========================= */

    if (
        intelligenceContainer
    ) {

        intelligenceContainer.innerHTML = `

            <div>

                <strong>
                    ${
                        bestHabit

                            ? `${
                                escapeHTML(
                                    bestHabit.habit.name
                                )
                            } is your strongest habit`

                            : "Focus on repeatability"
                    }
                </strong>


                <p>
                    ${
                        bestHabit

                            ? `You completed it ${bestHabit.completed} times with ${bestHabit.percentage}% consistency during this period.`

                            : "Completing a smaller number of habits consistently is stronger than adding too many at once."
                    }
                </p>

            </div>


            <div>

                <strong>
                    ${
                        consistency >= 70

                            ? "Protect your current rhythm"

                            : "Build a simpler daily system"
                    }
                </strong>


                <p>
                    ${
                        consistency >= 70

                            ? "Your current routine is working. Focus on maintaining it before adding more habits."

                            : "Choose the habits that matter most and make daily completion easier to repeat."
                    }
                </p>

            </div>

        `;
    }
}


/* =========================================================
   ANALYTICS — BEST HABIT
========================================================= */

function getBestAnalyticsHabit(
    days
) {

    if (
        !appData.habits.length
    ) {

        return null;
    }


    const today =
        parseDateKey(
            todayKey()
        );


    const ranking =
        appData.habits
            .map(
                habit => {

                    let completed =
                        0;


                    let availableDays =
                        0;


                    for (
                        let i = 0;
                        i < days;
                        i++
                    ) {

                        const date =
                            addDays(
                                today,
                                -i
                            );


                        const dateKey =
                            localDateKey(
                                date
                            );


                        const createdDate =
                            habit.createdDate
                            || dateKey;


                        if (
                            createdDate
                            > dateKey
                        ) {

                            continue;
                        }


                        availableDays++;


                        if (
                            getHabitCompletion(
                                habit.id,
                                dateKey
                            )
                        ) {

                            completed++;
                        }
                    }


                    const percentage =
                        availableDays > 0

                            ? Math.round(

                                completed
                                /
                                availableDays
                                *
                                100
                            )

                            : 0;


                    return {

                        habit,

                        completed,

                        percentage
                    };
                }
            )
            .filter(
                item =>
                    item.completed > 0
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        b.percentage
                        !==
                        a.percentage
                    ) {

                        return (
                            b.percentage
                            -
                            a.percentage
                        );
                    }


                    return (
                        b.completed
                        -
                        a.completed
                    );
                }
            );


    return (
        ranking[0]
        || null
    );
}
/* =========================================================
   GROWTH PLAN SELECTOR
========================================================= */

$$("[data-plan-length]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const length =
                    Number(
                        button.dataset.planLength
                    );

                if (
                    ![7, 30, 90].includes(length)
                ) {
                    return;
                }

                appData.growth.planLength =
                    length;

                $$("[data-plan-length]")
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    });

                saveData();

                renderGrowth();
            }
        );
    });


/* =========================================================
   START / RESTART GROWTH PLAN
========================================================= */

$("#startGrowthPlanBtn")
    ?.addEventListener(
        "click",
        () => {

            const startPlan = () => {

                appData.growth.startDate =
                    todayKey();

                saveData();

                renderGrowth();

                showToast(
                    `${appData.growth.planLength}-day growth journey started.`
                );
            };


            if (
                appData.growth.startDate
            ) {

                openConfirmation(

                    "Restart your growth journey?",

                    "Your current growth-plan starting date will be replaced with today. Your habits and completion history will remain unchanged.",

                    startPlan
                );

                return;
            }


            startPlan();
        }
    );


/* =========================================================
   GROWTH HELPERS
========================================================= */

function getGrowthPlanStatus() {

    const length =
        Number(
            appData.growth.planLength
        ) || 7;


    if (
        !appData.growth.startDate
    ) {

        return {

            started:
                false,

            completed:
                false,

            length,

            currentDay:
                0,

            elapsedDays:
                0,

            percentage:
                0,

            remainingDays:
                length,

            startDate:
                null,

            endDate:
                null
        };
    }


    const startDate =
        parseDateKey(
            appData.growth.startDate
        );


    const today =
        parseDateKey(
            todayKey()
        );


    const elapsedDays =
        Math.max(
            0,
            Math.floor(
                (
                    today
                    - startDate
                )
                /
                86400000
            )
        );


    const rawDay =
        elapsedDays + 1;


    const currentDay =
        clamp(
            rawDay,
            1,
            length
        );


    const completed =
        rawDay > length;


    const percentage =
        completed
            ? 100
            : Math.round(
                currentDay
                /
                length
                *
                100
            );


    const endDate =
        addDays(
            startDate,
            length - 1
        );


    const remainingDays =
        completed
            ? 0
            : Math.max(
                0,
                length - currentDay
            );


    return {

        started:
            true,

        completed,

        length,

        currentDay,

        elapsedDays,

        percentage,

        remainingDays,

        startDate,

        endDate
    };
}


/* =========================================================
   GROWTH DAY STATS
========================================================= */

function getGrowthDayStats(
    dayNumber
) {

    if (
        !appData.growth.startDate
    ) {

        return null;
    }


    const startDate =
        parseDateKey(
            appData.growth.startDate
        );


    const date =
        addDays(
            startDate,
            dayNumber - 1
        );


    const dateKey =
        localDateKey(
            date
        );


    const stats =
        getDateCompletionStats(
            dateKey
        );


    return {

        date,

        dateKey,

        ...stats
    };
}


/* =========================================================
   GROWTH MAIN RENDERER
========================================================= */

function renderGrowth() {

    $$("[data-plan-length]")
        .forEach(button => {

            button.classList.toggle(

                "active",

                Number(
                    button.dataset.planLength
                )
                ===
                Number(
                    appData.growth.planLength
                )
            );
        });


    const status =
        getGrowthPlanStatus();


    if (
        $("#growthProgressFill")
    ) {

        $("#growthProgressFill")
            .style.width =
            `${status.percentage}%`;
    }


    if (
        $("#growthProgressPercentage")
    ) {

        $("#growthProgressPercentage")
            .textContent =
            `${status.percentage}%`;
    }


    if (
        $("#growthDayProgress")
    ) {

        if (
            !status.started
        ) {

            $("#growthDayProgress")
                .textContent =
                "Not started";

        } else if (
            status.completed
        ) {

            $("#growthDayProgress")
                .textContent =
                `${status.length}-day journey completed`;

        } else {

            $("#growthDayProgress")
                .textContent =
                `Day ${status.currentDay} of ${status.length}`;
        }
    }


    renderGrowthMission(
        status
    );

    renderGrowthRoadmap(
        status
    );
}


/* =========================================================
   GROWTH TODAY MISSION
========================================================= */

function renderGrowthMission(
    status
) {

    const container =
        $("#growthTodayMission");


    if (
        !container
    ) {

        return;
    }


    if (
        !appData.habits.length
    ) {

        container.innerHTML = `
            <div>
                <strong>
                    Build your foundation
                </strong>

                <p>
                    Add your first habit before beginning your growth journey.
                </p>
            </div>
        `;

        return;
    }


    if (
        !status.started
    ) {

        container.innerHTML = `
            <div>
                <strong>
                    Your journey is ready
                </strong>

                <p>
                    Choose a 7, 30 or 90-day plan and start when you are ready.
                </p>
            </div>
        `;

        return;
    }


    if (
        status.completed
    ) {

        const average =
            calculateGrowthPlanAverage(
                status.length
            );


        container.innerHTML = `
            <div>

                <strong>
                    Journey completed
                </strong>

                <p>
                    You finished your
                    ${status.length}-day journey
                    with ${average}% average consistency.
                </p>

            </div>
        `;

        return;
    }


    const todayStats =
        getDateCompletionStats(
            todayKey()
        );


    const remaining =
        Math.max(
            0,
            todayStats.total
            - todayStats.completed
        );


    let title =
        "Show up today";


    let message =
        `Complete your ${remaining} remaining habits and protect your momentum.`;


    if (
        todayStats.total === 0
    ) {

        title =
            "Create your first habit";

        message =
            "Your growth journey becomes meaningful when you have habits to track.";

    } else if (
        todayStats.percentage === 100
    ) {

        title =
            "Today's mission complete";

        message =
            "Every active habit is complete. Your momentum is protected.";

    } else if (
        todayStats.completed > 0
    ) {

        title =
            "Keep moving";

        message =
            `${todayStats.completed} of ${todayStats.total} habits completed today.`;
    }


    container.innerHTML = `
        <div>

            <span class="section-label">
                DAY ${status.currentDay}
            </span>

            <h3>
                ${title}
            </h3>

            <p>
                ${message}
            </p>

        </div>
    `;
}


/* =========================================================
   GROWTH PLAN AVERAGE
========================================================= */

function calculateGrowthPlanAverage(
    length
) {

    if (
        !appData.growth.startDate
    ) {

        return 0;
    }


    const startDate =
        parseDateKey(
            appData.growth.startDate
        );


    const today =
        parseDateKey(
            todayKey()
        );


    let total =
        0;


    let count =
        0;


    for (
        let day = 0;
        day < length;
        day++
    ) {

        const date =
            addDays(
                startDate,
                day
            );


        if (
            date > today
        ) {

            break;
        }


        const stats =
            getDateCompletionStats(

                localDateKey(
                    date
                )
            );


        if (
            stats.total > 0
        ) {

            total +=
                stats.percentage;

            count++;
        }
    }


    return count
        ? Math.round(
            total / count
        )
        : 0;
}


/* =========================================================
   GROWTH ROADMAP
========================================================= */

function renderGrowthRoadmap(
    status
) {

    const container =
        $("#growthRoadmap");


    if (
        !container
    ) {

        return;
    }


    if (
        !status.started
    ) {

        let previewHTML =
            "";


        for (
            let day = 1;
            day <= status.length;
            day++
        ) {

            previewHTML += `
                <div
                    class="growth-roadmap-day"
                    style="
                        padding:14px;
                        border-radius:12px;
                        background:var(--surface-soft);
                    "
                >

                    <strong>
                        Day ${day}
                    </strong>

                    <p>
                        Upcoming
                    </p>

                </div>
            `;
        }


        container.innerHTML =
            previewHTML;

        return;
    }


    const today =
        parseDateKey(
            todayKey()
        );


    let html =
        "";


    for (
        let day = 1;
        day <= status.length;
        day++
    ) {

        const data =
            getGrowthDayStats(
                day
            );


        const isFuture =
            data.date > today;


        const isToday =
            data.dateKey
            === todayKey();


        const completed =
            data.total > 0
            &&
            data.completed
            === data.total;


        const missed =
            data.date < today
            &&
            data.total > 0
            &&
            !completed;


        let state =
            "Upcoming";


        let symbol =
            "·";


        if (
            completed
        ) {

            state =
                "Completed";

            symbol =
                "✓";

        } else if (
            isToday
        ) {

            state =
                `${data.percentage}% today`;

            symbol =
                "●";

        } else if (
            missed
        ) {

            state =
                `${data.percentage}% completed`;

            symbol =
                "✕";

        } else if (
            isFuture
        ) {

            state =
                "Upcoming";
        }


        html += `
            <div
                class="growth-roadmap-day"
                style="
                    padding:14px;
                    border-radius:12px;
                    border:
                        1px solid
                        ${
                            isToday
                                ? "var(--primary)"
                                : "var(--border)"
                        };
                    background:
                        ${
                            completed
                                ? "var(--primary-soft)"
                                : "var(--surface-soft)"
                        };
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:10px;
                    "
                >

                    <div>

                        <strong>
                            Day ${day}
                        </strong>

                        <p>
                            ${
                                formatShortDate(
                                    data.date
                                )
                            }
                        </p>

                    </div>

                    <strong>
                        ${symbol}
                    </strong>

                </div>

                <p
                    style="
                        margin-top:8px;
                    "
                >
                    ${state}
                </p>

            </div>
        `;
    }


    container.innerHTML =
        html;
}


/* =========================================================
   HISTORY NAVIGATION
========================================================= */

$("#historyPreviousMonthBtn")
    ?.addEventListener(
        "click",
        () => {

            historyDate =
                new Date(
                    historyDate.getFullYear(),
                    historyDate.getMonth() - 1,
                    1
                );


            renderHistory();
        }
    );


$("#historyNextMonthBtn")
    ?.addEventListener(
        "click",
        () => {

            const nextMonth =
                new Date(
                    historyDate.getFullYear(),
                    historyDate.getMonth() + 1,
                    1
                );


            const currentMonth =
                new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                );


            if (
                nextMonth > currentMonth
            ) {

                return;
            }


            historyDate =
                nextMonth;


            renderHistory();
        }
    );


/* =========================================================
   HISTORY MAIN RENDERER
========================================================= */

function renderHistory() {

    renderHistoryKPIs();

    renderHistoryCalendar();

    renderHistoryYearHeatmap();

    renderHistoryDetails();
}


/* =========================================================
   HISTORY KPIs
========================================================= */

function renderHistoryKPIs() {

    const container =
        $("#historyKpiGrid");


    if (
        !container
    ) {

        return;
    }


    const totalCompletions =
        countAllCompletions();


    const currentStreak =
        calculateCurrentStreak();


    const average =
        calculateThirtyDayAverage();


    const perfectDays =
        countPerfectDays();


    container.innerHTML = `

        <article class="kpi-card">

            <small>
                TOTAL COMPLETIONS
            </small>

            <strong>
                ${totalCompletions}
            </strong>

            <p>
                All-time actions
            </p>

        </article>


        <article class="kpi-card">

            <small>
                CURRENT STREAK
            </small>

            <strong>
                ${currentStreak}
            </strong>

            <p>
                Perfect days
            </p>

        </article>


        <article class="kpi-card">

            <small>
                PERFECT DAYS
            </small>

            <strong>
                ${perfectDays}
            </strong>

            <p>
                100% completion days
            </p>

        </article>


        <article class="kpi-card">

            <small>
                30 DAY AVERAGE
            </small>

            <strong>
                ${average}%
            </strong>

            <p>
                Recent consistency
            </p>

        </article>
    `;
}


/* =========================================================
   COUNT ALL COMPLETIONS
========================================================= */

function countAllCompletions() {

    return Object.values(
        appData.completions
        || {}
    )
    .reduce(
        (
            total,
            day
        ) => {

            return total
                +
                Object.values(
                    day
                    || {}
                )
                .filter(Boolean)
                .length;
        },
        0
    );
}


/* =========================================================
   COUNT PERFECT DAYS
========================================================= */

function countPerfectDays() {

    if (
        !appData.habits.length
    ) {

        return 0;
    }


    const journeyStart =
        getJourneyStartDate();


    const today =
        parseDateKey(
            todayKey()
        );


    let count =
        0;


    let cursor =
        new Date(
            journeyStart
        );


    while (
        cursor <= today
    ) {

        const stats =
            getDateCompletionStats(

                localDateKey(
                    cursor
                )
            );


        if (
            stats.total > 0
            &&
            stats.completed
            === stats.total
        ) {

            count++;
        }


        cursor =
            addDays(
                cursor,
                1
            );
    }


    return count;
}


/* =========================================================
   HISTORY CALENDAR
========================================================= */

function renderHistoryCalendar() {

    const container =
        $("#historyCalendar");


    if (
        !container
    ) {

        return;
    }


    const year =
        historyDate.getFullYear();


    const month =
        historyDate.getMonth();


    if (
        $("#historyMonthTitle")
    ) {

        $("#historyMonthTitle")
            .textContent =
            historyDate.toLocaleDateString(
                "en-IN",
                {
                    month:
                        "long",

                    year:
                        "numeric"
                }
            );
    }


    const nextButton =
        $("#historyNextMonthBtn");


    if (
        nextButton
    ) {

        const viewedMonth =
            new Date(
                year,
                month,
                1
            );


        const currentMonth =
            new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
            );


        nextButton.disabled =
            viewedMonth >= currentMonth;
    }


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const totalDays =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const today =
        todayKey();


    let html =
        "";


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        html += `
            <div
                class="history-calendar-empty"
            ></div>
        `;
    }


    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateKey =
            localDateKey(
                date
            );


        const stats =
            getDateCompletionStats(
                dateKey
            );


        const isSelected =
            dateKey
            === selectedHistoryDate;


        const isToday =
            dateKey
            === today;


        const isFuture =
            dateKey
            > today;


        const isPerfect =
            stats.total > 0
            &&
            stats.completed
            === stats.total;


        html += `
            <button
                type="button"
                data-history-date="${dateKey}"
                ${isFuture ? "disabled" : ""}
                style="
                    min-height:90px;
                    border:
                        ${
                            isToday
                                ? "2px solid var(--primary)"
                                : "1px solid var(--border)"
                        };
                    border-radius:13px;
                    background:
                        ${
                            isSelected
                                ? "var(--primary-soft)"
                                : "var(--surface)"
                        };
                    color:var(--text);
                    text-align:left;
                    padding:10px;
                    opacity:
                        ${isFuture ? 0.4 : 1};
                    cursor:
                        ${
                            isFuture
                                ? "default"
                                : "pointer"
                        };
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                    "
                >

                    <strong>
                        ${day}
                    </strong>

                    ${
                        isPerfect
                            ? `
                                <span>
                                    ✓
                                </span>
                            `
                            : ""
                    }

                </div>


                <p
                    style="
                        margin-top:15px;
                        font-size:11px;
                    "
                >
                    ${
                        stats.total > 0
                            ? `${stats.completed}/${stats.total} · ${stats.percentage}%`
                            : "No habits"
                    }
                </p>

            </button>
        `;
    }


    container.innerHTML =
        html;


    $$(
        "[data-history-date]",
        container
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        button.disabled
                    ) {

                        return;
                    }


                    selectedHistoryDate =
                        button.dataset.historyDate;


                    renderHistoryCalendar();

                    renderHistoryDetails();
                }
            );
        }
    );
}


/* =========================================================
   HISTORY YEAR HEATMAP
========================================================= */

function renderHistoryYearHeatmap() {

    const container =
        $("#historyYearHeatmap");


    if (
        !container
    ) {

        return;
    }


    let html =
        "";


    const today =
        parseDateKey(
            todayKey()
        );


    for (
        let i = 364;
        i >= 0;
        i--
    ) {

        const date =
            addDays(
                today,
                -i
            );


        const dateKey =
            localDateKey(
                date
            );


        const stats =
            getDateCompletionStats(
                dateKey
            );


        let opacity =
            0.08;


        if (
            stats.total > 0
        ) {

            opacity =
                Math.max(
                    0.15,
                    stats.percentage
                    /
                    100
                );
        }


        html += `
            <span
                title="${
                    formatDate(
                        date
                    )
                } · ${
                    stats.completed
                }/${
                    stats.total
                } · ${
                    stats.percentage
                }%"
                style="
                    background:
                        var(--primary);

                    opacity:
                        ${opacity};
                "
            ></span>
        `;
    }


    container.innerHTML =
        html;
}


/* =========================================================
   HISTORY DETAILS
========================================================= */

function renderHistoryDetails() {

    const selectedDate =
        parseDateKey(
            selectedHistoryDate
        );


    const stats =
        getDateCompletionStats(
            selectedHistoryDate
        );


    const detailsContainer =
        $("#historyDayDetails");


    if (
        detailsContainer
    ) {

        const availableHabits =
            appData.habits
                .filter(
                    habit => {

                        const createdDate =
                            habit.createdDate
                            || selectedHistoryDate;


                        return (
                            createdDate
                            <=
                            selectedHistoryDate
                        );
                    }
                );


        const habitHTML =
            availableHabits.length

                ? availableHabits
                    .map(
                        habit => {

                            const completed =
                                getHabitCompletion(
                                    habit.id,
                                    selectedHistoryDate
                                );


                            return `
                                <div
                                    style="
                                        display:flex;
                                        align-items:center;
                                        justify-content:space-between;
                                        gap:15px;
                                        padding:12px 0;
                                        border-bottom:
                                            1px solid
                                            var(--border);
                                    "
                                >

                                    <span>
                                        ${
                                            escapeHTML(
                                                habit.name
                                            )
                                        }
                                    </span>

                                    <strong>
                                        ${
                                            completed
                                                ? "✓"
                                                : "✕"
                                        }
                                    </strong>

                                </div>
                            `;
                        }
                    )
                    .join("")

                : `
                    <p>
                        No active habits on this date.
                    </p>
                `;


        detailsContainer.innerHTML = `

            <div>

                <strong>
                    ${
                        formatDate(
                            selectedDate
                        )
                    }
                </strong>

                <p>
                    ${stats.completed}
                    of
                    ${stats.total}
                    habits completed ·
                    ${stats.percentage}%
                </p>

            </div>

            <div
                style="
                    margin-top:15px;
                "
            >
                ${habitHTML}
            </div>
        `;
    }


    const monthlyContainer =
        $("#historyMonthlySummary");


    if (
        monthlyContainer
    ) {

        const monthStats =
            getMonthHistoryStats(
                historyDate
            );


        monthlyContainer.innerHTML = `

            <div>

                <strong>
                    ${monthStats.average}%
                </strong>

                <p>
                    Average completion this month.
                </p>

            </div>


            <div
                style="
                    margin-top:15px;
                "
            >

                <strong>
                    ${monthStats.completions}
                </strong>

                <p>
                    Total habit completions.
                </p>

            </div>


            <div
                style="
                    margin-top:15px;
                "
            >

                <strong>
                    ${monthStats.perfectDays}
                </strong>

                <p>
                    Perfect days this month.
                </p>

            </div>

        `;
    }


    renderHistoryHabitRanking();
}


/* =========================================================
   MONTH HISTORY STATS
========================================================= */

function getMonthHistoryStats(
    date
) {

    const year =
        date.getFullYear();


    const month =
        date.getMonth();


    const totalDays =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const today =
        parseDateKey(
            todayKey()
        );


    let percentageTotal =
        0;


    let trackedDays =
        0;


    let completions =
        0;


    let perfectDays =
        0;


    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const currentDate =
            new Date(
                year,
                month,
                day
            );


        if (
            currentDate > today
        ) {

            break;
        }


        const dateKey =
            localDateKey(
                currentDate
            );


        const stats =
            getDateCompletionStats(
                dateKey
            );


        if (
            stats.total === 0
        ) {

            continue;
        }


        trackedDays++;


        percentageTotal +=
            stats.percentage;


        completions +=
            stats.completed;


        if (
            stats.completed
            === stats.total
        ) {

            perfectDays++;
        }
    }


    return {

        average:
            trackedDays
                ? Math.round(
                    percentageTotal
                    /
                    trackedDays
                )
                : 0,

        completions,

        perfectDays,

        trackedDays
    };
}


/* =========================================================
   MONTH AVERAGE
========================================================= */

function calculateMonthAverage(
    date
) {

    return getMonthHistoryStats(
        date
    ).average;
}


/* =========================================================
   HISTORY HABIT RANKING
========================================================= */

function renderHistoryHabitRanking() {

    const container =
        $("#historyHabitRanking");


    if (
        !container
    ) {

        return;
    }


    if (
        !appData.habits.length
    ) {

        container.innerHTML = `
            <p>
                No habit history yet.
            </p>
        `;

        return;
    }


    const year =
        historyDate.getFullYear();


    const month =
        historyDate.getMonth();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const today =
        parseDateKey(
            todayKey()
        );


    const ranking =
        appData.habits
            .map(
                habit => {

                    let completed =
                        0;


                    let available =
                        0;


                    for (
                        let day = 1;
                        day <= daysInMonth;
                        day++
                    ) {

                        const date =
                            new Date(
                                year,
                                month,
                                day
                            );


                        if (
                            date > today
                        ) {

                            break;
                        }


                        const dateKey =
                            localDateKey(
                                date
                            );


                        const createdDate =
                            habit.createdDate
                            || dateKey;


                        if (
                            createdDate
                            > dateKey
                        ) {

                            continue;
                        }


                        available++;


                        if (
                            getHabitCompletion(
                                habit.id,
                                dateKey
                            )
                        ) {

                            completed++;
                        }
                    }


                    const percentage =
                        available
                            ? Math.round(
                                completed
                                /
                                available
                                *
                                100
                            )
                            : 0;


                    return {

                        habit,

                        completed,

                        available,

                        percentage
                    };
                }
            )
            .filter(
                item =>
                    item.available > 0
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        b.percentage
                        !==
                        a.percentage
                    ) {

                        return (
                            b.percentage
                            -
                            a.percentage
                        );
                    }


                    return (
                        b.completed
                        -
                        a.completed
                    );
                }
            );


    container.innerHTML =
        ranking.length

            ? ranking
                .map(
                    (
                        item,
                        index
                    ) => `

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:space-between;
                                gap:15px;
                                padding:12px 0;
                                border-bottom:
                                    1px solid
                                    var(--border);
                            "
                        >

                            <div>

                                <strong>
                                    ${index + 1}.
                                    ${
                                        escapeHTML(
                                            item.habit.name
                                        )
                                    }
                                </strong>

                                <p>
                                    ${
                                        item.completed
                                    }
                                    of
                                    ${
                                        item.available
                                    }
                                    days
                                </p>

                            </div>

                            <strong>
                                ${
                                    item.percentage
                                }%
                            </strong>

                        </div>
                    `
                )
                .join("")

            : `
                <p>
                    No habit activity for this month.
                </p>
            `;
}
/* =========================================================
   PROGRESS PHOTOS
========================================================= */

$("#openAddPhotoBtn")
    ?.addEventListener(
        "click",
        () => {

            openModal(
                "addPhotoModal"
            );
        }
    );


$("#addPhotoForm")
    ?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const fileInput =
                $("#progressPhotoInput");


            const file =
                fileInput
                    ?.files?.[0];


            if (
                !file
            ) {

                showToast(
                    "Choose a photo first."
                );

                return;
            }


            if (
                !file.type
                    .startsWith(
                        "image/"
                    )
            ) {

                showToast(
                    "Please select a valid image."
                );

                return;
            }


            /*
               localStorage has limited space.

               Large images can quickly exceed
               the browser storage limit.
            */

            const maxSize =
                2 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                showToast(
                    "Please choose an image smaller than 2 MB."
                );

                return;
            }


            const reader =
                new FileReader();


            reader.onerror =
                () => {

                    showToast(
                        "Could not read this image."
                    );
                };


            reader.onload =
                () => {

                    try {

                        const photo = {

                            id:
                                uid(),

                            image:
                                reader.result,

                            note:
                                $("#progressPhotoNote")
                                    ?.value
                                    .trim()
                                || "",

                            date:
                                todayKey(),

                            createdAt:
                                new Date()
                                    .toISOString()
                        };


                        appData.photos.unshift(
                            photo
                        );


                        try {

                            saveData();

                        } catch (
                            error
                        ) {

                            /*
                               Remove the photo again
                               if localStorage is full.
                            */

                            appData.photos =
                                appData.photos.filter(
                                    item =>
                                        item.id
                                        !== photo.id
                                );


                            console.error(
                                "Could not save progress photo:",
                                error
                            );


                            showToast(
                                "Storage is full. Try a smaller image or delete an old photo."
                            );

                            return;
                        }


                        event.target.reset();


                        closeModal(
                            "addPhotoModal"
                        );


                        renderPhotos();


                        showToast(
                            "Progress moment saved."
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            "Photo save failed:",
                            error
                        );


                        showToast(
                            "Could not save this photo."
                        );
                    }
                };


            reader.readAsDataURL(
                file
            );
        }
    );


/* =========================================================
   RENDER PROGRESS PHOTOS
========================================================= */

function renderPhotos() {

    const gallery =
        $("#progressPhotoGallery");


    const emptyState =
        $("#progressPhotoEmptyState");


    if (
        !gallery
    ) {

        return;
    }


    if (
        !Array.isArray(
            appData.photos
        )
    ) {

        appData.photos = [];
    }


    if (
        !appData.photos.length
    ) {

        gallery.innerHTML =
            "";


        if (
            emptyState
        ) {

            emptyState.style.display =
                "block";
        }


        return;
    }


    if (
        emptyState
    ) {

        emptyState.style.display =
            "none";
    }


    gallery.innerHTML =
        appData.photos
            .map(
                photo => {

                    let displayDate =
                        photo.date
                        || todayKey();


                    try {

                        displayDate =
                            formatDate(
                                parseDateKey(
                                    displayDate
                                )
                            );

                    } catch (
                        error
                    ) {

                        displayDate =
                            photo.date
                            || "";
                    }


                    return `

                        <article
                            class="content-card progress-photo-card"
                        >

                            <div
                                style="
                                    position:relative;
                                "
                            >

                                <img
                                    src="${
                                        photo.image
                                    }"
                                    alt="Progress moment"
                                    loading="lazy"
                                    style="
                                        width:100%;
                                        aspect-ratio:1/1;
                                        object-fit:cover;
                                        display:block;
                                        border-radius:15px;
                                    "
                                >


                                <button
                                    type="button"
                                    data-delete-photo="${
                                        photo.id
                                    }"
                                    aria-label="Delete progress photo"
                                    title="Delete photo"
                                    style="
                                        position:absolute;
                                        top:12px;
                                        right:12px;
                                        width:38px;
                                        height:38px;
                                        border:none;
                                        border-radius:50%;
                                        background:rgba(20,20,20,.65);
                                        color:white;
                                        display:grid;
                                        place-items:center;
                                        backdrop-filter:blur(8px);
                                    "
                                >

                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>

                                </button>

                            </div>


                            <strong
                                style="
                                    display:block;
                                    margin-top:15px;
                                "
                            >
                                ${
                                    escapeHTML(
                                        displayDate
                                    )
                                }
                            </strong>


                            ${
                                photo.note

                                    ? `
                                        <p
                                            style="
                                                margin-top:7px;
                                            "
                                        >
                                            ${
                                                escapeHTML(
                                                    photo.note
                                                )
                                            }
                                        </p>
                                    `

                                    : `
                                        <p
                                            style="
                                                margin-top:7px;
                                            "
                                        >
                                            A moment from your journey.
                                        </p>
                                    `
                            }

                        </article>
                    `;
                }
            )
            .join("");


    $$(
        "[data-delete-photo]",
        gallery
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const photoId =
                        button.dataset
                            .deletePhoto;


                    deleteProgressPhoto(
                        photoId
                    );
                }
            );
        }
    );
}


/* =========================================================
   DELETE PROGRESS PHOTO
========================================================= */

function deleteProgressPhoto(
    photoId
) {

    const photo =
        appData.photos.find(
            item =>
                item.id
                === photoId
        );


    if (
        !photo
    ) {

        return;
    }


    openConfirmation(

        "Delete this progress moment?",

        "This photo and its note will be permanently removed from this device.",

        () => {

            appData.photos =
                appData.photos.filter(
                    item =>
                        item.id
                        !== photoId
                );


            saveData();


            renderPhotos();


            showToast(
                "Progress photo deleted."
            );
        }
    );
}


/* =========================================================
   ACHIEVEMENT DEFINITIONS
========================================================= */

function getAchievementDefinitions() {

    const totalCompletions =
        countAllCompletions();


    const currentStreak =
        calculateCurrentStreak();


    const perfectDays =
        countPerfectDays();


    const totalFocusMinutes =
        appData.focusSessions
            .reduce(
                (
                    total,
                    session
                ) => {

                    return total
                        +
                        Number(
                            session.minutes
                            || 0
                        );
                },
                0
            );


    const totalFocusSessions =
        appData.focusSessions
            .length;


    const totalHabits =
        appData.habits
            .length;


    const totalPhotos =
        appData.photos
            .length;


    return [

        {
            id:
                "first-step",

            title:
                "First Step",

            description:
                "Complete your first habit.",

            icon:
                "fa-seedling",

            requirement:
                1,

            value:
                totalCompletions,

            unit:
                "completion"
        },


        {
            id:
                "momentum-10",

            title:
                "Building Momentum",

            description:
                "Complete 10 habit actions.",

            icon:
                "fa-bolt",

            requirement:
                10,

            value:
                totalCompletions,

            unit:
                "completions"
        },


        {
            id:
                "actions-50",

            title:
                "Consistency Builder",

            description:
                "Complete 50 habit actions.",

            icon:
                "fa-chart-line",

            requirement:
                50,

            value:
                totalCompletions,

            unit:
                "completions"
        },


        {
            id:
                "actions-100",

            title:
                "Century",

            description:
                "Complete 100 habit actions.",

            icon:
                "fa-award",

            requirement:
                100,

            value:
                totalCompletions,

            unit:
                "completions"
        },


        {
            id:
                "perfect-day",

            title:
                "Perfect Day",

            description:
                "Complete every active habit in one day.",

            icon:
                "fa-circle-check",

            requirement:
                1,

            value:
                perfectDays,

            unit:
                "perfect day"
        },


        {
            id:
                "perfect-seven",

            title:
                "Seven Strong",

            description:
                "Reach a 7-day perfect streak.",

            icon:
                "fa-fire",

            requirement:
                7,

            value:
                currentStreak,

            unit:
                "streak days"
        },


        {
            id:
                "habit-builder",

            title:
                "Habit Builder",

            description:
                "Build a system with 5 active habits.",

            icon:
                "fa-layer-group",

            requirement:
                5,

            value:
                totalHabits,

            unit:
                "habits"
        },


        {
            id:
                "focus-first",

            title:
                "Deep Work",

            description:
                "Complete your first focus session.",

            icon:
                "fa-bullseye",

            requirement:
                1,

            value:
                totalFocusSessions,

            unit:
                "session"
        },


        {
            id:
                "focus-100",

            title:
                "Focused Mind",

            description:
                "Complete 100 minutes of focused work.",

            icon:
                "fa-stopwatch",

            requirement:
                100,

            value:
                totalFocusMinutes,

            unit:
                "minutes"
        },


        {
            id:
                "memory-keeper",

            title:
                "Memory Keeper",

            description:
                "Save your first progress photo.",

            icon:
                "fa-camera",

            requirement:
                1,

            value:
                totalPhotos,

            unit:
                "photo"
        }
    ];
}


/* =========================================================
   ACHIEVEMENT HELPERS
========================================================= */

function isAchievementUnlocked(
    achievement
) {

    return (
        achievement.value
        >=
        achievement.requirement
    );
}


function getAchievementProgress(
    achievement
) {

    if (
        !achievement.requirement
    ) {

        return 0;
    }


    return clamp(

        Math.round(

            achievement.value
            /
            achievement.requirement
            *
            100
        ),

        0,

        100
    );
}


/* =========================================================
   RENDER ACHIEVEMENTS
========================================================= */

function renderAchievements() {

    const grid =
        $("#achievementGrid");


    const hero =
        $("#achievementHeroStats");


    const nextMilestone =
        $("#nextAchievementMilestone");


    if (
        !grid
    ) {

        return;
    }


    const achievements =
        getAchievementDefinitions();


    const unlockedAchievements =
        achievements.filter(
            achievement =>
                isAchievementUnlocked(
                    achievement
                )
        );


    const lockedAchievements =
        achievements.filter(
            achievement =>
                !isAchievementUnlocked(
                    achievement
                )
        );


    const unlockedCount =
        unlockedAchievements.length;


    const totalCount =
        achievements.length;


    const overallPercentage =
        totalCount
            ? Math.round(
                unlockedCount
                /
                totalCount
                *
                100
            )
            : 0;


    if (
        hero
    ) {

        hero.innerHTML = `

            <div
                class="dashboard-kpi-grid"
            >

                <article
                    class="kpi-card"
                >

                    <small>
                        UNLOCKED
                    </small>

                    <strong>
                        ${unlockedCount}
                    </strong>

                    <p>
                        Achievements earned
                    </p>

                </article>


                <article
                    class="kpi-card"
                >

                    <small>
                        TOTAL
                    </small>

                    <strong>
                        ${totalCount}
                    </strong>

                    <p>
                        Available milestones
                    </p>

                </article>


                <article
                    class="kpi-card"
                >

                    <small>
                        COLLECTION
                    </small>

                    <strong>
                        ${overallPercentage}%
                    </strong>

                    <p>
                        Achievement progress
                    </p>

                </article>


                <article
                    class="kpi-card"
                >

                    <small>
                        TOTAL XP
                    </small>

                    <strong>
                        ${appData.xp || 0}
                    </strong>

                    <p>
                        Experience earned
                    </p>

                </article>

            </div>
        `;
    }


    grid.innerHTML =
        achievements
            .map(
                achievement => {

                    const unlocked =
                        isAchievementUnlocked(
                            achievement
                        );


                    const progress =
                        getAchievementProgress(
                            achievement
                        );


                    const currentValue =
                        Math.min(
                            achievement.value,
                            achievement.requirement
                        );


                    return `

                        <article
                            class="content-card achievement-card"
                            style="
                                position:relative;
                                overflow:hidden;
                                opacity:${
                                    unlocked
                                        ? 1
                                        : 0.65
                                };
                            "
                        >

                            ${
                                unlocked

                                    ? `
                                        <span
                                            style="
                                                position:absolute;
                                                top:18px;
                                                right:18px;
                                                font-size:10px;
                                                letter-spacing:1.5px;
                                                color:var(--primary);
                                                font-weight:700;
                                            "
                                        >
                                            UNLOCKED
                                        </span>
                                    `

                                    : `
                                        <span
                                            style="
                                                position:absolute;
                                                top:18px;
                                                right:18px;
                                                font-size:10px;
                                                letter-spacing:1.5px;
                                                color:var(--text-faint);
                                                font-weight:700;
                                            "
                                        >
                                            LOCKED
                                        </span>
                                    `
                            }


                            <div
                                style="
                                    width:55px;
                                    height:55px;
                                    display:grid;
                                    place-items:center;
                                    border-radius:16px;
                                    background:
                                        var(--primary-soft);
                                    color:
                                        var(--primary);
                                    font-size:23px;
                                "
                            >

                                <i
                                    class="fa-solid ${
                                        achievement.icon
                                    }"
                                ></i>

                            </div>


                            <h3
                                style="
                                    margin-top:22px;
                                "
                            >
                                ${
                                    escapeHTML(
                                        achievement.title
                                    )
                                }
                            </h3>


                            <p
                                style="
                                    margin-top:8px;
                                "
                            >
                                ${
                                    escapeHTML(
                                        achievement.description
                                    )
                                }
                            </p>


                            <div
                                style="
                                    margin-top:25px;
                                "
                            >

                                <div
                                    style="
                                        display:flex;
                                        justify-content:space-between;
                                        gap:10px;
                                        font-size:12px;
                                    "
                                >

                                    <span>
                                        Progress
                                    </span>

                                    <strong>
                                        ${
                                            currentValue
                                        }
                                        /
                                        ${
                                            achievement.requirement
                                        }
                                    </strong>

                                </div>


                                <div
                                    style="
                                        height:7px;
                                        margin-top:10px;
                                        border-radius:999px;
                                        overflow:hidden;
                                        background:
                                            var(--surface-deep);
                                    "
                                >

                                    <span
                                        style="
                                            display:block;
                                            width:${
                                                progress
                                            }%;
                                            height:100%;
                                            border-radius:inherit;
                                            background:
                                                var(--primary);
                                        "
                                    ></span>

                                </div>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");


    if (
        nextMilestone
    ) {

        const nextAchievement =
            lockedAchievements
                .sort(
                    (
                        a,
                        b
                    ) => {

                        return (
                            getAchievementProgress(
                                b
                            )
                            -
                            getAchievementProgress(
                                a
                            )
                        );
                    }
                )[0];


        if (
            nextAchievement
        ) {

            const remaining =
                Math.max(
                    0,
                    nextAchievement.requirement
                    -
                    nextAchievement.value
                );


            nextMilestone.innerHTML = `

                <span
                    class="section-label"
                >
                    NEXT MILESTONE
                </span>


                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:18px;
                        margin-top:15px;
                    "
                >

                    <div
                        style="
                            width:55px;
                            height:55px;
                            display:grid;
                            place-items:center;
                            border-radius:16px;
                            background:
                                var(--primary-soft);
                            color:
                                var(--primary);
                            font-size:22px;
                        "
                    >

                        <i
                            class="fa-solid ${
                                nextAchievement.icon
                            }"
                        ></i>

                    </div>


                    <div>

                        <h2>
                            ${
                                escapeHTML(
                                    nextAchievement.title
                                )
                            }
                        </h2>

                        <p>
                            ${remaining}
                            more
                            ${
                                escapeHTML(
                                    nextAchievement.unit
                                )
                            }
                            to unlock.
                        </p>

                    </div>

                </div>


                <div
                    style="
                        height:8px;
                        margin-top:25px;
                        border-radius:999px;
                        overflow:hidden;
                        background:
                            var(--surface-deep);
                    "
                >

                    <span
                        style="
                            display:block;
                            width:${
                                getAchievementProgress(
                                    nextAchievement
                                )
                            }%;
                            height:100%;
                            background:
                                var(--primary);
                            border-radius:inherit;
                        "
                    ></span>

                </div>
            `;

        } else {

            nextMilestone.innerHTML = `

                <span
                    class="section-label"
                >
                    COLLECTION COMPLETE
                </span>

                <h2
                    style="
                        margin-top:12px;
                    "
                >
                    Every current milestone unlocked.
                </h2>

                <p
                    style="
                        margin-top:10px;
                    "
                >
                    Keep building your journey.
                    New milestones can be added as Velora grows.
                </p>
            `;
        }
    }
}
/* =========================================================
   FOCUS MODE
========================================================= */

$$("[data-focus-minutes]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (focusRunning) {
                    showToast(
                        "Pause or reset the current session first."
                    );

                    return;
                }

                const minutes =
                    Number(
                        button.dataset.focusMinutes
                    );

                if (
                    !Number.isFinite(minutes)
                    || minutes <= 0
                ) {
                    return;
                }

                focusSelectedMinutes =
                    minutes;

                focusRemainingSeconds =
                    minutes * 60;

                $$("[data-focus-minutes]")
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    });

                updateFocusTimerDisplay();
            }
        );
    });


/* =========================================================
   UPDATE FOCUS TIMER DISPLAY
========================================================= */

function updateFocusTimerDisplay() {

    focusRemainingSeconds =
        Math.max(
            0,
            focusRemainingSeconds
        );

    const minutes =
        Math.floor(
            focusRemainingSeconds / 60
        );

    const seconds =
        focusRemainingSeconds % 60;

    const display =
        $("#focusTimerDisplay");

    if (display) {

        display.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    document.title =
        focusRunning
            ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} · Velora`
            : "Velora";
}


/* =========================================================
   FOCUS START BUTTON
========================================================= */

$("#focusStartBtn")
    ?.addEventListener(
        "click",
        () => {

            if (focusRunning) {

                pauseFocus();

                return;
            }

            startFocus();
        }
    );


/* =========================================================
   START FOCUS SESSION
========================================================= */

function startFocus() {

    /*
       Prevent duplicate intervals.
    */

    if (focusRunning) {
        return;
    }

    if (
        focusRemainingSeconds <= 0
    ) {

        focusRemainingSeconds =
            focusSelectedMinutes * 60;
    }

    focusRunning =
        true;

    const startButton =
        $("#focusStartBtn");

    if (startButton) {

        startButton.textContent =
            "Pause";
    }

    clearInterval(
        focusTimerInterval
    );

    focusTimerInterval =
        setInterval(
            () => {

                if (
                    !focusRunning
                ) {
                    return;
                }

                focusRemainingSeconds =
                    Math.max(
                        0,
                        focusRemainingSeconds - 1
                    );

                updateFocusTimerDisplay();

                if (
                    focusRemainingSeconds <= 0
                ) {

                    completeFocusSession();
                }

            },
            1000
        );
}


/* =========================================================
   PAUSE FOCUS SESSION
========================================================= */

function pauseFocus() {

    if (
        !focusRunning
    ) {
        return;
    }

    focusRunning =
        false;

    clearInterval(
        focusTimerInterval
    );

    focusTimerInterval =
        null;

    const startButton =
        $("#focusStartBtn");

    if (startButton) {

        startButton.textContent =
            "Continue";
    }

    updateFocusTimerDisplay();
}


/* =========================================================
   RESET FOCUS SESSION
========================================================= */

$("#focusResetBtn")
    ?.addEventListener(
        "click",
        () => {

            clearInterval(
                focusTimerInterval
            );

            focusTimerInterval =
                null;

            focusRunning =
                false;

            focusRemainingSeconds =
                focusSelectedMinutes * 60;

            const startButton =
                $("#focusStartBtn");

            if (startButton) {

                startButton.textContent =
                    "Start";
            }

            updateFocusTimerDisplay();

            showToast(
                "Focus timer reset."
            );
        }
    );


/* =========================================================
   COMPLETE FOCUS SESSION
========================================================= */

function completeFocusSession() {

    /*
       Clear timer immediately so this function
       cannot run twice.
    */

    clearInterval(
        focusTimerInterval
    );

    focusTimerInterval =
        null;

    if (
        !focusRunning
        && focusRemainingSeconds > 0
    ) {
        return;
    }

    focusRunning =
        false;

    const task =
        $("#focusTaskInput")
            ?.value
            .trim()
        || "Focus Session";

    const habitId =
        $("#focusHabitSelect")
            ?.value
        || "";

    const earnedXP =
        Math.max(
            5,
            Math.floor(
                focusSelectedMinutes / 5
            )
        );

    const session = {

        id:
            uid(),

        date:
            todayKey(),

        createdAt:
            new Date()
                .toISOString(),

        minutes:
            focusSelectedMinutes,

        task,

        habitId
    };

    if (
        !Array.isArray(
            appData.focusSessions
        )
    ) {

        appData.focusSessions =
            [];
    }

    appData.focusSessions.unshift(
        session
    );

    appData.xp =
        Number(
            appData.xp || 0
        )
        +
        earnedXP;

    saveData();

    focusRemainingSeconds =
        focusSelectedMinutes * 60;

    const startButton =
        $("#focusStartBtn");

    if (startButton) {

        startButton.textContent =
            "Start";
    }

    const taskInput =
        $("#focusTaskInput");

    if (taskInput) {

        taskInput.value =
            "";
    }

    updateFocusTimerDisplay();

    renderFocus();

    updateXPUI();

    showToast(
        `Focus session completed · +${earnedXP} XP.`
    );
}


/* =========================================================
   RENDER FOCUS PAGE
========================================================= */

function renderFocus() {

    renderFocusHabitSelect();

    renderFocusTodayStats();

    renderFocusHistory();

    updateFocusTimerDisplay();
}


/* =========================================================
   FOCUS HABIT SELECT
========================================================= */

function renderFocusHabitSelect() {

    const select =
        $("#focusHabitSelect");

    if (!select) {
        return;
    }

    const selectedValue =
        select.value;

    select.innerHTML = `

        <option value="">
            General Focus
        </option>

        ${
            appData.habits
                .map(
                    habit => `
                        <option
                            value="${habit.id}"
                        >
                            ${
                                escapeHTML(
                                    habit.name
                                )
                            }
                        </option>
                    `
                )
                .join("")
        }
    `;

    const stillExists =
        appData.habits.some(
            habit =>
                habit.id === selectedValue
        );

    select.value =
        stillExists
            ? selectedValue
            : "";
}


/* =========================================================
   FOCUS TODAY STATS
========================================================= */

function renderFocusTodayStats() {

    const todaySessions =
        appData.focusSessions
            .filter(
                session =>
                    session.date
                    === todayKey()
            );

    const totalMinutes =
        todaySessions.reduce(
            (
                total,
                session
            ) =>
                total
                +
                Number(
                    session.minutes || 0
                ),
            0
        );

    if (
        $("#focusTodayMinutes")
    ) {

        $("#focusTodayMinutes")
            .textContent =
            totalMinutes;
    }

    if (
        $("#focusTodaySessions")
    ) {

        $("#focusTodaySessions")
            .textContent =
            todaySessions.length;
    }
}


/* =========================================================
   FOCUS SESSION HISTORY
========================================================= */

function renderFocusHistory() {

    const history =
        $("#focusSessionHistory");

    if (!history) {
        return;
    }

    if (
        !appData.focusSessions.length
    ) {

        history.innerHTML = `
            <p>
                No focus sessions yet.
            </p>
        `;

        return;
    }

    history.innerHTML =
        appData.focusSessions
            .slice(0, 15)
            .map(
                session => {

                    const relatedHabit =
                        appData.habits.find(
                            habit =>
                                habit.id
                                === session.habitId
                        );

                    let displayDate =
                        session.date;

                    try {

                        displayDate =
                            formatDate(
                                parseDateKey(
                                    session.date
                                )
                            );

                    } catch (error) {

                        displayDate =
                            session.date;
                    }

                    return `

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:space-between;
                                gap:20px;
                                padding:16px 0;
                                border-bottom:
                                    1px solid
                                    var(--border);
                            "
                        >

                            <div>

                                <strong>
                                    ${
                                        escapeHTML(
                                            session.task
                                            || "Focus Session"
                                        )
                                    }
                                </strong>

                                <p>
                                    ${
                                        escapeHTML(
                                            displayDate
                                        )
                                    }

                                    ${
                                        relatedHabit
                                            ? ` · ${
                                                escapeHTML(
                                                    relatedHabit.name
                                                )
                                            }`
                                            : ""
                                    }
                                </p>

                            </div>

                            <strong>
                                ${
                                    Number(
                                        session.minutes
                                        || 0
                                    )
                                }
                                min
                            </strong>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   SETTINGS TABS
========================================================= */

$$(".settings-tab")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tab =
                    button.dataset.settingsTab;

                if (!tab) {
                    return;
                }

                $$(".settings-tab")
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    });

                $$(".settings-panel")
                    .forEach(panel => {

                        panel.classList.toggle(
                            "active",
                            panel.dataset.settingsPanel
                            === tab
                        );
                    });
            }
        );
    });


/* =========================================================
   RENDER SETTINGS
========================================================= */

function renderSettings() {

    const displayName =
        $("#settingsDisplayName");

    const email =
        $("#settingsEmail");

    const goal =
        $("#settingsGoal");

    const animations =
        $("#settingsAnimations");

    const motivation =
        $("#settingsMotivation");

    const focusSounds =
        $("#settingsFocusSounds");


    if (displayName) {

        displayName.value =
            appData.account.name
            || "";
    }


    if (email) {

        email.value =
            appData.account.email
            || "";
    }


    if (goal) {

        goal.value =
            appData.profile.goal
            || "";
    }


    if (animations) {

        animations.checked =
            Boolean(
                appData.preferences.animations
            );
    }


    if (motivation) {

        motivation.checked =
            Boolean(
                appData.preferences.motivation
            );
    }


    if (focusSounds) {

        focusSounds.checked =
            Boolean(
                appData.preferences.focusSounds
            );
    }


    $$(".theme-option")
        .forEach(option => {

            option.classList.toggle(
                "active",
                option.dataset.themeOption
                ===
                appData.preferences.theme
            );
        });


    updateUserUI();
}


/* =========================================================
   SETTINGS PROFILE SAVE
========================================================= */

$("#settingsProfileForm")
    ?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const name =
                $("#settingsDisplayName")
                    ?.value
                    .trim();

            const goal =
                $("#settingsGoal")
                    ?.value
                    .trim()
                || "";

            if (!name) {

                showToast(
                    "Display name cannot be empty."
                );

                return;
            }

            if (
                name.length > 50
            ) {

                showToast(
                    "Display name is too long."
                );

                return;
            }

            appData.account.name =
                name;

            appData.profile.goal =
                goal;

            saveData();

            updateUserUI();

            renderDashboard();

            showToast(
                "Profile changes saved."
            );
        }
    );


/* =========================================================
   SETTINGS THEME
========================================================= */

$$(".theme-option")
    .forEach(option => {

        option.addEventListener(
            "click",
            () => {

                const theme =
                    option.dataset.themeOption;

                if (
                    ![
                        "light",
                        "dark",
                        "system"
                    ].includes(theme)
                ) {

                    return;
                }

                appData.preferences.theme =
                    theme;

                saveData();

                applyTheme();

                renderSettings();

                /*
                   Re-render charts because their colors
                   may depend on the active theme.
                */

                if (
                    currentRoute
                    === "dashboard"
                ) {

                    renderDashboardChart();
                }

                if (
                    currentRoute
                    === "analytics"
                ) {

                    renderAnalyticsCharts();
                }

                showToast(
                    `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme selected.`
                );
            }
        );
    });


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme() {

    const preference =
        appData.preferences.theme
        || "light";

    let activeTheme =
        preference;

    if (
        preference === "system"
    ) {

        activeTheme =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";
    }

    if (
        ![
            "light",
            "dark"
        ].includes(activeTheme)
    ) {

        activeTheme =
            "light";
    }

    document
        .documentElement
        .setAttribute(
            "data-theme",
            activeTheme
        );

    document
        .documentElement
        .classList
        .toggle(
            "animations-disabled",
            !appData.preferences.animations
        );
}


/* =========================================================
   SYSTEM THEME CHANGE
========================================================= */

const systemThemeMedia =
    window.matchMedia(
        "(prefers-color-scheme: dark)"
    );


systemThemeMedia
    .addEventListener?.(
        "change",
        () => {

            if (
                appData.preferences.theme
                !== "system"
            ) {

                return;
            }

            applyTheme();

            if (
                currentRoute
                === "dashboard"
            ) {

                renderDashboardChart();
            }

            if (
                currentRoute
                === "analytics"
            ) {

                renderAnalyticsCharts();
            }
        }
    );


/* =========================================================
   SETTINGS — ANIMATIONS
========================================================= */

$("#settingsAnimations")
    ?.addEventListener(
        "change",
        event => {

            appData.preferences.animations =
                Boolean(
                    event.target.checked
                );

            saveData();

            applyTheme();

            showToast(
                event.target.checked
                    ? "Animations enabled."
                    : "Animations disabled."
            );
        }
    );


/* =========================================================
   SETTINGS — MOTIVATION
========================================================= */

$("#settingsMotivation")
    ?.addEventListener(
        "change",
        event => {

            appData.preferences.motivation =
                Boolean(
                    event.target.checked
                );

            saveData();

            showToast(
                event.target.checked
                    ? "Motivation messages enabled."
                    : "Motivation messages disabled."
            );
        }
    );


/* =========================================================
   SETTINGS — FOCUS SOUNDS
========================================================= */

$("#settingsFocusSounds")
    ?.addEventListener(
        "change",
        event => {

            appData.preferences.focusSounds =
                Boolean(
                    event.target.checked
                );

            saveData();

            showToast(
                event.target.checked
                    ? "Focus sounds enabled."
                    : "Focus sounds disabled."
            );
        }
    );
    /* =========================================================
   SETTINGS EXPORT
========================================================= */

$("#settingsExportDataBtn")
    ?.addEventListener(
        "click",
        () => {

            try {

                const backup = {
                    exportedAt:
                        new Date()
                            .toISOString(),

                    app:
                        "Velora",

                    version:
                        1,

                    data:
                        appData
                };


                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                backup,
                                null,
                                2
                            )
                        ],
                        {
                            type:
                                "application/json"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const anchor =
                    document.createElement(
                        "a"
                    );


                anchor.href =
                    url;


                anchor.download =
                    `velora-backup-${todayKey()}.json`;


                document.body
                    .appendChild(
                        anchor
                    );


                anchor.click();


                anchor.remove();


                setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    100
                );


                showToast(
                    "Velora data exported successfully."
                );

            } catch (error) {

                console.error(
                    "Velora export failed:",
                    error
                );


                showToast(
                    "Could not export your data."
                );
            }
        }
    );


/* =========================================================
   CONFIRMATION MODAL
========================================================= */

function openConfirmation(
    title,
    message,
    callback
) {

    confirmationCallback =
        typeof callback === "function"
            ? callback
            : null;


    const titleElement =
        $("#confirmationModalTitle");


    const messageElement =
        $("#confirmationModalMessage");


    if (titleElement) {

        titleElement.textContent =
            title;
    }


    if (messageElement) {

        messageElement.textContent =
            message;
    }


    openModal(
        "confirmationModal"
    );
}


/* =========================================================
   CONFIRMATION CANCEL
========================================================= */

$("#confirmationCancelBtn")
    ?.addEventListener(
        "click",
        () => {

            confirmationCallback =
                null;


            closeModal(
                "confirmationModal"
            );
        }
    );


/* =========================================================
   CONFIRMATION CONFIRM
========================================================= */

$("#confirmationConfirmBtn")
    ?.addEventListener(
        "click",
        () => {

            const callback =
                confirmationCallback;


            confirmationCallback =
                null;


            closeModal(
                "confirmationModal"
            );


            if (
                typeof callback
                === "function"
            ) {

                callback();
            }
        }
    );


/* =========================================================
   RESET PROGRESS
========================================================= */

$("#settingsResetProgressBtn")
    ?.addEventListener(
        "click",
        () => {

            openConfirmation(

                "Reset your progress?",

                "Your habits and account will remain, but all completions, XP, focus history and growth progress will be permanently cleared.",

                () => {

                    /*
                       Keep:
                       - Account
                       - Profile
                       - Habits
                       - Photos
                       - Preferences

                       Reset:
                       - Habit completions
                       - Focus sessions
                       - XP
                       - Growth journey
                    */

                    appData.completions =
                        {};


                    appData.focusSessions =
                        [];


                    appData.xp =
                        0;


                    appData.growth.startDate =
                        null;


                    /*
                       Reset temporary UI state.
                    */

                    trackerWindowOffset =
                        0;


                    analyticsDays =
                        30;


                    selectedHistoryDate =
                        todayKey();


                    historyDate =
                        new Date();


                    clearInterval(
                        focusTimerInterval
                    );


                    focusTimerInterval =
                        null;


                    focusRunning =
                        false;


                    focusRemainingSeconds =
                        focusSelectedMinutes
                        * 60;


                    saveData();


                    updateFocusTimerDisplay();


                    renderAll();


                    showToast(
                        "Your progress has been reset."
                    );
                }
            );
        }
    );


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    /*
       Stop any active focus timer before logout.
    */

    clearInterval(
        focusTimerInterval
    );


    focusTimerInterval =
        null;


    focusRunning =
        false;


    focusRemainingSeconds =
        focusSelectedMinutes
        * 60;


    appData.account.signedIn =
        false;


    saveData();


    document.title =
        "Velora";


    showEntryView(
        "landingView"
    );


    showToast(
        "Signed out successfully."
    );
}


/* =========================================================
   SIDEBAR LOGOUT
========================================================= */

$("#logoutBtn")
    ?.addEventListener(
        "click",
        logout
    );


/* =========================================================
   SETTINGS LOGOUT
========================================================= */

$("#settingsLogoutBtn")
    ?.addEventListener(
        "click",
        logout
    );


/* =========================================================
   DELETE ACCOUNT
========================================================= */

$("#settingsDeleteAccountBtn")
    ?.addEventListener(
        "click",
        () => {

            openConfirmation(

                "Delete your Velora account?",

                "This permanently deletes your local account, habits, history, progress photos, focus sessions, XP and all Velora data stored on this device.",

                () => {

                    /*
                       Stop active focus timer.
                    */

                    clearInterval(
                        focusTimerInterval
                    );


                    focusTimerInterval =
                        null;


                    focusRunning =
                        false;


                    /*
                       Remove stored Velora data.
                    */

                    localStorage.removeItem(
                        STORAGE_KEY
                    );


                    /*
                       Restore clean default state.
                    */

                    appData =
                        structuredClone(
                            defaultData
                        );


                    /*
                       Reset global UI state.
                    */

                    currentRoute =
                        "dashboard";


                    onboardingStep =
                        1;


                    selectedStarterHabits =
                        [];


                    trackerWindowOffset =
                        0;


                    analyticsDays =
                        30;


                    historyDate =
                        new Date();


                    selectedHistoryDate =
                        todayKey();


                    confirmationCallback =
                        null;


                    focusSelectedMinutes =
                        25;


                    focusRemainingSeconds =
                        25 * 60;


                    /*
                       Destroy existing charts.
                    */

                    dashboardChart
                        ?.destroy();


                    analyticsTrendChart
                        ?.destroy();


                    analyticsCategoryChart
                        ?.destroy();


                    analyticsWeekdayChart
                        ?.destroy();


                    dashboardChart =
                        null;


                    analyticsTrendChart =
                        null;


                    analyticsCategoryChart =
                        null;


                    analyticsWeekdayChart =
                        null;


                    /*
                       Reset UI.
                    */

                    document.title =
                        "Velora";


                    applyTheme();


                    updateFocusTimerDisplay();


                    showEntryView(
                        "landingView"
                    );


                    showToast(
                        "Velora account deleted."
                    );
                }
            );
        }
    );


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    const modal =
        $(`#${id}`);


    if (!modal) {

        return;
    }


    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
       Prevent background page scrolling
       while a modal is open.
    */

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(id) {

    const modal =
        $(`#${id}`);


    if (!modal) {

        return;
    }


    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
       Restore scrolling only when
       no other modal is open.
    */

    if (
        !$(".modal-overlay.open")
    ) {

        document.body.style.overflow =
            "";
    }


    /*
       Clear confirmation callback
       if confirmation modal is closed
       without using confirm.
    */

    if (
        id === "confirmationModal"
        &&
        !modal.classList.contains(
            "open"
        )
    ) {

        /*
           Do not force clear here because
           the confirm button stores the
           callback before closing.
        */
    }
}


/* =========================================================
   MODAL CLOSE BUTTONS
========================================================= */

$$("[data-close-modal]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const modalId =
                    button.dataset
                        .closeModal;


                if (!modalId) {

                    return;
                }


                if (
                    modalId
                    === "confirmationModal"
                ) {

                    confirmationCallback =
                        null;
                }


                closeModal(
                    modalId
                );
            }
        );
    });


/* =========================================================
   CLOSE MODAL BY CLICKING OVERLAY
========================================================= */

$$(".modal-overlay")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target
                    !== modal
                ) {

                    return;
                }


                if (
                    modal.id
                    === "confirmationModal"
                ) {

                    confirmationCallback =
                        null;
                }


                closeModal(
                    modal.id
                );
            }
        );
    });


/* =========================================================
   ESCAPE KEY MODAL CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key
            !== "Escape"
        ) {

            return;
        }


        $$(".modal-overlay.open")
            .forEach(
                modal => {

                    if (
                        modal.id
                        === "confirmationModal"
                    ) {

                        confirmationCallback =
                            null;
                    }


                    closeModal(
                        modal.id
                    );
                }
            );
    }
);


/* =========================================================
   CURRENT PAGE RENDERER
========================================================= */

function renderCurrentPage() {

    updateUserUI();


    switch (
        currentRoute
    ) {

        case "dashboard":

            renderDashboard();

            break;


        case "habits":

            renderHabitsPage();

            break;


        case "analytics":

            renderAnalytics();

            break;


        case "growth":

            renderGrowth();

            break;


        case "history":

            renderHistory();

            break;


        case "photos":

            renderPhotos();

            break;


        case "achievements":

            renderAchievements();

            break;


        case "focus":

            renderFocus();

            break;


        case "settings":

            renderSettings();

            break;


        default:

            currentRoute =
                "dashboard";


            renderDashboard();

            break;
    }
}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderAll() {

    updateUserUI();


    /*
       Render only the currently visible page.

       This avoids unnecessary Chart.js
       rendering on hidden canvas elements.
    */

    renderCurrentPage();
}


/* =========================================================
   WINDOW RESIZE
========================================================= */

let resizeTimer =
    null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    /*
                       Close mobile sidebar when
                       returning to desktop width.
                    */

                    if (
                        window.innerWidth > 980
                    ) {

                        $("#sidebar")
                            ?.classList
                            .remove(
                                "mobile-open"
                            );
                    }

                },
                150
            );
    }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        /*
           The current timer uses setInterval.

           Browsers may throttle timers in
           background tabs.

           We keep the session running but
           update the visible display whenever
           the user returns.
        */

        if (
            !document.hidden
        ) {

            updateFocusTimerDisplay();
        }
    }
);


/* =========================================================
   INITIALIZE APP
========================================================= */

function initializeVelora() {

    /*
       Apply saved appearance before
       displaying the application.
    */

    applyTheme();


    /*
       Initialize timer display.
    */

    updateFocusTimerDisplay();


    /*
       Ensure arrays and objects exist
       even when loading an older save.
    */

    if (
        !Array.isArray(
            appData.habits
        )
    ) {

        appData.habits =
            [];
    }


    if (
        !appData.completions
        ||
        typeof appData.completions
        !== "object"
    ) {

        appData.completions =
            {};
    }


    if (
        !Array.isArray(
            appData.photos
        )
    ) {

        appData.photos =
            [];
    }


    if (
        !Array.isArray(
            appData.focusSessions
        )
    ) {

        appData.focusSessions =
            [];
    }


    appData.xp =
        Number(
            appData.xp || 0
        );


    /*
       Save normalized data.
    */

    saveData();


    /*
       Existing signed-in user.
    */

    if (
        appData.account.created
        &&
        appData.account.onboarded
        &&
        appData.account.signedIn
    ) {

        enterApp(
            "dashboard"
        );


        return;
    }


    /*
       Account exists but user is
       currently signed out.
    */

    if (
        appData.account.created
        &&
        appData.account.onboarded
        &&
        !appData.account.signedIn
    ) {

        showEntryView(
            "landingView"
        );


        return;
    }


    /*
       Account was created but onboarding
       was not completed.

       Send user back to onboarding instead
       of losing their setup progress.
    */

    if (
        appData.account.created
        &&
        !appData.account.onboarded
        &&
        appData.account.signedIn
    ) {

        onboardingStep =
            1;


        const onboardingName =
            $("#onboardingName");


        if (
            onboardingName
        ) {

            onboardingName.value =
                appData.account.name
                || "";
        }


        showEntryView(
            "onboardingView"
        );


        renderOnboarding();


        return;
    }


    /*
       Brand-new user.
    */

    showEntryView(
        "landingView"
    );
}


/* =========================================================
   START VELORA
========================================================= */

initializeVelora();