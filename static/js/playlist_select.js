/* =========================================================
   PURANE NAGME
   PLAYLIST SELECTION
========================================================= */

const API_URL = "/api/playlists/";


document.addEventListener(
    "DOMContentLoaded",
    loadPlaylists
);


/* =========================================================
   LOAD PLAYLISTS
========================================================= */

async function loadPlaylists() {

    const grid =
        document.getElementById(
            "playlistGrid"
        );


    if (!grid) {
        return;
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `API returned ${response.status}`
            );

        }


        const data =
            await response.json();


        const playlists =
            Array.isArray(data)
                ? data
                : Array.isArray(data.results)
                    ? data.results
                    : [];


        if (!playlists.length) {

            grid.innerHTML = `
                <div class="loading">
                    No playlists found.
                </div>
            `;

            return;
        }


        grid.innerHTML = "";


        playlists.forEach(
            createPlaylistCard
        );

    }

    catch (error) {

        console.error(
            "Failed to load playlists:",
            error
        );


        grid.innerHTML = `
            <div class="loading">
                Failed to load playlists.
            </div>
        `;

    }

}


/* =========================================================
   CREATE CARD
========================================================= */

function createPlaylistCard(
    playlist
) {

    const grid =
        document.getElementById(
            "playlistGrid"
        );


    if (!grid) {
        return;
    }


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "playlist-card";


    card.dataset.playlistId =
    String(playlist.id);    


    /*
     * Makes the card keyboard accessible.
     * No visible Enter button.
     */

    card.tabIndex = 0;


    const cover =
        document.createElement(
            "div"
        );


    cover.className =
        "playlist-cover";


    const image =
        document.createElement(
            "img"
        );


    image.src =
        playlist.cover_url || "";


    image.alt =
        playlist.title ||
        "Playlist";


    image.loading =
        "eager";


    cover.appendChild(
        image
    );


    const name =
        document.createElement(
            "div"
        );


    name.className =
        "playlist-name";


    name.textContent =
        playlist.title ||
        "Untitled Playlist";


    card.appendChild(
        cover
    );


    card.appendChild(
        name
    );


    /* =====================================================
       CLICK / TAP = ENTER PLAYLIST
    ===================================================== */

    card.addEventListener(
        "click",
        () => {

            enterPlaylist(
                playlist
            );

        }
    );


    /* =====================================================
       KEYBOARD ENTER
       Optional accessibility.
       No visible button.
    ===================================================== */

    card.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                enterPlaylist(
                    playlist
                );

            }

        }
    );


    grid.appendChild(
        card
    );

}


/* =========================================================
   ENTER PLAYLIST
========================================================= */
function enterPlaylist(playlist) {

    if (
        !playlist ||
        !playlist.id
    ) {
        return;
    }


    const card =
        document.querySelector(
            `.playlist-card[data-playlist-id="${playlist.id}"]`
        );


    /* =========================================
       SELECT CARD
    ========================================= */

    if (card) {

        card.classList.add(
            "selected"
        );

    }


    /* =========================================
       DIM OTHER CARDS
    ========================================= */

    document
        .querySelectorAll(
            ".playlist-card"
        )
        .forEach(
            otherCard => {

                if (
                    otherCard !== card
                ) {

                    otherCard.classList.add(
                        "not-selected"
                    );

                }

            }
        );


    /* =========================================
       SAVE SELECTED PLAYLIST
    ========================================= */

    sessionStorage.setItem(
        "selectedPlaylistId",
        String(playlist.id)
    );


    /* =========================================
       START EXIT ANIMATION
    ========================================= */

    const page =
        document.querySelector(
            ".selection-page"
        );


    if (page) {

        page.classList.add(
            "leaving"
        );

    }


    /* =========================================
       WAIT 2 SECONDS
    ========================================= */

    setTimeout(
        () => {

            window.location.href =
                `/playlist/${playlist.id}/`;

        },
        800
    );

}


/* =========================================================
   MOBILE CAROUSEL — ACTIVE CENTER CARD
========================================================= */

const playlistGrid =
    document.getElementById(
        "playlistGrid"
    );


function updateCarouselActiveCard() {

    if (!playlistGrid) {
        return;
    }


    const cards =
        playlistGrid.querySelectorAll(
            ".playlist-card"
        );


    if (!cards.length) {
        return;
    }


    const gridRect =
        playlistGrid.getBoundingClientRect();


    const centerX =
        gridRect.left +
        (gridRect.width / 2);


    let closestCard = null;

    let closestDistance = Infinity;


    cards.forEach(
        card => {

            const rect =
                card.getBoundingClientRect();


            const cardCenter =
                rect.left +
                (rect.width / 2);


            const distance =
                Math.abs(
                    centerX -
                    cardCenter
                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closestCard =
                    card;

            }

        }
    );


    cards.forEach(
        card => {

            card.classList.toggle(
                "carousel-active",
                card === closestCard
            );

        }
    );

}


/* =========================================================
   UPDATE WHILE SWIPING
========================================================= */

let carouselScrollTimer = null;


if (playlistGrid) {

    playlistGrid.addEventListener(
        "scroll",
        () => {

            updateCarouselActiveCard();


            clearTimeout(
                carouselScrollTimer
            );


            carouselScrollTimer =
                setTimeout(
                    () => {

                        updateCarouselActiveCard();

                    },
                    80
                );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   INITIAL STATE
========================================================= */

window.addEventListener(
    "load",
    () => {

        updateCarouselActiveCard();

    }
);


/* =========================================================
   INFINITE MOBILE CAROUSEL
========================================================= */

const carouselGrid =
    document.getElementById("playlistGrid");

let carouselCards = [];
let carouselReady = false;


/* ---------------------------------------------------------
   Setup
--------------------------------------------------------- */

function setupInfiniteCarousel() {

    if (!carouselGrid) {
        return;
    }


    carouselCards = [
        ...carouselGrid.querySelectorAll(
            ".playlist-card"
        )
    ];


    if (carouselCards.length <= 1) {
        return;
    }


    /*
     * Clone last card → beginning
     * Clone first card → end
     */

    const firstClone =
        carouselCards[0].cloneNode(true);

    const lastClone =
        carouselCards[
            carouselCards.length - 1
        ].cloneNode(true);


    firstClone.dataset.carouselClone =
        "first";

    lastClone.dataset.carouselClone =
        "last";


    carouselGrid.appendChild(
        firstClone
    );

    carouselGrid.insertBefore(
        lastClone,
        carouselGrid.firstChild
    );


    carouselCards = [
        ...carouselGrid.querySelectorAll(
            ".playlist-card"
        )
    ];


    carouselReady = true;


    /*
     * Start on the REAL first card,
     * not the cloned last card.
     */

    requestAnimationFrame(() => {

        moveToCarouselIndex(
            1,
            false
        );

    });


    carouselGrid.addEventListener(
        "scroll",
        handleInfiniteScroll,
        {
            passive: true
        }
    );

}


/* ---------------------------------------------------------
   Move to card
--------------------------------------------------------- */

function moveToCarouselIndex(
    index,
    smooth = true
) {

    if (!carouselGrid) {
        return;
    }


    const card =
        carouselCards[index];


    if (!card) {
        return;
    }


    carouselGrid.scrollTo({

        left:
            card.offsetLeft -
            (
                carouselGrid.clientWidth -
                card.offsetWidth
            ) / 2,

        behavior:
            smooth
                ? "smooth"
                : "auto"

    });

}


/* ---------------------------------------------------------
   Infinite loop
--------------------------------------------------------- */

let infiniteScrollLock = false;


function handleInfiniteScroll() {

    if (
        !carouselReady ||
        infiniteScrollLock
    ) {
        return;
    }


    const firstRealIndex = 1;

    const lastRealIndex =
        carouselCards.length - 2;


    const firstRealCard =
        carouselCards[
            firstRealIndex
        ];

    const lastRealCard =
        carouselCards[
            lastRealIndex
        ];


    const currentScroll =
        carouselGrid.scrollLeft;


    const startBoundary =
        firstRealCard.offsetLeft -
        carouselGrid.clientWidth;


    const endBoundary =
        lastRealCard.offsetLeft;


    /*
     * Swiped to cloned LAST card
     * → jump to real LAST card
     */

    if (
        currentScroll <=
        startBoundary + 5
    ) {

        infiniteScrollLock = true;


        requestAnimationFrame(() => {

            moveToCarouselIndex(
                lastRealIndex,
                false
            );


            infiniteScrollLock = false;

        });

    }


    /*
     * Swiped to cloned FIRST card
     * → jump to real FIRST card
     */

    else if (
        currentScroll >=
        endBoundary + 5
    ) {

        infiniteScrollLock = true;


        requestAnimationFrame(() => {

            moveToCarouselIndex(
                firstRealIndex,
                false
            );


            infiniteScrollLock = false;

        });

    }

}


/* ---------------------------------------------------------
   Initialize after playlists are loaded
--------------------------------------------------------- */

const originalLoadPlaylists =
    loadPlaylists;


loadPlaylists = async function () {

    await originalLoadPlaylists();


    /*
     * Only activate carousel on mobile.
     */

    if (
        window.innerWidth <= 650
    ) {

        setupInfiniteCarousel();

    }

};
/* =========================================================
   FIX BROWSER / PHONE BACK
   Restore selection page correctly after history navigation
========================================================= */

window.addEventListener(
    "pageshow",
    () => {

        const page =
            document.querySelector(
                ".selection-page"
            );

        if (page) {

            page.classList.remove(
                "leaving"
            );

        }


        document
            .querySelectorAll(
                ".playlist-card"
            )
            .forEach(
                card => {

                    card.classList.remove(
                        "selected",
                        "not-selected"
                    );

                }
            );

    }
);