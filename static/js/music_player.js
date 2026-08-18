/* =========================================================
   REWIND
   MUSIC PLAYER
========================================================= */


const API_URL =
    "/api/playlists/";


const state = {
    songs: [],
    originalSongs: [],
    currentIndex: -1,
    isPlaying: false,
    isLoading: false,
    volume: 0.8,
    isShuffle: false
};



/* =========================================================
   DOM
========================================================= */

const musicPage =
    document.getElementById(
        "musicPage"
    );


const playlistId =
    musicPage
        ? musicPage.dataset.playlistId
        : null;


const audio =
    document.getElementById("audio");


const playlistTitle =
    document.getElementById(
        "playlistTitle"
    );


const playlistSubtitle =
    document.getElementById(
        "playlistSubtitle"
    );


const playlistVisual =
    document.getElementById(
        "playlistVisual"
    );


const backgroundLayer =
    document.getElementById(
        "backgroundLayer"
    );


const songList =
    document.getElementById(
        "songList"
    );


const player =
    document.getElementById(
        "player"
    );


const playerCover =
    document.getElementById(
        "playerCover"
    );


const playerTitle =
    document.getElementById(
        "playerTitle"
    );


const playerArtist =
    document.getElementById(
        "playerArtist"
    );


const playBtn =
    document.getElementById(
        "playBtn"
    );


const playIcon =
    document.getElementById(
        "playIcon"
    );


const previousBtn =
    document.getElementById(
        "previousBtn"
    );


const nextBtn =
    document.getElementById(
        "nextBtn"
    );


const currentTime =
    document.getElementById(
        "currentTime"
    );


const totalTime =
    document.getElementById(
        "totalTime"
    );


const progressContainer =
    document.getElementById(
        "progressContainer"
    );


const progressFill =
    document.getElementById(
        "progressFill"
    );


const progressDot =
    document.getElementById(
        "progressDot"
    );


const volumeBtn =
    document.getElementById(
        "volumeBtn"
    );


const volumeSlider =
    document.getElementById(
        "volumeSlider"
    );

const queueBtn =
    document.getElementById(
        "queueBtn"
    );

const queue =
    document.getElementById(
        "queue"
    );

const closeQueue =
    document.getElementById(
        "closeQueue"
    );

const queueItems =
    document.getElementById(
        "queueItems"
    );

/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    if (!audio) {

        console.error(
            "Audio element #audio not found."
        );

        return;
    }


    setupAudio();

    setupControls();

    audio.volume =
        state.volume;


    if (volumeSlider) {

        volumeSlider.value =
            state.volume;

    }


    await loadPlaylist();

}


/* =========================================================
   LOAD PLAYLIST
========================================================= */

async function loadPlaylist() {

    try {

        const response =
            await fetch(
                `${API_URL}${playlistId}/`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `API returned ${response.status}`
            );
        }

        const playlist =
            await response.json();

        state.playlist =
            playlist;

        state.songs =
            Array.isArray(
                playlist.songs
            )
                ? playlist.songs.filter(
                    song =>
                        song &&
                        song.audio_url
                )
                : [];
        state.originalSongs = [...state.songs];
        updatePlaylistInfo(
            playlist
        );

        renderSongs(
            state.songs,
            songList
        );

        /* AUTO PLAY FIRST SONG */

        if (
            state.songs.length > 0
        ) {
            await playSong(
                state.songs,
                0
            );
        }

    } catch (error) {

        console.error(
            "Failed to load playlist:",
            error
        );

        if (songList) {
            songList.innerHTML = `
                <div class="loading">
                    Failed to load playlist.
                </div>
            `;
        }
    }
}





/* =========================================================
   PLAYLIST INFO
========================================================= */

function updatePlaylistInfo(
    playlist
) {

    if (playlistTitle) {

        playlistTitle.textContent =
            playlist.title ||
            "Untitled";

    }


    if (playlistSubtitle) {

        playlistSubtitle.textContent =
            playlist.subtitle ||
            playlist.description ||
            "";

    }


    if (
        playlistVisual &&
        playlist.cover_url
    ) {

        playlistVisual.innerHTML = "";

        const image =
            document.createElement("img");

        image.src =
            playlist.cover_url;

        image.alt =
            playlist.title ||
            "Playlist";

        playlistVisual.appendChild(
            image
        );

    }


    if (
        backgroundLayer &&
        playlist.background_url
    ) {

        backgroundLayer.style.backgroundImage =
            `url("${playlist.background_url}")`;

    }

}


/* =========================================================
   RENDER SONGS
========================================================= */

function renderSongs(
    songs,
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!songs.length) {

        container.innerHTML = `
            <div class="loading">
                No songs in this playlist.
            </div>
        `;

        return;
    }


    songs.forEach(
        (song, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "song";


            row.dataset.index =
                String(index);


            const track =
                document.createElement(
                    "div"
                );

            track.className =
                "track-number";

            track.textContent =
                String(index + 1).padStart(
                    2,
                    "0"
                );


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "song-info";


            const title =
                document.createElement(
                    "strong"
                );

            title.textContent =
                song.title ||
                "Untitled";


            const artist =
                document.createElement(
                    "small"
                );

            artist.textContent =
                song.artist ||
                "Unknown Artist";


            info.appendChild(title);
            info.appendChild(artist);


            const duration =
                document.createElement(
                    "div"
                );

            duration.className =
                "duration";


            duration.textContent =
                "—";


            row.appendChild(track);
            row.appendChild(info);
            row.appendChild(duration);


            row.addEventListener(
                "click",
                () => {

                    playSong(
                        state.songs,
                        index
                    );

                }
            );


            container.appendChild(row);

        }
    );

}


/* =========================================================
   PLAY SONG
========================================================= */
async function playSong(
    songs,
    index
) {

    if (
        !Array.isArray(songs) ||
        !songs[index]
    ) {
        return;
    }

    const song =
        songs[index];

    if (!song.audio_url) {
        console.error(
            "No audio URL:",
            song
        );
        return;
    }

    state.songs =
        songs;

    state.currentIndex =
        index;

    /* Load selected song */

    audio.src =
        song.audio_url;

    /*
     * Prepare audio immediately
     */
    audio.load();

    /*
     * Always start from beginning
     */
    audio.currentTime = 0;

    /*
     * Update player UI
     */
    updatePlayer(
        song
    );

    /*
     * Highlight selected song
     */
    highlightCurrentSong();

    /*
     * Start playback
     */
    try {

        await audio.play();

        state.isPlaying =
            true;

        updatePlayButton();

    } catch (error) {

        console.warn(
            "Playback was blocked:",
            error
        );

        state.isPlaying =
            false;

        updatePlayButton();
    }
}

/* =========================================================
   UPDATE PLAYER
========================================================= */

function updatePlayer(
    song
) {

    if (playerTitle) {

        playerTitle.textContent =
            song.title ||
            "Untitled";

    }


    if (playerArtist) {

        playerArtist.textContent =
            song.artist ||
            "Unknown Artist";

    }


    if (playerCover) {

        playerCover.innerHTML =
            "";

        if (song.cover_url) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                song.cover_url;

            image.alt =
                song.title ||
                "";

            image.className =
                "player-cover-image";

            playerCover.appendChild(
                image
            );

        }

        else {

            playerCover.textContent =
                "♪";

        }

    }


    highlightCurrentSong();

}


/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!audio.src) {

        if (
            state.songs.length
        ) {

            playSong(
                state.songs,
                0
            );

        }

        return;
    }


    if (audio.paused) {

        audio.play();

        state.isPlaying =
            true;

    }

    else {

        audio.pause();

        state.isPlaying =
            false;

    }


    updatePlayButton();

}


function updatePlayButton() {

    if (!playIcon) {
        return;
    }


    playIcon.textContent =
        audio.paused
            ? "▶"
            : "Ⅱ";


    if (playBtn) {

        playBtn.setAttribute(
            "aria-label",
            audio.paused
                ? "Play"
                : "Pause"
        );

    }

}


/* =========================================================
   PREVIOUS
========================================================= */

function previousSong() {

    if (
        !state.songs.length
    ) {
        return;
    }


    let index =
        state.currentIndex - 1;


    if (index < 0) {

        index =
            state.songs.length - 1;

    }


    playSong(
        state.songs,
        index
    );

}


/* =========================================================
   NEXT
========================================================= */

function nextSong() {

    if (
        !state.songs.length
    ) {
        return;
    }


    let index =
        state.currentIndex + 1;


    if (
        index >=
        state.songs.length
    ) {

        index = 0;

    }


    playSong(
        state.songs,
        index
    );

}


/* =========================================================
   AUDIO EVENTS
========================================================= */

function setupAudio() {

    audio.addEventListener(
        "loadedmetadata",
        () => {

            if (totalTime) {

                totalTime.textContent =
                    formatTime(
                        audio.duration
                    );

            }

        }
    );


    audio.addEventListener(
        "timeupdate",
        updateProgress
    );


    audio.addEventListener(
        "play",
        () => {

            state.isPlaying =
                true;

            updatePlayButton();

        }
    );


    audio.addEventListener(
        "pause",
        () => {

            state.isPlaying =
                false;

            updatePlayButton();

        }
    );


    audio.addEventListener(
        "ended",
        () => {

            nextSong();

        }
    );


    audio.addEventListener(
        "error",
        () => {

            console.error(
                "Audio playback error:",
                audio.error
            );

        }
    );

}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {
    if (queueBtn) {

        queueBtn.addEventListener(
            "click",
            toggleQueue
        );

    }

    if (closeQueue) {

        closeQueue.addEventListener(
            "click",
            closeQueuePanel
        );

    }
    if (playBtn) {

        playBtn.addEventListener(
            "click",
            togglePlay
        );

    }


    if (previousBtn) {

        previousBtn.addEventListener(
            "click",
            previousSong
        );

    }


    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            nextSong
        );

    }


    if (volumeSlider) {

        volumeSlider.addEventListener(
            "input",
            () => {

                const value =
                    Number(
                        volumeSlider.value
                    );


                audio.volume =
                    value;


                state.volume =
                    value;


                if (value > 0) {

                    state.previousVolume =
                        value;

                }

            }
        );

    }


    if (volumeBtn) {

        volumeBtn.addEventListener(
            "click",
            toggleMute
        );

    }


    setupProgress();

}

/* =========================================================
   QUEUE
========================================================= */

function toggleQueue() {

    if (!queue) {
        return;
    }

    const isOpen =
        queue.classList.contains(
            "open"
        );

    if (isOpen) {

        closeQueuePanel();

    } else {

        openQueuePanel();

    }

}


function openQueuePanel() {

    if (!queue) {
        return;
    }

    renderQueue();

    queue.classList.add(
        "open"
    );

    queue.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeQueuePanel() {

    if (!queue) {
        return;
    }

    queue.classList.remove(
        "open"
    );

    queue.setAttribute(
        "aria-hidden",
        "true"
    );

}
/* =========================================================
   SEEK
========================================================= */

function setupProgress() {

    if (!progressContainer) {
        return;
    }


    progressContainer.addEventListener(
        "pointerdown",
        seekFromPointer
    );

}


function seekFromPointer(
    event
) {

    if (
        !audio.duration ||
        !Number.isFinite(
            audio.duration
        )
    ) {
        return;
    }


    const rect =
        progressContainer
            .getBoundingClientRect();


    if (!rect.width) {
        return;
    }


    const x =
        event.clientX -
        rect.left;


    const percentage =
        Math.max(
            0,
            Math.min(
                1,
                x / rect.width
            )
        );


    audio.currentTime =
        percentage *
        audio.duration;


    updateProgress();
}


/* =========================================================
   PROGRESS UPDATE
========================================================= */

function updateProgress() {

    if (
        !audio ||
        !Number.isFinite(
            audio.duration
        ) ||
        audio.duration <= 0
    ) {
        return;
    }


    const percentage =
        (
            audio.currentTime /
            audio.duration
        ) * 100;


    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    if (progressFill) {

        progressFill.style.width =
            `${safePercentage}%`;

    }


    if (progressDot) {

        progressDot.style.left =
            `${safePercentage}%`;

    }


    if (currentTime) {

        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

    }


    if (totalTime) {

        totalTime.textContent =
            formatTime(
                audio.duration
            );

    }

}


/* =========================================================
   MUTE
========================================================= */

function toggleMute() {

    if (!audio) {
        return;
    }


    if (audio.muted) {

        audio.muted =
            false;

        audio.volume =
            state.previousVolume ||
            0.8;

        state.volume =
            audio.volume;

    }

    else {

        if (
            audio.volume > 0
        ) {

            state.previousVolume =
                audio.volume;

        }

        audio.muted =
            true;

    }


    if (volumeSlider) {

        volumeSlider.value =
            audio.muted
                ? 0
                : audio.volume;

    }

}


/* =========================================================
   ACTIVE SONG
========================================================= */

function highlightCurrentSong() {

    if (!songList) {
        return;
    }


    const rows =
        songList.querySelectorAll(
            ".song"
        );


    rows.forEach(
        (row, index) => {

            row.classList.toggle(
                "active",
                index ===
                state.currentIndex
            );

        }
    );


 if (
        queue &&
        queue.classList.contains(
            "open"
        )
    ) {

        renderQueue();

    }
}

function renderQueue() {

    if (!queueItems) {
        return;
    }


    queueItems.innerHTML = "";


    if (!state.songs.length) {

        queueItems.innerHTML = `
            <div class="queue-empty">
                No songs in queue.
            </div>
        `;

        return;
    }


    state.songs.forEach(
        (song, index) => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "queue-item";


            if (
                index ===
                state.currentIndex
            ) {

                item.classList.add(
                    "active"
                );

            }


            const number =
                document.createElement(
                    "span"
                );

            number.className =
                "queue-number";


            number.textContent =
                String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                );


            const info =
                document.createElement(
                    "span"
                );

            info.className =
                "queue-info";


            const title =
                document.createElement(
                    "strong"
                );

            title.textContent =
                song.title ||
                "Untitled";


            const artist =
                document.createElement(
                    "small"
                );

            artist.textContent =
                song.artist ||
                "Unknown Artist";


            info.appendChild(
                title
            );

            info.appendChild(
                artist
            );


            item.appendChild(
                number
            );

            item.appendChild(
                info
            );


            item.addEventListener(
                "click",
                () => {

                    playSong(
                        state.songs,
                        index
                    );

                    closeQueuePanel();

                }
            );


            queueItems.appendChild(
                item
            );

        }
    );

}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    seconds
) {

    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        Math.floor(
            seconds % 60
        );


    return (
        minutes +
        ":" +
        String(
            remaining
        ).padStart(
            2,
            "0"
        )
    );

}


window.addEventListener("pageshow", (event) => {

    const navigationEntries =
        performance.getEntriesByType("navigation");

    const navigation =
        navigationEntries[0];

    if (
        event.persisted ||
        navigation?.type === "back_forward"
    ) {
        window.location.reload();
    }

});

/* ============================================================
   SHUFFLE BUTTON
============================================================ */

(() => {

    const button =
        document.getElementById(
            "shuffleBtn"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {


            console.log(
                "SHUFFLE BUTTON WORKING"
            );

            state.isShuffle =
                !state.isShuffle;


            button.classList.toggle(
                "active",
                state.isShuffle
            );


            button.setAttribute(
                "aria-pressed",
                String(
                    state.isShuffle
                )
            );


            if (state.isShuffle) {

                shuffleSongs();

            } else {

                restoreSongOrder();

            }

        }
    );

})();


function shuffleSongs() {

    const currentSong =
        state.songs[
            state.currentIndex
        ];


    const remaining =
        [...state.songs];


    if (
        state.currentIndex >= 0
    ) {

        remaining.splice(
            state.currentIndex,
            1
        );

    }


    /* Fisher-Yates shuffle */

    for (
        let i = remaining.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            remaining[i],
            remaining[j]
        ] = [
            remaining[j],
            remaining[i]
        ];

    }


    state.songs =
        currentSong
            ? [
                currentSong,
                ...remaining
            ]
            : remaining;


    state.currentIndex =
        currentSong
            ? 0
            : -1;


    renderSongs();

    

    

    

}


function restoreSongOrder() {

    const currentSong =
        state.songs[
            state.currentIndex
        ];


    state.songs =
        [...state.originalSongs];


    state.currentIndex =
        state.songs.findIndex(
            song =>
                song === currentSong
        );


    renderSongs();

    

    

    

}