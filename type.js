import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";


// Go back to homepage
document.getElementById("return-button").addEventListener("click", () => {
    window.open("./index.html", "_self");
});

const audio_player = document.getElementById("audio-player");
const play_button = document.getElementById("play-button");
const playing_button = document.getElementById("playing-button");
const next_button = document.getElementById("next-button");
const display_text = document.getElementById("display-text");
const typebox = document.getElementById("typebox");
const enter_button = document.getElementById("enter-button");
const timer = document.getElementById("timer");
const missedWords = document.getElementById("missed");
const allWords = document.getElementById("all");
const finished = document.getElementById("finished");

let current_audio_blob = ""; // Stores the most recent URL blob
let ans = ""; // Answer text
let wordList = null; // Word list
let pastWords = [];
let wrongWords = [];
let score = 0;
let ended = false;

export let t = "";

fetch("./words.txt")
    .then((response) => response.text())
    .then((text) => {
        wordList = text.split("\n").filter(i => i.length > 3).map(i => i.toUpperCase());
    })
    .catch(console.error);

// Initialize Polly client
const pollyClient = new PollyClient({
  region: "ap-southeast-1",
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: "ap-southeast-1" }),
    identityPoolId: "INSERT ID",
  }),
});

/**
 * Starts the challenge or plays the audio again.
 */
play_button.addEventListener("click", () => {
    // Game start
    if (current_audio_blob === "") {
        score = 0;
        next_button.style.display = "inline-block";
        play_button.innerText = "Play!";
        typebox.style.display = "inline-block";
        enter_button.style.display = "inline-block";
        display_text.style.display = "inline-block";
        moveOn(false, true);
        startTimer();
    } else {
        audio_player.play();
        afterPlay();
    }
});

const endGame = () => {
    ended = true;
    missedWords.style.display = "block";
    allWords.style.display = "block";
    missedWords.innerText = "You skipped the following words:\n" + (wrongWords.length > 0 ? wrongWords.reduce((a, b) => a + ", " + b) : "-");
    allWords.innerText = "All words:\n" + (pastWords.length > 0 ? pastWords.reduce((a, b) => a + ", " + b) : "-");


    play_button.innerText = "Start!";
    play_button.style.display = "none";
    playing_button.style.display = "none";
    next_button.style.display = "none";
    typebox.style.display = "none";
    enter_button.style.display = "none";
    timer.innerHTML = `Times up! Your score was ${score}.`
    finished.style.display = "inline-block";
    display_text.style.display = "none";


    // Reset
    if (current_audio_blob !== "")
      window.URL.revokeObjectURL(current_audio_blob);
    current_audio_blob = ""
    pastWords = [];
    wrongWords = [];
    score = 0;
    typebox.value = "";
}

const reset = () => {
    ended = false;
    play_button.style.display = "inline-block";
    finished.style.display = "none";
    missedWords.style.display = "none";
    allWords.style.display = "none";
    timer.innerHTML = "You will have 1 minute."
}

const startTimer = (min = 1, sec = 0) => {
    let id = null;
    const countDown = () => {
        timer.innerHTML = `You have ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')} left.`;
        if (min === 0 && sec === 0) {
            setTimeout(() => {
                endGame();
            }, 1000);
            clearInterval(id);
            return;
        }
        if (sec === 0) {
            --min;
            sec = 59;
        } else {
            --sec;
        }
    };
    countDown();
    id = setInterval(countDown, 1000);
}

/**
 * Skips the current word and moves on.
 */
next_button.addEventListener("click", () => {
    wrongWords.push(ans);
    moveOn(true);
});

/**
 * Things to do after the audio starts playing.
 */
const afterPlay = () => {
    typebox.focus();
    if (!ended) playing_button.style.display = "inline-block";
    play_button.style.display = "none";
}

/**
 * Updates audio source and `ans` to the next word.
 * @param skipped A Boolean value that indicates if the "next" button was pressed, i.e. the last one was skipped.
 * @param firstRound A Boolean value that indicates whether it is the first ever round.
 */
const moveOn = (skipped, firstRound = false) => {
    display_text.innerText = (skipped ? `The answer was ${ans}. ` : firstRound ? "" : `${ans} was correct! `)
        + (firstRound ? "" : "\nLet's move on to the next one! ") + "Type in your answer!";

    ans = wordList[Math.floor(Math.random() * wordList.length)];
    console.log(ans); // Debug mode
    pastWords.push(ans);
    fetchAudio().then(() => {});
}

/**
 * Fetches audio from Polly.
 */
const fetchAudio = async () => {
  const params = {
    OutputFormat: "mp3",
    Text: ans,
    VoiceId: "Joanna"
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const data = await pollyClient.send(command);

    const arr = await data.AudioStream.transformToByteArray();
    if (!data.AudioStream) {
        throw new Error("AudioStream is empty");
    }

    const blob = new Blob([arr], { type: 'audio/mp3' });
    audio_player.src = window.URL.createObjectURL(blob);

    if (current_audio_blob !== "")
      window.URL.revokeObjectURL(current_audio_blob);

    current_audio_blob = audio_player.src;

    setTimeout(() => audio_player.play(), 400);
    afterPlay();
  } catch (err) {
    console.error(err);
  }
};

/**
 * When the audio player finishes, show the "Play!" button and hide the "Playing..." button.
 */
audio_player.addEventListener("ended", () => {
    playing_button.style.display = "none";
    if (!ended) play_button.style.display = "inline-block";
})

/**
 * Remove any non-alphabetical characters and turn all small letters to capital in the input box.
 */
typebox.addEventListener("input", () => {
    const text = typebox.value;
    const last = text.substring(text.length - 1, text.length);
    if (!(last.match(/[a-zA-Z]/))) {
        typebox.value = text.substring(0, text.length - 1);
    } else if (last.match(/[a-z]/)) {
        typebox.value = text.substring(0, text.length - 1) + last.toUpperCase();
    }
});

/**
 * Handles text in the textbox when the Enter key is pressed.
 */
typebox.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
        check();
});

/**
 * Handles text in the textbox when the Enter button on-screen is pressed.
 */
enter_button.addEventListener("click", () => {
    check();
});

/**
 * Goes back to start screen.
 */
finished.addEventListener("click", () => {
    reset();
})

/**
 * Checks whether the input text is correct or not.
 */
let check = () => {
    const text = typebox.value.trim();
    typebox.value = "";
    if (ans === "") return;


    if (text === ans) {
        moveOn(false);
        ++score;
    }
    else {
        display_text.innerText = "Incorrect. Try again!";
        play_button.click();
    }
}

// Helps with GC apparently
window.addEventListener("beforeunload", () => {
    if (current_audio_blob !== "") window.URL.revokeObjectURL(current_audio_blob);
})
